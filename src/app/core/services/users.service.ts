import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:9500/';
  constructor(private http:HttpClient) { }

  //Verificar el Token para autorizacion de una acción
  verifyToken(Token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}auth/verify-token/${Token}`);
  }

  //Obtener datos del usuario
  getUserInfo(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}users/${sessionStorage.getItem('ID_Uss')}`,{headers});
  }

  updateUserInfo(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}/users/profile`, userData,{headers});
  }

  updateUserImage(id: number, imageData: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}users/image/${id}`, imageData,{headers});
  }

  updatePassword(passwordData: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
      return this.http.put(`${this.apiUrl}/users/profile/password`, passwordData,{headers});
  }
  //Traer la sucursal del usuario
  getSucursal(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}users/sucursal/${sessionStorage.getItem('ID_Uss')}`,{headers});
  }

  //Generos
  getGeneros():Observable<any>{
    return this.http.get<any>(`${this.apiUrl}others/genres`)
  }
  getBooksByGenre(genero: string): Observable<any> {
    return this.http.get(`${this.apiUrl}others/booksgenre/${genero}`);
  }
  getBooks(): Observable<any> {
    return this.http.get(`${this.apiUrl}books`);
  }

  //Reservas
  getReservas(): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Obtén el token del sessionStorage
    const id = sessionStorage.getItem('ID_Uss') ? parseInt(sessionStorage.getItem('ID_Uss') || '0') : 0;
    const headers = new HttpHeaders({
      'authorization': `${token}`, // Añade el token en el encabezado Authorization
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.apiUrl}reservas/ByID/${id}`,{headers});
  }
  reservarLibro(idUsuario: string, idLibro: string): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}reservas`, { ID_usuario: idUsuario, ID_libro: idLibro },{headers});
  }
  deshacerReserva(id:string): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}reservas/${id}`, { headers });
  }
  //Para obtener las reservas por ID de usuario personal Prestamos
  getReservasByID(id:string): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}reservas/ByID/${id}`, { headers });
  }

  //Prestar Libro
  prestarLibro(idLibro: string, idUsuario: number): Observable<any> {
    const headers = new HttpHeaders({
        'authorization': `${sessionStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
    });
    
    const body = {
        idlibro: idLibro,
        idusuario: idUsuario
    };

    return this.http.post(`${this.apiUrl}prestamos`, body, { headers });
  }
  getPrestamos(): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}prestamos`, { headers });
  }

  //Obtener libro disponible
  getLibroDisponible(idLibro: string): Observable<any> {
    const headers = new HttpHeaders({
        'authorization': `${sessionStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
    });
    return this.http.get(`${this.apiUrl}books/${idLibro}`, { headers });
  }
  //Devolver Libro
  devolverLibro(idPrestamo: string,idUsuario:number): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}prestamos/${idPrestamo}`, { ID_usuario: idUsuario }, { headers });
  }

  //Historial de prestamos
  getLoanHistory(): Observable<any[]> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    const id = sessionStorage.getItem('ID_Uss');
    return this.http.get<any[]>(`${this.apiUrl}prestamos/${id}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404 && error.error?.message === 'No se encontraron prestamos para este usuario.') {
          return throwError(() => new Error('No se encontraron prestamos para este usuario.'));
        }
        return throwError(() => new Error('Error al obtener el historial de prestamos del usuario.'));
      })
    );
  }

  //Historial de Compras
  getPurchaseHistory(): Observable<any[]> {
    const headers = new HttpHeaders({authorization: `${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json'});
    const id = sessionStorage.getItem('ID_Uss');
    return this.http.get<any[]>(`${this.apiUrl}compras/${id}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          // Rechazar con un mensaje personalizado si no hay ventas
          return throwError(() => new Error('No se encontraron ventas para este usuario.'));
        }
        return throwError(() => new Error('Error al obtener el historial de compras.'));
      })
    );
  }
  

  //Credencial
  getCredencial(): Observable<Blob> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}others/cred/${sessionStorage.getItem('ID_Uss')}`,{Nombre:sessionStorage.getItem('Nombre')}, { headers:headers,responseType: 'blob' });
  }


  //Reseñas de los Libros
  getResenasLibro(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}resenas/all/${id}`);
  }
  verificarPrestamoDevuelto(idUsuario: string, idLibro: string) {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}prestamos/devueltos/${idUsuario}/${idLibro}`,{ headers });
  }
  
  obtenerResenaUsuario(idUsuario: string, idLibro: string) {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiUrl}resenas/usuario/${idUsuario}/${idLibro}`,{ headers });
  }
  
  crearResena(resenaData: any) {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.post<{ID_Resena: number}>(`${this.apiUrl}resenas`, resenaData, { headers });
  }
  
  actualizarResena(resenaData: any) {
    console.log(resenaData)
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.put<{ID_Resena: number}>(`${this.apiUrl}resenas/${resenaData.ID_Resena}`, resenaData,{ headers });
  }
  
  eliminarResena(idResena: number) {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}resenas/${idResena}`,{ headers });
  }


  //Administración de Libros
  addBook(book: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}books`, book, { headers });
  }

  updateBook(id: string, book: any): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}books/${id}`, book, { headers });
  }

  deleteBook(id: string): Observable<any> {
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}books/${id}`, { headers });
  }

  //Sucursales 
  getSucursales(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}sucursales`, { headers });
  }


  //Usuarios 
  //Tipo de usuarios
  getTipoUsuarios(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}users/tipo`, { headers });
  }
  //Todos usuarios que tiene acceso 
  getUsuarios(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}users`, { headers });
  }
  addUser(body:any):Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}auth/register`,body, { headers });
  }
  updateUser(id:number,body:any):Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}users/${id}`,body, { headers });
  }
  deleteUser(id:number):Observable<any>{
    console.log(id)
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.delete(`${this.apiUrl}users/${id}`, { headers });
  }


  //Ventas por entregar
  getVentasPorEntregar(): Observable<any>{
    const headers = new HttpHeaders({ 'authorization':`${sessionStorage.getItem('authToken')}`,'Content-Type': 'application/json' });
    return this.http.get(`${this.apiUrl}sales/pending`, { headers });
  }
}
