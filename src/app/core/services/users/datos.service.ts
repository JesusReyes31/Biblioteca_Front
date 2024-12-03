import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosService {
  private ID_Uss: string = '';
  private ID_Sucursal: string = '';
  private Nombre: string = '';
  private authToken: string = '';
  private tipoUss: string = '';
  private Imagen:string = '';

  // Getters
  public getID_Uss(): string {
    return this.ID_Uss;
  }

  public getID_Sucursal(): string {
    return this.ID_Sucursal;
  }

  public getNombre(): string {
    return this.Nombre;
  }

  public getAuthToken(): string {
    return this.authToken;
  }

  public getTipoUss(): string {
    return this.tipoUss;
  }
  
  public getImagen(): string {
    return this.Imagen;
  }

  // Set data with a JSON
  public setData(data: { ID_Uss?: string, ID_Sucursal?: string, Nombre?: string, authToken?: string, tipoUss?: string, Imagen?:string }): void {
    this.ID_Uss = data.ID_Uss ?? this.ID_Uss;
    this.ID_Sucursal = data.ID_Sucursal ?? this.ID_Sucursal;
    this.Nombre = data.Nombre ?? this.Nombre;
    this.authToken = data.authToken ?? this.authToken;
    this.tipoUss = data.tipoUss ?? this.tipoUss;
    this.Imagen = data.Imagen ?? this.Imagen;
  }

  // Clean method
  public clean(): void {
    this.ID_Uss = '';
    this.ID_Sucursal = '';
    this.Nombre = '';
    this.authToken = '';
    this.tipoUss = '';
    this.Imagen = '';
  }
}
