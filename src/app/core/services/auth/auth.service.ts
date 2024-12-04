import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.Api_URL;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable()
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();


  constructor(private http: HttpClient,private router:Router) {
    this.checkInitialAuth();
  }

  private checkInitialAuth() {
    const token = this.getCookie('authToken');
    if (token) {
      // Aquí podrías hacer una validación del token con el backend
      this.tokenSubject.next(token);
    }
  }

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/login`, loginData, { observe: 'response' })
      .pipe(
        tap(response => {
          const token = response.headers.get('authorization');
          const userData: any = response.body;
          if (token && userData) {
            this.setSecureCookie('authToken', token);
            this.tokenSubject.next(token);
            this.currentUserSubject.next({
              nombre: userData.Datos.Nombre_usuario,
              id: userData.Datos.ID,
              tipo: userData.Datos.Tipo_usuario
            });
          }
        })
      );
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser$;
  }

  getCurrentUserValue(): any {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  private setSecureCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; Secure; SameSite=Strict; path=/`;
  }

  private deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }


  recovery(value: string, type: string): Observable<any> {
    const headers = new HttpHeaders().set('Skip-Interceptor', 'true'); 
    return this.http.post(`${this.apiUrl}others/mail`, {
      Mail: value,
      Tipo: type
    }, { 
      headers,
      observe: 'response',
      responseType: 'json'
    });
  }
  resetPassword(token: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const body = { newPassword: newPassword };
    return this.http.put<any>(`${this.apiUrl}others/reset-pass`, body, { headers });
  }
  verifyToken(token:string): Observable<boolean> {
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}others/verify-token`, { headers })
      .pipe(
        map(response => {
          if (response.valid) {
            return true;
          } else {
            this.router.navigate(['/login']);
            return false;
          }
        }),
        catchError((error) => {
          console.error('Error al verificar el token:', error);
          this.router.navigate(['/login']);
          return of(false);
        })
      );
  }
}