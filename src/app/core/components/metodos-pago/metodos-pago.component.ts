import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UsersService } from '../../services/users/users.service';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [CommonModule,ImageLoadingDirective],
  templateUrl: './metodos-pago.component.html',
  styleUrl: './metodos-pago.component.css'
})
export class MetodosPagoComponent {
  tarjetas:any[] = [];
  tarjetasactivas:any[] = [];
  tarjetasinactivas:any[] = [];
  
  constructor(private userService:UsersService,
    private toastr: ToastrService
  ){}
  
  ngOnInit(): void{
    this.cargarTarjetas();
  }

  cargarTarjetas() {
    this.userService.getTarjetas().subscribe({
      next: (tarjetas:any) => {
        this.tarjetasactivas = tarjetas.filter((tarjeta:any) => tarjeta.Activa).map((tarjeta:any) => ({
          ID_Tarjeta: tarjeta.ID,
          numeroMask: tarjeta.Numero_Tarjeta.slice(-4).padStart(tarjeta.Numero_Tarjeta.length, '*'),
          Nombre_Titular: tarjeta.Nombre_Titular,
          Fecha_Vencimiento: tarjeta.Fecha_Vencimiento,
          Tipo_Tarjeta: tarjeta.Tipo_Tarjeta,
          Activa: tarjeta.Activa,
          Numero_Tarjeta: tarjeta.Numero_Tarjeta
        }));
        this.tarjetasinactivas = tarjetas.filter((tarjeta:any) => !tarjeta.Activa).map((tarjeta:any) => ({
          ID_Tarjeta: tarjeta.ID,
          numeroMask: tarjeta.Numero_Tarjeta.slice(-4).padStart(tarjeta.Numero_Tarjeta.length, '*'),
          Nombre_Titular: tarjeta.Nombre_Titular,
          Fecha_Vencimiento: tarjeta.Fecha_Vencimiento,
          Tipo_Tarjeta: tarjeta.Tipo_Tarjeta,
          Activa: tarjeta.Activa,
          Numero_Tarjeta: tarjeta.Numero_Tarjeta
        }));
      },
      error: (error) => {
        this.toastr.error('No se pudieron cargar las tarjetas','',{toastClass:'custom-toast'});
      }
    });
  }

