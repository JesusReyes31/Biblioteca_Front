import { Component } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { SweetalertService } from '../../services/sweetalert/sweetalert.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FooterService } from '../../services/footer/footer.service';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink,ImageLoadingDirective],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent {
  generos:string[]=[];
  libros:any[]=[];
  constructor(private userService:UsersService,private sweetalert:SweetalertService,private router:Router,private footerService:FooterService){}
  ngOnInit(): void {
    this.userService.getGeneros().subscribe(
      (data) => {
        if (data.message) {
          this.sweetalert.showNoReload(data.message);
        } else {
          data.forEach((gen: any) => {
            this.generos.push(gen.Genero);
          });
          if(sessionStorage.getItem('busqueda')){
            this.traerLibrosBusqueda(sessionStorage.getItem('busqueda')||'');
          }else{
            // Seleccionar automáticamente el primer género
            setTimeout(() => {
              const primerGenero = document.querySelector('.generos-libros ul li');
              if (primerGenero) {
                primerGenero.classList.add('selected');
                this.traerLibros(this.generos[0]);
                }
            }, 100);
          }
        }
      },
      (error) => {
        console.error('Error al cargar el archivo JSON:', error);
      }
    );
  }
  selecciongenero(event: any, genero: string): void {
    const listaGeneros = document.querySelectorAll('.generos-libros ul li');
    listaGeneros.forEach((item: any) => {
      item.classList.remove('selected');
    });
    // Agregar la clase 'selected' al item clickeado
    event.target.classList.add('selected');
    // Llamar al método traerLibros con el género seleccionado
    this.traerLibros(genero);
  }

  //Traer libros por busqueda
  traerLibrosBusqueda(busqueda: string): void {
    this.userService.getBooksByName(busqueda).subscribe({
      next: (data) => {
        if (data.message) {
          this.sweetalert.showNoReload(data.message);
          this.borrarlibros();
        } else {
          this.libros = data;
          this.footerService.adjustFooterPosition();
        }
        sessionStorage.removeItem('busqueda');
      },
      error: (error) => {
        console.error(`Error al obtener libros por busqueda:`, error);
        this.borrarlibros();
        this.sweetalert.showNoReload('Error al buscar libros');
      }
    });
  }
  //Traer libros por genero 
  traerLibros(genero: string): void {
    this.borrarlibros();
    console.log(`Género seleccionado: ${genero}`);
    this.userService.getBooksByGenre(genero).subscribe({
      next: (data) => {
        if (data.message) {
          this.sweetalert.showNoReload(data.message);
        } else {
          this.libros = data;
          console.log(data);
          console.log("Adjusting footer position");
          this.footerService.adjustFooterPosition();
        }
      },
      error: (error) => {
        console.error(`Error al obtener libros del género ${genero}:`, error);
      }
    });
  }
  borrarlibros(): void {
    this.libros = []; // Limpiar el arreglo de libros
  }
  seleccionarLibro(libro: any): void {
    console.log("Entró a libros")
    sessionStorage.setItem('selectedLibro', JSON.stringify(libro)); // Guardamos el id en sessionStorage
    this.router.navigate(['/informacion']);
  }
}
