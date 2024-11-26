import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { CatalogoComponent } from '../../core/components/catalogo/catalogo.component';
import { Router, RouterOutlet } from '@angular/router';
import { FooterService } from '../../core/services/footer.service';
import { UsersService } from '../../core/services/users.service';
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
  estadisticas: any = {};
  constructor(private footer:FooterService,private router:Router,private userService:UsersService) {}
  ngOnInit(){
    // this.footer.adjustFooterPosition();
    if(!sessionStorage.getItem('Nombre')){
      sessionStorage.setItem('Nombre', 'Anonimo');
      sessionStorage.setItem('tipoUss', 'Anonimo');
    }
    // this.url = this.router.url;
    // this.tipoUss = sessionStorage.getItem('tipoUss') || 'Anonimo';
    // console.log(this.tipoUss);
    // if(this.tipoUss == 'Cliente' || this.tipoUss == 'Anonimo' || this.tipoUss == 'Prestamos' || this.tipoUss == 'Inventario'){
    //   this.cargarLibrosRecomendados();
    // }else if (this.tipoUss == 'Admin Sucursal') {
    //   // console.log('Cargando estadisticas');
    //   this.cargarEstadisticas();
    // }
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
        this.estadisticas = response;
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
  
}