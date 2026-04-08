import { HttpClient, HttpHeaders } from '@angular/common/http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, debounceTime, distinctUntilChanged, from, Observable, switchMap } from 'rxjs';

import { AuthService } from '../../features/auth/services/authservice';
import { planta } from '../../shared/interface/planta.interface';
import { environment } from '../../../environments/environment';
import { registre } from '../../shared/interface/registre.interface';

@Injectable({
  providedIn: 'root'
})
export class Supaservice {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private supabase: SupabaseClient;

  private plantasSubject = new BehaviorSubject<planta[]>([]);
  plantas$ = this.plantasSubject.asObservable();

  private searchSubject = new BehaviorSubject<string>('');

  constructor() {
    this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);

    this.authService.authChangesObservable().subscribe(({ event, session }) => {
      console.log('Auth event en Supaservice:', event, 'Session:', session);

      if (event === 'SIGNED_IN') {
        console.log('Usuario ha iniciado sesión, recargando plantas...');
        setTimeout(() => {
          this.loadInitialPlantes();
        }, 200);
      }

      if (event === 'SIGNED_OUT') {
        console.log('Usuario ha cerrado sesión, limpiando plantas...');
        this.plantasSubject.next([]);
      }
    });

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(searchTerm => this.searchPlantes(searchTerm))
    ).subscribe({
      next: (plantas) => {
        this.plantasSubject.next(plantas);
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
      }
    });

    this.loadInitialPlantes();
  }

  async loadInitialPlantes() {
    try {
      const session = this.authService.loggedSubject.getValue();
      if (!session) {
        console.log('No hay sesión activa, no se cargan plantas');
        return;
      }

      console.log('Cargando plantas iniciales...');
      const plantas = await this.getPlantesSupabaseFavoritos();
      this.plantasSubject.next(plantas);
      console.log('Plantas cargadas:', plantas.length);
    } catch (error) {
      console.error('Error cargando plantas iniciales:', error);
    }
  }

  async searchPlantes(searchTerm: string): Promise<planta[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      return this.getPlantesSupabaseFavoritos();
    }

    const searchString = searchTerm.toLowerCase();
    const { data, error } = await this.supabase
      .from('plantes')
      .select('*')
      .ilike('nom', `%${searchString}%`)
      .order('favorite', { ascending: false })
      .order('nom', { ascending: true });

    if (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    }

    return data || [];
  }

  setSearchString(searchString: string): void {
    this.searchSubject.next(searchString);
  }

  getSearchString(): string {
    return this.searchSubject.getValue();
  }

  getSearchObservable(): Observable<string> {
    return this.searchSubject.asObservable();
  }

  getPlantasObservable(): Observable<planta[]> {
    return this.plantas$;
  }

  getPlantesObservable(): Observable<planta[]> {
    return from(this.getPlantesSupabase());
  }

  async getPlantesSupabase() {
    const { data, error } = await this.supabase
      .from('plantes')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }

    return data;
  }

  async getPlantesSupabaseByName(searchString: string) {
    const { data, error } = await this.supabase
      .from('plantes')
      .select('*')
      .ilike('nom', `%${searchString}%`)
      .order('nom', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }

    return data;
  }

  async getPlantesSupabaseFavoritos() {
    const session = this.authService.loggedSubject.getValue();
    if (!session) {
      console.log('No hay sesión activa, retornando array vacío');
      return [];
    }

    const { data, error } = await this.supabase
      .from('plantes')
      .select('*')
      .order('favorite', { ascending: false })
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }

    return data || [];
  }

  async getPlantaByIDSupabase(id: number) {
    const { data, error } = await this.supabase
      .from('plantes')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }

    return data;
  }

  getPlantaByIdObservable(id: number): Observable<planta[]> {
    return from(this.getPlantaByIDSupabase(id));
  }

  getEcho(data: string) {
    return data;
  }

  async makeFavorite(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('plantes')
      .update({ favorite: true })
      .eq('id', id);

    if (error) throw error;

    this.loadInitialPlantes();
  }

  async unMakeFavorite(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('plantes')
      .update({ favorite: false })
      .eq('id', id);

    if (error) throw error;

    this.loadInitialPlantes();
  }

  async getRegistresSupabase(
    plantaId: number,
    page: number = 1,
    itemsPerPage: number
  ): Promise<{
    data: registre[];
    total: number;
    pages: number;
  }> {
    const fromIndex = (page - 1) * itemsPerPage;
    const toIndex = fromIndex + itemsPerPage - 1;

    const { count, error: countError } = await this.supabase
      .from('registres')
      .select('*', { count: 'exact', head: true })
      .eq('planta', plantaId);

    if (countError) {
      console.error('Error contando registros:', countError);
      throw countError;
    }

    const { data, error } = await this.supabase
      .from('registres')
      .select('*')
      .eq('planta', plantaId)
      .limit(200)
      .order('created_at', { ascending: true })
      .range(fromIndex, toIndex);

    if (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    }

    const total = count || 0;
    const pages = Math.ceil(total / itemsPerPage);

    return {
      data: data || [],
      total,
      pages
    };
  }

  async getAllRegistresByPlanta(plantaId: number): Promise<registre[]> {
    const { data, error } = await this.supabase
      .from('registres')
      .select('*')
      .eq('planta', plantaId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error obteniendo todos los registros para gráfico:', error);
      throw error;
    }

    return data || [];
  }

  getPlantasPaginated(
    page: number = 1,
    itemsPerPage: number
  ): Observable<{
    data: planta[];
    total: number;
    pages: number;
  }> {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    return from(
      (async () => {
        const { count, error: countError } = await this.supabase
          .from('plantes')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Error contando plantas:', countError);
          throw countError;
        }

        const { data, error } = await this.supabase
          .from('plantes')
          .select('*')
          .order('id', { ascending: true })
          .range(start, end);

        if (error) {
          console.error('Error obteniendo plantas paginadas:', error);
          throw error;
        }

        const total = count || 0;
        const pages = Math.ceil(total / itemsPerPage);

        return {
          data: data || [],
          total,
          pages
        };
      })()
    );
  }

  getPlantasPaginatedFiltered(
    searchTerm: string,
    page: number = 1,
    itemsPerPage: number
  ): Observable<{
    data: planta[];
    total: number;
    pages: number;
  }> {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    return from(
      (async () => {
        const search = searchTerm.trim();

        let countQuery = this.supabase
          .from('plantes')
          .select('*', { count: 'exact', head: true });

        let dataQuery = this.supabase
          .from('plantes')
          .select('*');

        if (search !== '') {
          countQuery = countQuery.ilike('nom', `%${search}%`);
          dataQuery = dataQuery.ilike('nom', `%${search}%`);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          console.error('Error contando plantas filtradas:', countError);
          throw countError;
        }

        const { data, error } = await dataQuery
          .order('id', { ascending: true })
          .range(start, end);

        if (error) {
          console.error('Error obteniendo plantas filtradas:', error);
          throw error;
        }

        const total = count || 0;
        const pages = Math.ceil(total / itemsPerPage);

        return {
          data: data || [],
          total,
          pages
        };
      })()
    );
  }

  async createPlanta(plantaData: Omit<planta, 'id' | 'created_at'>): Promise<planta> {
    const { data, error } = await this.supabase
      .from('plantes')
      .insert([plantaData])
      .select()
      .single();

    if (error) {
      console.error('Error creando planta:', error);
      throw error;
    }

    await this.loadInitialPlantes();
    return data;
  }

  async updatePlanta(id: number, plantaData: Partial<planta>): Promise<planta> {
    const { data, error } = await this.supabase
      .from('plantes')
      .update(plantaData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando planta:', error);
      throw error;
    }

    await this.loadInitialPlantes();
    return data;
  }

  async deletePlanta(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('plantes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando planta:', error);
      throw error;
    }

    await this.loadInitialPlantes();
  }

  async createRegistre(registreData: Omit<registre, 'id' | 'created_at'>): Promise<registre> {
    const { data, error } = await this.supabase
      .from('registres')
      .insert([registreData])
      .select()
      .single();

    if (error) {
      console.error('Error creando registro:', error);
      throw error;
    }

    return data;
  }

  async updateRegistre(id: number, registreData: Partial<registre>): Promise<registre> {
    const { data, error } = await this.supabase
      .from('registres')
      .update(registreData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando registro:', error);
      throw error;
    }

    return data;
  }

  async deleteRegistre(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('registres')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando registro:', error);
      throw error;
    }
  }

  async uploadImage(file: File, plantaId: number): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${plantaId}-${Date.now()}.${fileExt}`;
  const filePath = `plantas/${fileName}`;

  const { error: uploadError } = await this.supabase.storage
    .from('imagenes')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error subiendo imagen:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = this.supabase.storage
    .from('imagenes')
    .getPublicUrl(filePath);

  return publicUrl;
}

  async getProfilesSupabase(): Promise<{ id: string; username: string | null }[]> {
  const { data, error } = await this.supabase
    .from('profiles')
    .select('id, username')
    .order('username', { ascending: true });

  if (error) {
    console.error('Error obteniendo profiles:', error);
    throw error;
  }

  return data || [];
}

  async getMyProfile(userId: string): Promise<{ id: string; role: string } | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }

    return data;
  }

  async getProfileById(userId: string): Promise<{
  id: string;
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
  website: string | null;
  role: string;
} | null> {
  const { data, error } = await this.supabase
    .from('profiles')
    .select('id, username, avatar_url, full_name, website, role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error obteniendo profile:', error);
    return null;
  }

  return data;
}

async updateProfile(
  userId: string,
  profileData: {
    username?: string | null;
    avatar_url?: string | null;
    full_name?: string | null;
    website?: string | null;
  }
) {
  const { data, error } = await this.supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando profile:', error);
    throw error;
  }

  return data;
}

async uploadAvatar(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await this.supabase.storage
    .from('imagenes')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error subiendo avatar:', uploadError);
    throw uploadError;
  }

  const {
    data: { publicUrl }
  } = this.supabase.storage
    .from('imagenes')
    .getPublicUrl(filePath);

  return publicUrl;
}
}
