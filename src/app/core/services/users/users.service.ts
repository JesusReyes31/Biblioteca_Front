import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, Subject, throwError, tap } from 'rxjs';
import { DatosService } from './datos.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.Api_URL;
  private carritoActualizadoSource = new Subject<void>();
  carritoActualizado = this.carritoActualizadoSource.asObservable();
  constructor(private http:HttpClient,private datos:DatosService) { }

  //Verificar el Token para autorizacion de una acción
  verifyToken(Token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}auth/verify-token/${Token}`);
  }

  //Paginas principales de usuarios
  //Principal de cliente, inventario, prestamos
  getLibrosRecomendados(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}others/pringen`);
  }
  //Principal Administrador de Sucursal 
  getEstadisticasAdminSucursal(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}others/prinadminsuc`,{ headers });
  }
  //Principal Administrador
  getEstadisticasAdmin(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}others/prinadmin`,{ headers });
  }



  //Obtener datos del usuario
  getUserInfo(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}users/${this.datos.getID_Uss()}`,{headers});
  }

  updateUserInfo(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}users/${this.datos.getID_Uss()}`, userData,{headers});
  }

  updateUserImage(id: number, imageData: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}users/image/${id}`, imageData,{headers});
  }

  updatePassword(passwordData: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
      return this.http.put(`${this.apiUrl}users/cambiar/contra/${this.datos.getID_Uss()}`, passwordData,{headers});
  }
  //Traer la sucursal del usuario
  getSucursal(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}users/sucursal/${this.datos.getID_Uss()}`,{headers});
  }

  //Generos
  getGeneros():Observable<any>{
    return this.http.get<any>(`${this.apiUrl}others/genres`)
  }
  getBooksByGenre(genero: string): Observable<any> {
    return this.http.get(`${this.apiUrl}others/booksgenre/${genero}`);
  }
  getBooks(): Observable<any> {
    if(this.datos.getID_Sucursal()){
      return this.http.get(`${this.apiUrl}books/${this.datos.getID_Sucursal()}`);
    }else{
      return this.http.get(`${this.apiUrl}books`);
    }
  }

  //Reservas
  getReservas(): Observable<any> {
    const token = this.datos.getAuthToken(); // Obtén el token del sessionStorage
    const id = this.datos.getID_Uss() ? parseInt(this.datos.getID_Uss()) : 0;
    const headers = new HttpHeaders({
      'authorization': `${token}`, // Añade el token en el encabezado Authorization
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.apiUrl}reservas/ByID/${id}`,{headers});
  }
  reservarLibro(ID_Ejemplar: number, ID_usuario: number): Observable<any> {
    const headers = new HttpHeaders({ 
      'authorization': `${this.datos.getAuthToken()}`,
      'Content-Type': 'application/json' 
    });
    
    return this.http.post(`${this.apiUrl}reservas`, {
      ID_Ejemplar,
      ID_usuario
    }, { headers });
  }
  deshacerReserva(id:string): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}reservas/${id}`, { headers });
  }
  //Para obtener las reservas por ID de usuario personal Prestamos
  getReservasByID(id:string): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}reservas/ByID/${id}`, { headers });
  }

  //Prestar Libro
  prestarLibro(idEjemplar: string, idUsuario: number): Observable<any> {
    const headers = new HttpHeaders({ 
      'authorization': `${this.datos.getAuthToken()}`,
      'Content-Type': 'application/json' 
    });
    return this.http.post(`${this.apiUrl}prestamos`, {
      idEjemplar,
      idusuario: idUsuario
    }, { headers });
  }
  getPrestamos(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}prestamos`, { headers });
  }

  //Obtener libro disponible
  getLibroDisponible(id: string): Observable<any> {
    const headers = new HttpHeaders({
        'authorization': `${this.datos.getAuthToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.get(`${this.apiUrl}books/obtener/disponibles/${id}`, { headers });
  }
  //Devolver Libro
  devolverLibro(id: string,idUsuario:number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}prestamos/${id}`, { ID_usuario: idUsuario }, { headers });
  }

  //Historial de prestamos
  getLoanHistory(): Observable<any[]> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    const id = this.datos.getID_Uss();
    return this.http.get<any[]>(`${this.apiUrl}prestamos/${id}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404 && error.error?.message === 'No se encontraron prestamos para este usuario.') {
          return throwError(() => new Error('No se encontraron prestamos para este usuario.'));
        }
        return throwError(() => new Error('Error al obtener el historial de prestamos del usuario.'));
      })
    );
  }

  //Traer libros por busqueda
  getBooksByName(clave: string): Observable<any> {
    return this.http.post(`${this.apiUrl}others/search`,{clave:clave});
  }

  //Historial de Compras
  getPurchaseHistory(): Observable<any[]> {
    const headers = new HttpHeaders({authorization: `${this.datos.getAuthToken()}`,'Content-Type': 'application/json'});
    const id = this.datos.getID_Uss();
    return this.http.get<any[]>(`${this.apiUrl}sales/sale/${id}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          // Rechazar con un mensaje personalizado si no hay ventas
          return throwError(() => new Error('No se encontraron ventas para este usuario.'));
        }
        return throwError(() => new Error('Error al obtener el historial de compras.'));
      })
    );
  }
  //Carrito de compras
  getCarrito(): Observable<any> {
    const idUsuario = this.datos.getID_Uss();
    const headers = new HttpHeaders({ 
      'authorization': `${this.datos.getAuthToken()}`,
      'Content-Type': 'application/json' 
    });
    return this.http.get(`${this.apiUrl}cart/${idUsuario}`, { headers });
  }
  agregarAlCarrito(ID_Usuario: number, ID_Ejemplar: number, Cantidad: number): Observable<any> {
    const headers = new HttpHeaders({ 
      'authorization': `${this.datos.getAuthToken()}`,
      'Content-Type': 'application/json' 
    });
    
    return this.http.post(`${this.apiUrl}cart`, {
      ID_Usuario,
      ID_Ejemplar,
      Cantidad
    }, { headers });
  }
  actualizarCantidadCarrito(id: number, cantidad: number): Observable<any> {
    const headers = new HttpHeaders({ 
      'authorization': `${this.datos.getAuthToken()}`,
      'Content-Type': 'application/json' 
    });
    return this.http.put(`${this.apiUrl}cart/${id}`, { cantidad }, { headers })
      .pipe(
        tap(() => this.carritoActualizadoSource.next())
      );
  }

  deleteCarrito(Id: string): Observable<any> {
    const idUsuario = this.datos.getID_Uss();
    const headers = new HttpHeaders({ 
      'authorization': `${this.datos.getAuthToken()}`,
      'Content-Type': 'application/json' 
    });
    return this.http.delete(`${this.apiUrl}cart/${Id}`, { headers })
      .pipe(
        tap(() => this.carritoActualizadoSource.next())
      );
  }
  deleteAllCarrito(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    const id = this.datos.getID_Uss();
    return this.http.delete(`${this.apiUrl}cart/all/${id}`,{ headers });
  }


  //Credencial
  getCredencial(): Observable<Blob> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}others/cred/${this.datos.getID_Uss()}`,{Nombre:this.datos.getNombre()}, { headers:headers,responseType: 'blob' });
  }


  //Reseñas de los Libros
  getResenasLibro(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}resenas/all/${id}`);
  }
  verificarPrestamoDevuelto(idUsuario: string, idLibro: string) {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}prestamos/devueltos/${idUsuario}/${idLibro}`,{ headers });
  }
  
  obtenerResenaUsuario(idUsuario: string, idLibro: string) {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}resenas/usuario/${idUsuario}/${idLibro}`,{ headers });
  }
  
  crearResena(resenaData: any) {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.post<{ID_Resena: number}>(`${this.apiUrl}resenas`, resenaData, { headers });
  }
  
  actualizarResena(resenaData: any) {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.put<{ID_Resena: number}>(`${this.apiUrl}resenas/${resenaData.ID_Resena}`, resenaData,{ headers });
  }
  
  eliminarResena(idResena: number) {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}resenas/${idResena}`,{ headers });
  }


  //Administración de Libros
  addBook(book: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}books`, book, { headers });
  }

  updateBook(id: string, book: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}books/${id}/${this.datos.getID_Sucursal()}`, book, { headers });
  }

  deleteBook(id: string): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}books/${id}`, { headers });
  }

  //Usuarios 
  //Tipo de usuarios
  getTipoUsuarios(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}users/tipo`, { headers });
  }
  //Todos usuarios que tiene acceso 
  getUsuarios(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}users`, { headers });
  }
  addUser(body: any): Observable<any> {
    const headers = new HttpHeaders({ 
      'authorization': `${this.datos.getAuthToken()}`,
      'Content-Type': 'application/json' 
    });
    return this.http.post(`${this.apiUrl}auth/register`, body, { headers }).pipe(
      catchError(error => {
        if (error.error && typeof error.error === 'string') {
          return throwError(() => error.error);
        }
        if (error.error?.message) {
          return throwError(() => error.error.message);
        }
        return throwError(() => 'Error al registrar usuario');
      })
    );
  }
  updateUser(id:number,body:any):Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}users/${id}`,body, { headers });
  }
  deleteUser(id:number):Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}users/${id}`, { headers });
  }


  //Ventas por entregar
  getVentasPorEntregar(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}sales/pending`, { headers });
  }

  notificarActualizacionCarrito() {
    this.carritoActualizadoSource.next();
  }

  //Métodos de pago
  getTarjetas(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}pagos/${this.datos.getID_Uss()}`, { headers });
  }
  agregarTarjeta(tarjeta: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    const body = {
      ID_Usuario: parseInt(this.datos.getID_Uss()),
      Nombre_Titular: tarjeta.Nombre_Titular,
      Numero_Tarjeta: tarjeta.Numero_Tarjeta,
      Fecha_Vencimiento: tarjeta.Fecha_Vencimiento,
      Tipo_Tarjeta: tarjeta.Tipo_Tarjeta
    };
    return this.http.post(`${this.apiUrl}pagos/`, body, { headers });
  }

  // Actualizar tarjeta
  actualizarTarjeta(tarjeta: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' })
    return this.http.put(`${this.apiUrl}pagos/`, tarjeta, { headers });
  }

  // Eliminar tarjeta
  eliminarTarjeta(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}pagos/${id}`, { headers });
  }

  activateAccount(token: string) {
    return this.http.get(`${this.apiUrl}auth/activate/${token}`);
  }


  //Sucursales
  getSucursales(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}sucursales`, { headers })
    .pipe(
      catchError(error => {
      console.error('Error al obtener sucursales:', error);
      return throwError(() => error);
    })
  );
}

  getOneSucursal(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}sucursales/${id}`, { headers })
    .pipe(
      catchError(error => {
        console.error('Error al obtener sucursal:', error);
        return throwError(() => error);
      })
    );
  }

  addSucursal(sucursalData: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}sucursales`, sucursalData, { headers })
      .pipe(
      catchError(error => {
        if (error.error?.message) {
          return throwError(() => error.error.message);
        }
        console.error('Error al agregar sucursal:', error);
        return throwError(() => 'Error al agregar sucursal');
      })
    );
  }

  updateSucursal(id: number, sucursalData: any): Observable<any> {
    const headers = new HttpHeaders({ 
      'authorization': `${this.datos.getAuthToken()}`,
      'Content-Type': 'application/json' 
    });
    return this.http.put(`${this.apiUrl}sucursales/${id}`, sucursalData, { headers }).pipe(
      catchError(error => {
        if (error.error && typeof error.error === 'string') {
          return throwError(() => error.error);
        }
        if (error.error?.message) {
          return throwError(() => error.error.message);
        }
        return throwError(() => 'Error al actualizar sucursal');
      })
    );
  }

  deleteSucursal(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}sucursales/${id}`, { headers })
    .pipe(
      catchError(error => {
        if (error.error?.message) {
          return throwError(() => error.error.message);
        }
        console.error('Error al eliminar sucursal:', error);
        return throwError(() => 'Error al eliminar sucursal');
      })
      );
  }

  //ID_Sucursal de Personal
  getIDSucursalPersonal(id: number): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}personal/${id}`, { headers });
  }

  // Obtener detalle de una venta específica con sus libros
  getDetalleVenta(idVenta: number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}detailsales/${idVenta}`, { headers });
  }
  getVentasByID(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}sales/${id}`, { headers });
  }
  //Actualizar el estado de entrega de la venta
  actualizarEntregaVenta(venta: any) {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}sales/${venta.ID_Venta}`, {Entregado: 'Si'}, { headers });
  }

  // Procesar el pago en sucursal
  // procesarPagoSucursal(id: number): Observable<any> {
  //   const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
  //   return this.http.post<any>(`${this.apiUrl}pagos-pendientes/${id}`, { headers });
  // }
  //Eliminar Pago Pendiente
  eliminarPagoPendiente(id: number,codigo: string): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}pagos-pendientes/${id}/${codigo}`, { headers });
  }


  //Recibo de compra
  getReciboCompra(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}doctos/recibo/${id}`, { headers,responseType: 'blob' });
  }

  //Exportar a PDF
  exportToPDF(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}doctos/prestamos`,{ headers,responseType: 'blob' });
  }
  generarReporte(tipo: string, fechaInicio: string, fechaFin: string): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    const body = { tipo, fechaInicio, fechaFin };
    return this.http.post(`${this.apiUrl}doctos/reporte`, body, { headers,responseType: 'arraybuffer'  });
  }
  generarFactura(id: number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}doctos/factura/${id}`, { headers,responseType: 'blob' });
  }
  enviarFacturaPorCorreo(id: string) {
    const headers = new HttpHeaders({ 'authorization':`${this.datos.getAuthToken()}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}doctos/enviar-factura`, {id}, { headers });
  }
}
