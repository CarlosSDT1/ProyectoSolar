import { HttpClient, HttpHeaders } from '@angular/common/http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { planta } from '../interface/planta.interface';

@Injectable({
  providedIn: 'root'
})
export class Supaservice {

  private http = inject(HttpClient);
  private supabase: SupabaseClient;
  constructor() {
    this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
  }

  // Métodos para interactuar con Supabase
  getPlantes(): Observable<planta[]> {

    return this.http.get<planta[]>(
    environment.SUPABASE_URL + '/rest/v1/plantes?select=*',
    {
      headers: new HttpHeaders({
        'apikey': environment.SUPABASE_KEY,
        'Authorization': `Bearer ${environment.SUPABASE_KEY}`,
      })
    }
  )
  }

  getPlantaById(id: number): Observable<planta[]> {
  return this.http.get<planta[]>(
    `${environment.SUPABASE_URL}/rest/v1/plantes?id=eq.${id}&select=*`,
    {
      headers: new HttpHeaders({
        'apikey': environment.SUPABASE_KEY,
        'Authorization': `Bearer ${environment.SUPABASE_KEY}`,
      })
    }
  );



}





  getEcho(data: string){
    return data
  }

}
