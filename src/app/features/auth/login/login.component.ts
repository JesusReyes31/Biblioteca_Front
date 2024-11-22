import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { SweetalertService } from '../../../core/services/sweetalert.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  Correo: string = '';
  Contra: string = '';

  constructor(private authService: AuthService,private router: Router,private sweetalert: SweetalertService) {}

  ngOnInit(): void {
    sessionStorage.setItem('Nombre', 'Anonimo');
    sessionStorage.setItem('tipoUss', 'Anonimo');
    setTimeout(() => document.body.classList.remove('loading'), 500);
  }

  passwordVisible: boolean = false; // Propiedad para controlar la visibilidad de la contraseña
  password: string = ''; // Propiedad para enlazar con el ngModel del input

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible; // Alterna el valor de passwordVisible entre true y false
  }
  ingresar(){
    const loginData = {
      Correo: this.Correo,
      Contra: this.Contra
    };

    this.authService.login(loginData).subscribe(
      (response) => {
        console.log(response.headers)
        const token = response.headers.get('authorization');
        console.log(token)
        if (token) {
          // Guarda el token y otros datos en sessionStorage
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('Nombre', response.body.Datos.Nombre_usuario);
          sessionStorage.setItem('ID_Uss', response.body.Datos.ID);
          sessionStorage.setItem('tipoUss', response.body.Datos.Tipo_usuario);
          sessionStorage.setItem('Imagen', response.body.Datos.Imagen);
          this.sweetalert.showNoReload('Login exitoso');
          this.router.navigate(['/']); // Redirige al usuario a la página principal
        } else {
          this.sweetalert.showNoReload('No se recibió un token de autenticación.');
        }
      },
      (error) => {
        // Manejo del error, como mostrar un mensaje
        this.sweetalert.showNoReload('Error al iniciar sesión, Datos Incorrectos');
      }
    );  
  }
}
