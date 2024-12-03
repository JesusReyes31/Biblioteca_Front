import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';

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

  constructor(private router: Router,private sweetalert: SweetalertService,private authService:AuthService) {}
  recuperar(activo: string) {
    if (!this.Correo && !this.Nombre_Usuario) {
      this.sweetalert.showNoReload('Por favor ingrese un correo o nombre de usuario');
      return;
    }

    // Mostrar loading
    // this.sweetalert.showLoading('Enviando solicitud...');
    const value = activo === 'Correo' ? this.Correo : this.Nombre_Usuario;
    this.authService.recovery(value, activo).subscribe({
      next: (response) => {
        // if (response.body?.message) {
        //   // Si hay un mensaje de error del backend
        //   this.sweetalert.showNoReload(response.body.message);
        // } else {
          // Éxito
          this.sweetalert.showReload('Si los datos fueron correctos, recibirá un correo para cambiar la contraseña');
        // }
      },
      error: (error) => {
        console.error('Error en la recuperación:', error);
        let errorMessage = 'Error al procesar la solicitud';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado';
        }
        
        this.sweetalert.showNoReload(errorMessage);
      }
    });
  }  
}
