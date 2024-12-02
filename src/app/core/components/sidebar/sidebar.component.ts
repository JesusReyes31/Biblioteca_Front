import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  constructor() {
  }
  
  ngOnInit() {
    this.tipou = sessionStorage.getItem('tipoUss') || 'Anonimo';
  }
  toggleDropdown() {
    // this.dropdownVisible = !this.dropdownVisible; // Toggle dropdown visibility
  }

  reporte(event: Event, tipo: string) {
    event.preventDefault();
    console.log('Generando reporte de tipo:', tipo);
    // Aquí puedes agregar la lógica para generar los reportes
  }
}
