import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
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
  TipoUss:string[] = ['Admin Sucursal','Inventario','Prestamos'];
  constructor(private authService: AuthService,private router: Router,private sweetalert: SweetalertService) {}

  ngOnInit(): void {
    sessionStorage.setItem('Nombre', 'Anonimo');
    sessionStorage.setItem('tipoUss', 'Anonimo');
    setTimeout(() => document.body.classList.remove('loading'), 500);
  }

  passwordVisible: boolean = false;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  ingresar(){
    const loginData = {
      Correo: this.Correo,
      Contra: this.Contra
    };

    this.authService.login(loginData).subscribe(
      (response) => {
        console.log(response)
        const token = response.headers.get('authorization');
        // console.log(token)
        if (token) {
          // Guarda el token y otros datos en sessionStorage
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('Nombre', response.body.Datos.Nombre_usuario);
          sessionStorage.setItem('ID_Uss', response.body.Datos.ID);
          sessionStorage.setItem('tipoUss', response.body.Datos.Tipo_usuario);
          sessionStorage.setItem('Imagen', response.body.Datos.Imagen);
          if(this.TipoUss.includes(response.body.Datos.Tipo_usuario)){
            sessionStorage.setItem('ID_Sucursal', response.body.Datos.ID_Sucursal);
          }else{
            sessionStorage.removeItem('ID_Sucursal');
          }
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
