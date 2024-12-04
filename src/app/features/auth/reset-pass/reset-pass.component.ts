import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

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
  
  constructor(private route:ActivatedRoute,
    private authService:AuthService,
    private router:Router,
    private toastr: ToastrService
  ) {
    this.token = this.route.snapshot.paramMap.get('token') || null;
  }
  ngOnInit(): void {
    this.authService.verifyToken(this.token as string).subscribe(isValid => {
      if (!isValid) {
        this.toastr.error('Token inválido o expirado','',{positionClass:'toast-bottom-left'});
        this.router.navigate(['/login'])
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
            this.toastr.success('Contraseña cambiada exitosamente.','',{positionClass:'toast-bottom-left'});
            this.router.navigate(['/login']); // Redirige al login o a otra página
          },
          (error) => {
            this.toastr.error('Hubo un error al cambiar la contraseña. Intenta nuevamente.','',{positionClass:'toast-bottom-left'});
          }
        );  
      }
    } else {
      alert('Token no encontrado.');
    }
  }  
}
