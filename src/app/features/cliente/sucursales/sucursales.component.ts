import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  templateUrl: './sucursales.component.html',
  styleUrl: './sucursales.component.css'
})
export class SucursalesComponent implements OnInit {
  sucursales: Sucursal[] = [];
  loading: boolean = true;

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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar sucursales:', error);
        this.toastr.error('Error al cargar las sucursales', '', {toastClass:'custom-toast'});
        this.loading = false;
      }
    });
  }
}
