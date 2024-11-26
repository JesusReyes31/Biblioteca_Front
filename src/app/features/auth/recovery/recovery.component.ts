import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SweetalertService } from '../../../core/services/sweetalert.service';

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
    this.sweetalert.showReload('Si los datos fueron correctos, recibirá un correo para cambiar la contraseña')
    if (activo === 'Correo') {
      this.authService.recovery(this.Correo, activo).subscribe(
        (response) => {
          // console.log('Respuesta recibida:', response);
        },
        (error) => {
          console.error('Error en la recuperación:', error);
        }
      );
    } else {
      this.authService.recovery(this.Nombre_Usuario, activo).subscribe(
        (response) => {
          // console.log('Respuesta recibida:', response);
        }
      );
    }
  }  
}
