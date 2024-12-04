import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatosService } from '../users/datos.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private url = environment.Api_URL;
  constructor(private http: HttpClient,private datos:DatosService) { }

  registrarVenta(venta: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
      const body = {
        ID_Usuario: parseInt(this.datos.getID_Uss() || '0'),
        Cantidad: venta.Cantidad,
        Total: venta.Total,
        ID_Metodo_Pago: venta.ID_Metodo_Pago
      };
    return this.http.post(`${this.url}sales`, body, { headers });
  }
  registrarDetalleVenta(id:number, detalleVenta: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.url}detailsales/${id}`, {Detalles:detalleVenta}, { headers });
  }

  registrarPagoPendiente(PagoPendiente: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    PagoPendiente.ID_Usuario = parseInt(this.datos.getID_Uss() || '0');
    return this.http.post(`${this.url}pagos-pendientes`, PagoPendiente, { headers });
  }
}
