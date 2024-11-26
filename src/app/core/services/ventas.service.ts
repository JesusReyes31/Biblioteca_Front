import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private url = 'http://localhost:9500/';
  constructor(private http: HttpClient) { }

  registrarVenta(venta: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    const body = {
      ID_Usuario: parseInt(sessionStorage.getItem('ID_Uss') || '0'),
      Cantidad: venta.Cantidad,
      Total: venta.Total,
    };
    console.log('Este es el body',body);
    return this.http.post(`${this.url}sales`, body, { headers });
  }
  registrarDetalleVenta(id:number, detalleVenta: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.url}detailsales/${id}`, {Detalles:detalleVenta}, { headers });
  }

  registrarPagoPendiente(PagoPendiente: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    PagoPendiente.ID_Usuario = parseInt(sessionStorage.getItem('ID_Uss') || '0');
    return this.http.post(`${this.url}pagos-pendientes`, PagoPendiente, { headers });
  }
}
