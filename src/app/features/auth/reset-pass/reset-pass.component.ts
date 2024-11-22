import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SweetalertService } from '../../../core/services/sweetalert.service';

@Component({
  selector: 'app-reset-pass',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './reset-pass.component.html',
  styleUrl: './reset-pass.component.css'
})
export class ResetPassComponent {
  Contra1: string = '';
  Contra2: string = '';
  passwordVisible1: boolean = false; // Propiedad para controlar la visibilidad de la contraseña
  passwordVisible2: boolean = false; // Propiedad para controlar la visibilidad de la contraseña
  token:string | null = null;
  
  constructor(private route:ActivatedRoute,private authService:AuthService,private router:Router,private sweetalert:SweetalertService) {
    this.token = this.route.snapshot.paramMap.get('token') || null;
  }
  ngOnInit(): void {
    this.authService.verifyToken(this.token as string).subscribe(isValid => {
      if (!isValid) {
        this.sweetalert.showNoReload('Token inválido o expirado');
        this.router.navigate(['/login'])
      } else {
        console.log('Token válido');
      }
    });
  }
  togglePasswordVisibility1() {
    this.passwordVisible1 = !this.passwordVisible1; // Alterna el valor de passwordVisible entre true y false
  }
  togglePasswordVisibility2() {
    this.passwordVisible2 = !this.passwordVisible2; // Alterna el valor de passwordVisible entre true y false
  }
  cambiar() {
    if (this.token) {
      if(this.Contra1 === this.Contra2){
        this.authService.resetPassword(this.token, this.Contra1).subscribe(
          (response) => {
            this.sweetalert.showNoReload('Contraseña cambiada exitosamente.');
            this.router.navigate(['/login']); // Redirige al login o a otra página
          },
          (error) => {
            console.log(error)
            this.sweetalert.showNoReload('Hubo un error al cambiar la contraseña. Intenta nuevamente.');
          }
        );  
      }
    } else {
      alert('Token no encontrado.');
    }
  }  
}
