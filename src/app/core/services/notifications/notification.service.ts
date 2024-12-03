// import { Injectable, OnDestroy } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { io, Socket } from 'socket.io-client';

// export interface UserNotification {
//   ID: number;
//   ID_Usuario: number;
//   Mensaje: string;
//   Tipo: 'Prestamo' | 'Reserva' | 'Venta' | 'Sistema';
//   Leido: boolean;
//   Fecha: Date;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class NotificationService implements OnDestroy {
//   private readonly apiUrl = 'http://localhost:9500/notificacion';
//   private socket: Socket;
//   private notificationsSubject = new BehaviorSubject<UserNotification[]>([]);
//   private unreadCountSubject = new BehaviorSubject<number>(0);

//   notifications$ = this.notificationsSubject.asObservable();
//   unreadCount$ = this.unreadCountSubject.asObservable();

//   constructor(private http: HttpClient) {
//     this.socket = io('http://localhost:9500'); // URL de tu servidor
//     this.setupSocketListeners();
//     this.loadNotifications(); // Carga inicial
//   }

//   private setupSocketListeners() {
//     const userId = sessionStorage.getItem('ID_Uss');

//     if (userId) {
//       // Escuchar notificaciones específicas para este usuario
//       this.socket.on(`newNotification_${userId}`, () => {
//         this.loadNotifications();
//       });

//       // Conectar al room del usuario
//       this.socket.emit('joinRoom', userId);
//     }
//   }

//   loadNotifications() {
//     const userId = sessionStorage.getItem('ID_Uss');
//     if (userId) {
//       const headers = new HttpHeaders({
//         'Content-Type': 'application/json',
//         'authorization': `${sessionStorage.getItem('authToken')}`
//       });

//       this.http.get<UserNotification[]>(`${this.apiUrl}/${userId}`, { headers })
//         .subscribe({
//           next: (notifications) => {
//             this.notificationsSubject.next(notifications);
//             this.updateUnreadCount(notifications);
//           },
//           error: (error) => {
//             console.error('Error loading notifications:', error);
//           }
//         });
//     }
//   }

//   markAsRead(notificationId: number): Observable<any> {
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json',
//       'authorization': `${sessionStorage.getItem('authToken')}`
//     });

//     return this.http.put(`${this.apiUrl}/read/${notificationId}`, {}, { headers });
//   }

//   markAllAsRead(): Observable<any> {
//     const userId = sessionStorage.getItem('id');
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json',
//       'authorization': `${sessionStorage.getItem('authToken')}`
//     });

//     return this.http.put(`${this.apiUrl}/readall/${userId}`, {}, { headers });
//   }

//   private updateUnreadCount(notifications: UserNotification[]) {
//     const unreadCount = notifications.filter(n => !n.Leido).length;
//     this.unreadCountSubject.next(unreadCount);
//   }

//   deleteNotification(notificationId: number): Observable<any> {
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json',
//       'authorization': `${sessionStorage.getItem('authToken')}`
//     });

//     return this.http.delete(`${this.apiUrl}/${notificationId}`, { headers });
//   }

//   deleteAllNotifications(): Observable<any> {
//     const userId = sessionStorage.getItem('ID_Uss');
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json',
//       'authorization': `${sessionStorage.getItem('authToken')}`
//     });

//     return this.http.delete(`${this.apiUrl}/all/${userId}`, { headers });
//   }

//   ngOnDestroy() {
//     if (this.socket) {
//       this.socket.disconnect();
//     }
//   }
// }