import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatosService } from '../../../core/services/users/datos.service';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './acceso-denegado.component.html',
  styleUrl: './acceso-denegado.component.css'
})
export class AccesoDenegadoComponent {
  tipoUsuario:string =''
  constructor(private datos:DatosService){
    this.tipoUsuario = this.datos.getTipoUss() || 'Anonimo';
  }
}
