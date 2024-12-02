import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [SidebarComponent,HeaderComponent,FooterComponent,RouterOutlet,CommonModule,FormsModule,ImageLoadingDirective],
  templateUrl: './cliente.component.html',
  styleUrls: ['cliente.component.css']
})
export class ClienteComponent {
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
  constructor(
    private footer: FooterService,
    private router: Router,
    private userService: UsersService
  ) {
    // Suscribirse a cambios de ruta
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
      }
    });
  }
  ngOnInit(){
    if(!sessionStorage.getItem('Nombre')){
      sessionStorage.setItem('Nombre', 'Anonimo');
      sessionStorage.setItem('tipoUss', 'Anonimo');
    }
    
    this.url = this.router.url;
    this.tipoUss = sessionStorage.getItem('tipoUss') || 'Anonimo';
    console.log(this.tipoUss);
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
  ngOnDestroy(){
    sessionStorage.setItem('Holaa', 'Laso');
    console.log('Destruyendo componente');
  }
  cargarLibrosRecomendados() {
    this.userService.getLibrosRecomendados().subscribe({
      next: (response) => {
        this.librosRecomendados = response;
        console.log(response);
      },
      error: (error) => {
        console.error('Error al cargar libros recomendados:', error);
      }
    });
  }
  cargarEstadisticas() {
    console.log('Cargando estadisticas');
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
        console.log(this.estadisticas);
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
        console.log(this.estadisticas);
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