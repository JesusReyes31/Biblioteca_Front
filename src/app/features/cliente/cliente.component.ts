import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { CatalogoComponent } from '../../core/components/catalogo/catalogo.component';
import { RouterOutlet } from '@angular/router';
import { FooterService } from '../../core/services/footer.service';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [SidebarComponent,HeaderComponent,FooterComponent,RouterOutlet],
  templateUrl: './cliente.component.html',
  styleUrls: ['cliente.component.css']
})
export class ClienteComponent {
  constructor(private footer:FooterService) {}
  ngOnInit(){
    this.footer.adjustFooterPosition();
    if(!sessionStorage.getItem('Nombre')){
      sessionStorage.setItem('Nombre', 'Anonimo');
      sessionStorage.setItem('tipoUss', 'Anonimo');
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
  // ngAfterViewChecked() {
  //   this.adjustFooterPosition();
  // }
  
}