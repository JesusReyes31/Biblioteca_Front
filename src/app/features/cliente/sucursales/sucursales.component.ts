import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users/users.service';
import { ToastrService } from 'ngx-toastr';

interface Sucursal {
  ID: number;
  Nombre: string;
  Estado: string;
  Municipio: string;
  Colonia: string;
  Calle: string;
  CP: number;
  Tel_Contacto: string;
}

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sucursales.component.html',
  styleUrl: './sucursales.component.css'
})
export class SucursalesComponent implements OnInit {
  sucursales: Sucursal[] = [];
  sucursalesFiltradas: Sucursal[] = [];
  loading: boolean = true;
  searchTerm: string = '';

  constructor(
    private usersService: UsersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.loading = true;
    this.usersService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.sucursalesFiltradas = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar sucursales:', error);
        this.toastr.error('Error al cargar las sucursales', '', {toastClass:'custom-toast'});
        this.loading = false;
      }
    });
  }

  filtrarSucursales(): void {
    const termino = this.searchTerm.toLowerCase();
    this.sucursalesFiltradas = this.sucursales.filter(sucursal => 
      sucursal.Nombre.toLowerCase().includes(termino) ||
      sucursal.Estado.toLowerCase().includes(termino) ||
      sucursal.Municipio.toLowerCase().includes(termino) ||
      sucursal.Colonia.toLowerCase().includes(termino) ||
      sucursal.Calle.toLowerCase().includes(termino) ||
      sucursal.CP.toString().includes(termino)
    );
  }
}
