import { Component, ElementRef, HostListener, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { CatalogoComponent } from '../../core/components/catalogo/catalogo.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterService } from '../../core/services/footer/footer.service';
import { UsersService } from '../../core/services/users/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageLoadingDirective } from '../../shared/directives/image-loading.directive';
import { DatosService } from '../../core/services/users/datos.service';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [SidebarComponent,HeaderComponent,FooterComponent,RouterOutlet,CommonModule,FormsModule,ImageLoadingDirective],
  templateUrl: './cliente.component.html',
  styleUrls: ['cliente.component.css']
})
export class ClienteComponent implements OnDestroy {
  url:string = '';
  tipoUss:string = '';
  librosRecomendados: any[] = [];
  estadisticas: {
    clientes?: number;
    inventario?: number;
    prestamos?: number;
    totalLibros?: number;
    generos?: number;
    reservas?: number;
    prestamosTotal?: number;
    prestamosPendientes?: number;
    totalVentas?: number;
    ventasNoEntregadas?: number;
    Sucursales?: number;
    Administradores_Sucursales?: number;
    Clientes?: number;
    Personal_Inventario?: number;
    Personal_Prestamo?: number;
    Libros?: number;
  } = {};
  private routerSubscription: any;

  constructor(
    private footer: FooterService,
    private router: Router,
    private userService: UsersService,
    private datos:DatosService
  ) {
    // Suscribirse a cambios de ruta
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
        // Reiniciar el componente cuando se navega a la ruta raíz
        if (this.url === '/') {
          this.reiniciarComponente();
        }
      }
    });
  }

  // Método para reiniciar el componente
  private reiniciarComponente(): void {
    if(!this.datos.getNombre()){
      this.datos.setData({Nombre:'Anonimo',tipoUss:'Anonimo'})
    }
    
    this.tipoUss = this.datos.getTipoUss() || 'Anonimo';
    
    if(this.tipoUss == 'Cliente' || this.tipoUss == 'Anonimo' || this.tipoUss == 'Prestamos' || this.tipoUss == 'Inventario'){
      this.cargarLibrosRecomendados();
    } else if (this.tipoUss == 'Admin Sucursal') {
      this.cargarEstadisticas();
    } else if (this.tipoUss == 'Admin') {
      this.cargarEstadisticasAdmin();
    }
  }

  // Importante: Limpiar la suscripción cuando el componente se destruye
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  ngOnInit(){
    if(!this.datos.getNombre()){
      this.datos.setData({Nombre:'Anonimo',tipoUss:'Anonimo'})
    }
    
    this.url = this.router.url;
    this.tipoUss = this.datos.getTipoUss() || 'Anonimo';
    // Solo cargar datos si estamos en la ruta principal
    if(this.url === '/') {
      if(this.tipoUss == 'Cliente' || this.tipoUss == 'Anonimo' || this.tipoUss == 'Prestamos' || this.tipoUss == 'Inventario'){
        this.cargarLibrosRecomendados();
      } else if (this.tipoUss == 'Admin Sucursal') {
        this.cargarEstadisticas();
      } else if (this.tipoUss == 'Admin') {
        this.cargarEstadisticasAdmin();
      }
    }
  }
  ngAfterViewInit() {
    this.footer.adjustFooterPosition()
  }
  ngAfterViewChecked(): void {
    this.footer.adjustFooterPosition()
  }
  cargarLibrosRecomendados() {
    this.userService.getLibrosRecomendados().subscribe({
      next: (response) => {
        this.librosRecomendados = response;
      },
      error: (error) => {
        console.error('Error al cargar libros recomendados:', error);
      }
    });
  }
  cargarEstadisticas() {
    this.userService.getEstadisticasAdminSucursal().subscribe({
      next: (response) => {
        this.estadisticas = {
          clientes: response.clientes,
          inventario: response.inventario,
          prestamos: response.prestamos,
          totalLibros: response.totalLibros,
          generos: response.generos,
          reservas: response.reservas,
          prestamosTotal: response.prestamosTotal,
          prestamosPendientes: response.prestamosPendientes,
          totalVentas: response.totalVentas,
          ventasNoEntregadas: response.ventasNoEntregadas
        };
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }
  cargarEstadisticasAdmin() {
    this.userService.getEstadisticasAdmin().subscribe({
      next: (response) => {
        this.estadisticas = {
          Sucursales: response.Sucursales,
          Administradores_Sucursales: response.Administradores_Sucursales,
          Clientes: response.Clientes,
          Personal_Inventario: response.Personal_Inventario,
          Personal_Prestamo: response.Personal_Prestamo,
          Libros: response.Libros
        };
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }
  // ngAfterViewChecked() {
  //   this.adjustFooterPosition();
  // }
  
  verInformacionLibro(libro: any): void {
    // Guardamos el libro seleccionado en sessionStorage
    sessionStorage.setItem('selectedLibro', JSON.stringify(libro));
    
    // Navegamos a la ruta de información
    this.router.navigate(['/informacion']);
  }
}