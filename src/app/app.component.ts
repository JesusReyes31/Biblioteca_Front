import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './core/components/loading/loading.component';
import { ImageLoadingDirective } from './shared/directives/image-loading.directive';
import { FooterService } from './core/services/footer/footer.service';
import { DatosService } from './core/services/users/datos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LoadingComponent,ImageLoadingDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Biblioteca_Front';
  TipoUss:string[] = ['Admin Sucursal','Inventario','Prestamos'];
  constructor(private footerService: FooterService,private datos:DatosService) {}
  ngOnInit(){
    this.datos.setData({
      authToken: sessionStorage.getItem('authToken') || undefined ,
      Nombre: sessionStorage.getItem('Nombre') || 'Anonimo' ,
      ID_Uss: sessionStorage.getItem('ID_Uss') || undefined  ,
      tipoUss: sessionStorage.getItem('tipoUss') || 'Anonimo'  ,
      Imagen: sessionStorage.getItem('Imagen') || undefined ,
      ID_Sucursal:  sessionStorage.getItem('ID_Sucursal') || undefined  ,
    })
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('Nombre')
    sessionStorage.removeItem('ID_Uss')
    sessionStorage.removeItem('tipoUss')
    sessionStorage.removeItem('Imagen')
    sessionStorage.removeItem('ID_Sucursal')
  }
  ngAfterViewInit() {
    this.footerService.adjustFooterPosition()
  }
  @HostListener('window:beforeunload')
  antesRecargar():void{
    if(this.datos.getAuthToken()){
      sessionStorage.setItem('authToken', this.datos.getAuthToken());
      sessionStorage.setItem('Nombre', this.datos.getNombre());
      sessionStorage.setItem('ID_Uss', this.datos.getID_Uss());
      sessionStorage.setItem('tipoUss', this.datos.getTipoUss());
      sessionStorage.setItem('Imagen', this.datos.getImagen());
      if(this.TipoUss.includes(this.datos.getTipoUss())){
        sessionStorage.setItem('ID_Sucursal', this.datos.getID_Sucursal());
      }else{
        sessionStorage.removeItem('ID_Sucursal');
      }
    }else{
      sessionStorage.setItem('Nombre', 'Anonimo');
      sessionStorage.setItem('tipoUss', 'Anonimo');
    }
  }
}
