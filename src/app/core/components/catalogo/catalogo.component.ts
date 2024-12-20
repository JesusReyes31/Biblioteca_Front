import { Component } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { SweetalertService } from '../../services/sweetalert/sweetalert.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FooterService } from '../../services/footer/footer.service';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import { ToastrService } from 'ngx-toastr';

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
  todoslibros:any[]=[];
  filteredRecords: any[] = [];
  searchTerm: string = '';
  itemsPerPage = 1;
  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  startIndex = 0;
  endIndex = 0;
  paginatedRecords: any[] = [];
  librosFiltrados: any[] = [];
  constructor(private userService:UsersService,
    private sweetalert:SweetalertService,
    private router:Router,
    private footerService:FooterService,
    private toastr: ToastrService
  ){}
  ngOnInit(): void {
    this.userService.getGeneros().subscribe(
      (data) => {
        if (data.message) {
          this.toastr.error(data.message);
        } else {
          data.forEach((gen: any) => {
            this.generos.push(gen.Genero);
          });
          if(sessionStorage.getItem('busqueda')){
            this.traerLibrosBusqueda(sessionStorage.getItem('busqueda')||'');
          }else{
            this.primergenero();
          }
        }
      },
      (error) => {
        console.error('Error al cargar el archivo JSON:', error);
      }
    );
  }
  primergenero():void{
    // Seleccionar automáticamente el primer género
    setTimeout(() => {
      const primerGenero = document.querySelector('.generos-libros ul li');
      if (primerGenero) {
        primerGenero.classList.add('selected');
        this.traerLibros(this.generos[0]);
        }
    }, 100);
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
    // Deseleccionar cualquier género previamente seleccionado
    const listaGeneros = document.querySelectorAll('.generos-libros ul li');
    listaGeneros.forEach((item: any) => {
      item.classList.remove('selected');
    });

    this.userService.getBooksByName(busqueda).subscribe({
      next: (data) => {
        if (data.message) {
          this.toastr.error(data.message);
          this.primergenero();
        } else {
          this.libros = data;
          this.librosFiltrados = [...this.libros];
          this.footerService.adjustFooterPosition();
        }
      },
      error: (error) => {
        this.borrarlibros();
        this.toastr.error('Error al buscar libros');
      }
    });
  }
  //Traer libros por genero 
  traerLibros(genero: string): void {
    this.borrarlibros();
    this.userService.getBooksByGenre(genero).subscribe({
      next: (data) => {
        if (data.message) {
          this.toastr.error(data.message);
        } else {
          sessionStorage.removeItem('busqueda');
          this.libros = data;
          this.librosFiltrados = [...this.libros];
          this.searchTerm = ''; // Limpiar búsqueda al cambiar de género
          this.currentPage = 1;
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
    sessionStorage.setItem('selectedLibro', JSON.stringify(libro)); // Guardamos el id en sessionStorage
    this.router.navigate(['/informacion']);
  }

  // Barra de Búsqueda
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.librosFiltrados = [...this.libros]; // Si no hay término de búsqueda, mostrar todos los libros
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      this.librosFiltrados = this.libros.filter(libro => {
        return (
          libro.Titulo.toLowerCase().includes(searchTermLower) ||
          libro.Autor.toLowerCase().includes(searchTermLower)
          //  ||
          // libro.Genero.toLowerCase().includes(searchTermLower) // Filtrar también por género
        );
      });
    }
    this.currentPage = 1; // Resetear a la primera página
    this.footerService.adjustFooterPosition();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.librosFiltrados = [...this.libros];
    this.currentPage = 1;
    this.footerService.adjustFooterPosition();
  }
}
