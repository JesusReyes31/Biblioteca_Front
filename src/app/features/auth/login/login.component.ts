import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatosService } from '../../../core/services/users/datos.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup; 
  TipoUss:string[] = ['Admin Sucursal','Inventario','Prestamos'];
  constructor(private authService: AuthService,private router: Router,private sweetalert: SweetalertService,private datos:DatosService,private toastr: ToastrService,private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      Correo: ['', [Validators.required]],
      Contra: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.datos.setData({Nombre:'Anonimo',tipoUss:'Anonimo'})
    sessionStorage.setItem('Nombre', 'Anonimo');
    sessionStorage.setItem('tipoUss', 'Anonimo');
    setTimeout(() => document.body.classList.remove('loading'), 500);
  }

  passwordVisible: boolean = false;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  ingresar(){
    this.authService.login(this.loginForm.value).subscribe(
      (response) => {
        const token = response.headers.get('authorization');
        if (token) {
          // Guarda el token y otros datos en sessionStorage
          this.datos.setData({
            authToken:token,
            Nombre:response.body.Datos.Nombre_usuario,
            ID_Uss:response.body.Datos.ID,
            tipoUss:response.body.Datos.Tipo_usuario,
            Imagen:response.body.Datos.Imagen,
            ID_Sucursal: response.body.Datos.ID_Sucursal || undefined,
          })
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
          this.toastr.success('Se ha iniciado sesión correctamente', 'Operación exitosa',{toastClass:'custom-toast'});
          this.router.navigate(['/']); // Redirige al usuario a la página principal
        } else {
          this.toastr.error('No se recibió un token de autenticación.', 'Error');
        }
      },
      (error) => {
        // Manejo del error, como mostrar un mensaje
        this.toastr.error('Error al iniciar sesión, Datos Incorrectos', 'Error');
      }
    );  
  }
}
