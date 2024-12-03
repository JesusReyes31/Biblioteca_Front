import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatosService } from '../../services/users/datos.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['../../../../normalize.css','../../../../icon-zmdi.css']
})
export class SidebarComponent {
  tipou: string = '';
  // dropdownVisible = false;

  constructor(private datos:DatosService) {
  }
  
  ngOnInit() {
    this.tipou = this.datos.getTipoUss() || 'Anonimo';
  }
  toggleDropdown() {
    // this.dropdownVisible = !this.dropdownVisible; // Toggle dropdown visibility
  }

  reporte(event: Event, tipo: string) {
    event.preventDefault();
    // Aquí puedes agregar la lógica para generar los reportes
  }
}
