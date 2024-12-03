import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search/search.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users/users.service';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import { Subscription } from 'rxjs';
// import { NotificationService, UserNotification } from '../../services/notifications/notification.service';
import Swal from 'sweetalert2';
import { DatosService } from '../../services/users/datos.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,ImageLoadingDirective],
  templateUrl: './header.component.html',
  styleUrls: ['../../../../styles.css','../../../../normalize.css','../../../../icon-zmdi.css','header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  tipou:string|null='';
  Nombre:string|null='';
  Imagen:any='';
  isDropdownOpen = false;
  cantidadCarrito: number = 0;
  mostrarCarrito: boolean = true;
  mostrarBusqueda: boolean = true;
  url:string=''
  private subscription: Subscription;
  unreadNotifications: number = 0;
  // notifications: UserNotification[] = [];
  showNotifications = false;
  private notificationSubscription?: Subscription;

  constructor(private router:Router,private SearchService: SearchService, private userService: UsersService,
    private datos:DatosService
    //  private notificationService: NotificationService
    ) {
    document.addEventListener('click', (event) => {
      const dropdown = document.querySelector('.user-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        this.isDropdownOpen = false;
      }
    });

    // Suscribirse a los cambios de ruta
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mostrarCarrito = !event.url.includes('/carrito');
        // Actualizar cantidad del carrito al cambiar de ruta
        this.actualizarCantidadCarrito();
      }
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mostrarBusqueda = !event.url.includes('/catalogo');
      }
    });
    this.subscription = this.userService.carritoActualizado.subscribe(() => {
      this.actualizarCantidadCarrito();
    });
  }
  ngOnInit(){
    this.url = this.router.url;
    this.tipou = this.datos.getTipoUss() || null;
    this.Nombre = this.datos.getNombre()||null;
    this.Imagen = this.datos.getImagen()||'null';
    
    // Obtener cantidad inicial
    this.actualizarCantidadCarrito();
    
    // Suscribirse a las notificaciones
    // this.notificationSubscription = this.notificationService.notifications$.subscribe(
    //   notifications => {
    //     this.notifications = notifications;
    //   }
    // );

    // this.notificationService.unreadCount$.subscribe(
    //   count => {
    //     this.unreadNotifications = count;
    //   }
    // );

    // // Cargar notificaciones iniciales
    // this.notificationService.loadNotifications();
  }
  ngOnDestroy() {
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
    // if (this.notificationSubscription) {
    //   this.notificationSubscription.unsubscribe();
    // }
    // document.removeEventListener('click', this.closeNotifications);
  }
  actualizarCantidadCarrito() {
    if (this.tipou === 'Cliente' || this.tipou === 'Prestamos' || this.tipou === 'Inventario') {
      this.userService.getCarrito().subscribe({
        next: (carrito) => {
          this.cantidadCarrito = carrito.reduce((total: number, item: any) => {
            return total + item.Cantidad;
          }, 0);
        },
        error: (error) => {
          console.error('Error al obtener cantidad del carrito:', error);
        }
      });
    }
  }
  toggleDropdown() {
    event?.stopPropagation(); // Prevenir que el evento llegue al document
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  openSearchModal() {
    this.SearchService.showSearchModal().then((result) => {
      if (result.isConfirmed) {
        this.buscar(result.value);
      }
    });
  }

  buscar(bookName: string) {
    sessionStorage.setItem('busqueda',bookName);
    this.router.navigate(['catalogo']);
    // Aquí puedes implementar la lógica de búsqueda, por ejemplo, haciendo una llamada a una API.
  }
  salir(){
    this.datos.clean();
    sessionStorage.clear();
    this.router.navigate(['/login'])
  }
  openNotifications() {
    // Aquí va la lógica para manejar las notificaciones
  }
  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }
  // toggleNotifications(event: Event) {
  //   event.stopPropagation();
  //   this.showNotifications = !this.showNotifications;
    
  //   // Cerrar el dropdown cuando se hace clic fuera
  //   if (this.showNotifications) {
  //     setTimeout(() => {
  //       document.addEventListener('click', this.closeNotifications);
  //     });
  //   }
  // }

  // private closeNotifications = (event: Event) => {
  //   const notificationDropdown = document.querySelector('.notifications-dropdown');
  //   const notificationIcon = document.querySelector('.notification-icon');
    
  //   if (notificationDropdown && notificationIcon && 
  //       !notificationDropdown.contains(event.target as Node) && 
  //       !notificationIcon.contains(event.target as Node)) {
  //     this.showNotifications = false;
  //     document.removeEventListener('click', this.closeNotifications);
  //   }
  // }

  // markAsRead(notification: UserNotification) {
  //   if (!notification.Leido) {
  //     this.notificationService.markAsRead(notification.ID).subscribe({
  //       next: () => {
  //         this.notificationService.loadNotifications();
  //       },
  //       error: (error) => {
  //         console.error('Error al marcar como leída:', error);
  //       }
  //     });
  //   }
  // }

  // markAllAsRead() {
  //   this.notificationService.markAllAsRead().subscribe({
  //     next: () => {
  //       this.notificationService.loadNotifications();
  //     },
  //     error: (error) => {
  //       console.error('Error al marcar todas como leídas:', error);
  //     }
  //   });
  // }

  // deleteNotification(notification: UserNotification) {
  //   Swal.fire({
  //     title: '¿Estás seguro?',
  //     text: 'Esta notificación será eliminada permanentemente',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#ef4444',
  //     cancelButtonColor: '#6b7280',
  //     confirmButtonText: 'Sí, eliminar',
  //     cancelButtonText: 'Cancelar'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.notificationService.deleteNotification(notification.ID).subscribe({
  //         next: () => {
  //           this.notificationService.loadNotifications();
  //           Swal.fire({
  //             title: '¡Eliminada!',
  //             text: 'La notificación ha sido eliminada',
  //             icon: 'success',
  //             timer: 1500,
  //             showConfirmButton: false
  //           });
  //         },
  //         error: (error) => {
  //           console.error('Error al eliminar la notificación:', error);
  //           Swal.fire({
  //             title: 'Error',
  //             text: 'No se pudo eliminar la notificación',
  //             icon: 'error'
  //           });
  //         }
  //       });
  //     }
  //   });
  // }

  // deleteAllNotifications() {
  //   Swal.fire({
  //     title: '¿Estás seguro?',
  //     text: 'Todas las notificaciones serán eliminadas permanentemente',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#ef4444',
  //     cancelButtonColor: '#6b7280',
  //     confirmButtonText: 'Sí, eliminar todas',
  //     cancelButtonText: 'Cancelar'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.notificationService.deleteAllNotifications().subscribe({
  //         next: () => {
  //           this.notificationService.loadNotifications();
  //           Swal.fire({
  //             title: '¡Eliminadas!',
  //             text: 'Todas las notificaciones han sido eliminadas',
  //             icon: 'success',
  //             timer: 1500,
  //             showConfirmButton: false
  //           });
  //         },
  //         error: (error) => {
  //           console.error('Error al eliminar las notificaciones:', error);
  //           Swal.fire({
  //             title: 'Error',
  //             text: 'No se pudieron eliminar las notificaciones',
  //             icon: 'error'
  //           });
  //         }
  //       });
  //     }
  //   });
  // }
}
