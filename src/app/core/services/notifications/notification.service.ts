import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface AppNotification {
  id: number;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection!: signalR.HubConnection;
  private readonly apiUrl = 'http://localhost:9500/api'; // Ajusta esta URL según tu backend
  
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeSignalRConnection();
    this.loadInitialNotifications();
  }

  private initializeSignalRConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/notificationHub`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR Connected');
        this.registerSignalRHandlers();
      })
      .catch(err => console.error('Error while connecting SignalR:', err));
  }

  private registerSignalRHandlers() {
    this.hubConnection.on('ReceiveNotification', (notification: AppNotification) => {
      this.addNotification(notification);
    });
  }

  private loadInitialNotifications() {
    this.getNotifications().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      },
      error: (error) => console.error('Error loading notifications:', error)
    });
  }

  private addNotification(notification: AppNotification) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
    this.updateUnreadCount();
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/notifications/user`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/read-all`, {});
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/${notificationId}`);
  }

  clearAllNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/clear-all`);
  }

  private updateUnreadCount() {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Método para reconectar manualmente si es necesario
  reconnect(): Promise<void> {
    return this.hubConnection.start();
  }

  // Método para desconectar al cerrar sesión
  disconnect(): Promise<void> {
    return this.hubConnection.stop();
  }

  // Método para enviar una notificación (útil para testing o notificaciones locales)
  sendNotification(notification: Partial<AppNotification>): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.apiUrl}/notifications`, notification);
  }

  // Método para obtener el estado de la conexión
  getConnectionState(): signalR.HubConnectionState {
    return this.hubConnection.state;
  }
}