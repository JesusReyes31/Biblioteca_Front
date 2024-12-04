import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './recovery.component.html',
  styleUrl: './recovery.component.css'
})
export class RecoveryComponent {
  Correo: string = '';
  Nombre_Usuario: string = '';

  constructor(private router: Router,
    private sweetalert: SweetalertService,
    private authService:AuthService,
    private toastr: ToastrService
  ) {}
  recuperar(activo: string) {
    if (!this.Correo && !this.Nombre_Usuario) {
      this.toastr.info('Por favor ingrese un correo o nombre de usuario','',{positionClass:'toast-top-left'});
      return;
    }

    // Mostrar loading
    const value = activo === 'Correo' ? this.Correo : this.Nombre_Usuario;
    this.toastr.info('Si los datos fueron correctos, recibirá un correo para cambiar la contraseña','',{positionClass:'toast-top-left'});
    this.authService.recovery(value, activo).subscribe({
      next: (response) => {
        window.location.reload();
      },
      error: (error) => {
        let errorMessage = 'Error al procesar la solicitud';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado';
        }
      }
    });
  }  
}