  editarTarjeta(tarjeta: any) {
    const fechaActual = new Date();
    const fechaMaxima = new Date(fechaActual.getFullYear() + 15, fechaActual.getMonth());
    
    Swal.fire({
      title: 'Editar Tarjeta',
      html: `
        <div class="form-group">
          <label for="numero">Número de Tarjeta</label>
          <input type="text" id="numero" class="swal2-input" value="${tarjeta.Numero_Tarjeta}" placeholder="**** **** **** ****" maxlength="19">
        </div>
        <div class="form-group">
          <label for="titular">Titular</label>
          <input type="text" id="titular" class="swal2-input" value="${tarjeta.Nombre_Titular}" placeholder="Nombre del titular">
        </div>
        <div class="form-group">
          <label for="vencimiento">Fecha de Vencimiento</label>
          <input type="month" 
                 id="vencimiento" 
                 class="swal2-input" 
                 value="${tarjeta.Fecha_Vencimiento}"
                 min="${fechaActual.toISOString().slice(0, 7)}"
                 max="${fechaMaxima.toISOString().slice(0, 7)}"
                 style="display: block; width: 100%;">
        </div>
        <div class="form-group">
          <label for="tipo">Tipo de Tarjeta</label>
          <select id="tipo" class="swal2-input">
            <option value="visa" ${tarjeta.Tipo_Tarjeta === 'visa' ? 'selected' : ''}>Visa</option>
            <option value="mastercard" ${tarjeta.Tipo_Tarjeta === 'mastercard' ? 'selected' : ''}>Mastercard</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const numero = (document.getElementById('numero') as HTMLInputElement).value;
        const titular = (document.getElementById('titular') as HTMLInputElement).value;
        const vencimiento = (document.getElementById('vencimiento') as HTMLInputElement).value;
        const tipo = (document.getElementById('tipo') as HTMLSelectElement).value;

        if (!numero || !titular || !vencimiento || !tipo) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }

        return { 
          ID_Tarjeta: tarjeta.ID_Tarjeta,
          Numero_Tarjeta: numero,
          Nombre_Titular: titular,
          Fecha_Vencimiento: vencimiento,
          Tipo_Tarjeta: tipo,
          Activa: tarjeta.Activa
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.actualizarTarjeta(result.value).subscribe({
          next: () => {
            this.toastr.success('La tarjeta ha sido actualizada correctamente.','',{toastClass:'custom-toast'});
            this.cargarTarjetas();
          },
          error: (error) => {
            this.toastr.error('No se pudo actualizar la tarjeta','',{toastClass:'custom-toast'});
          }
        });
      }
    });
  }

  agregarTarjeta() {
    // Obtener fecha actual
    const fechaActual = new Date();
    // Calcular fecha máxima (15 años desde ahora, por ejemplo)
    const fechaMaxima = new Date(fechaActual.getFullYear() + 15, fechaActual.getMonth());

    Swal.fire({
      title: 'Agregar Nueva Tarjeta',
      html: `
        <div class="form-group">
          <label for="numero">Número de Tarjeta</label>
          <input type="text" id="numero" class="swal2-input" placeholder="**** **** **** ****">
        </div>
        <div class="form-group">
          <label for="titular">Titular</label>
          <input type="text" id="titular" class="swal2-input" placeholder="Nombre del titular">
        </div>
        <div class="form-group">
          <label for="vencimiento">Fecha de Vencimiento</label>
          <input type="month" 
                 id="vencimiento" 
                 class="swal2-input" 
                 min="${fechaActual.toISOString().slice(0, 7)}"
                 max="${fechaMaxima.toISOString().slice(0, 7)}"
                 style="display: block; width: 100%;">
        </div>
        <div class="form-group">
          <label for="tipo">Tipo de Tarjeta</label>
          <select id="tipo" class="swal2-input">
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const numero = (document.getElementById('numero') as HTMLInputElement).value;
        const titular = (document.getElementById('titular') as HTMLInputElement).value;
        const vencimiento = (document.getElementById('vencimiento') as HTMLInputElement).value;
        const tipo = (document.getElementById('tipo') as HTMLSelectElement).value;

        if (!numero || !titular || !vencimiento || !tipo) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }

        return { 
          Numero_Tarjeta: numero,
          Nombre_Titular: titular,
          Fecha_Vencimiento: vencimiento,
          Tipo_Tarjeta: tipo,
          Activa: true
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.agregarTarjeta(result.value).subscribe({
          next: () => {
            this.toastr.success('La tarjeta ha sido agregada correctamente.','',{toastClass:'custom-toast'});
            this.cargarTarjetas();
          },
          error: (error) => {
            this.toastr.error('No se pudo agregar la tarjeta','',{toastClass:'custom-toast'});
          }
        });
      }
    });
  }

  eliminarTarjeta(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.eliminarTarjeta(id).subscribe({
          next: () => {
            this.toastr.success('La tarjeta ha sido eliminada correctamente.','',{toastClass:'custom-toast'});
            this.cargarTarjetas();
          },
          error: (error) => {
            this.toastr.error('No se pudo eliminar la tarjeta','',{toastClass:'custom-toast'});
          }
        });
      }
    });
  }

  toggleEstadoTarjeta(tarjeta: any) {
    const nuevoEstado = !tarjeta.Activa;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';
    Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Deseas ${mensaje} esta tarjeta?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        delete tarjeta.numeroMask;
        const tarjetaActualizada = {
          ...tarjeta,
          Activa: nuevoEstado
        };
        this.userService.actualizarTarjeta(tarjetaActualizada).subscribe({
          next: () => {
            this.toastr.success(`La tarjeta ha sido ${mensaje}da correctamente.`,'',{toastClass:'custom-toast'});
            this.cargarTarjetas();
          },
          error: (error) => {
            this.toastr.error(`No se pudo ${mensaje} la tarjeta`,'',{toastClass:'custom-toast'});
          }
        });
      }
    });
  }

  getTarjetasActivas() {
    return this.tarjetas.filter(tarjeta => tarjeta.activa);
  }

  getTarjetasInactivas() {
    return this.tarjetas.filter(tarjeta => !tarjeta.activa);
  }
}