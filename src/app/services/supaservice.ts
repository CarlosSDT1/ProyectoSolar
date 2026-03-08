import { HttpClient, HttpHeaders } from '@angular/common/http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, debounceTime, distinctUntilChanged, from, Observable, switchMap } from 'rxjs';
import { planta } from '../interface/planta.interface';
import { registre } from '../interface/registre.interface';
import { AuthService } from './authservice';

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

  getPlantasObservable(): Observable<planta[]> {
    return this.plantas$;
  }

  async getPlantesSupabase(){
    const { data, error } = await this.supabase.from('plantes').select('*').order('id',{ ascending: true });
    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
    return data;
  }

  async getPlantesSupabaseByName(searchString: string){
    const { data, error } = await this.supabase.from('plantes').select('*').ilike('nom', `%${searchString}%`).order('nom', { ascending: true});
    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
    return data;
  }

  async getPlantesSupabaseFavoritos(){
    const session = this.authService.loggedSubject.getValue();
    if (!session) {
      console.log('No hay sesión activa, retornando array vacío');
      return [];
    }

    const { data, error } = await this.supabase.from('plantes').select('*').order('favorite', { ascending: false }).order('id',{ ascending: true });
    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
    return data || [];
  }

  getPlantesObservable(): Observable<planta[]> {
    return from(this.getPlantesSupabase())
  }

  async getPlantaByIDSupabase(id:number){
    const { data, error } = await this.supabase.from('plantes').select('*').eq('id', id);
    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
    return data;
  }

  getPlantaByIdObservable(id:number): Observable<planta[]> {
    return from(this.getPlantaByIDSupabase(id))
  }

  getEcho(data: string){
    return data
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

  async getRegistresSupabase(plantaId:number, page: number = 1, itemsPerPage:number ): Promise<{
    data: registre[];
    total: number;
    pages: number;
  }>{

    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

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
      .range(from,to);

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

  getPlantasPaginated(page: number = 1, itemsPerPage: number): Observable<{
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
  async createPlanta(planta: Omit<planta, 'id' | 'created_at'>): Promise<planta> {
  const { data, error } = await this.supabase
    .from('plantes')
    .insert([planta])
    .select()
    .single();

  if (error) {
    console.error('Error creando planta:', error);
    throw error;
  }

  await this.loadInitialPlantes();
  return data;
}

async updatePlanta(id: number, planta: Partial<planta>): Promise<planta> {
  const { data, error } = await this.supabase
    .from('plantes')
    .update(planta)
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

async uploadImage(file: File, plantaId: number): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${plantaId}-${Date.now()}.${fileExt}`;
  const filePath = `plantas/${fileName}`;

  const { error: uploadError } = await this.supabase.storage
    .from('imagenes') // Asegúrate de que este bucket existe
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

async getProfilesSupabase(): Promise<{ id: string }[]> {
  const { data, error } = await this.supabase
    .from('profiles')
    .select('id')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error obteniendo profiles:', error);
    throw error;
  }

  return data || [];
}

  getSearchString(): string {
    return this.searchSubject.getValue();
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

getSearchObservable(): Observable<string> {
  return this.searchSubject.asObservable();
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
}
