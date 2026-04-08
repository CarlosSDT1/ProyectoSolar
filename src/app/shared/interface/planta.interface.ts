
export interface planta{

  id: number;
  created_at: string;
  nom:string;
  ubicacion: { latitude:number, longitude:number },
  user: string,
  foto?:string,
  favorite?: boolean,
  capacitat?: number,
}
