import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users/users.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import { PageEvent } from '@angular/material/paginator';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, CommonModule,ReactiveFormsModule,ImageLoadingDirective],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent {
  generos: string[] = [];
  sucursales: any[] = [];
  books: any[] = [];
  filteredRecords: any[] = [];
  searchTerm: string = '';
  selectedBook: any = {};
  bookForm: FormGroup;
  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  startIndex = 0;
  endIndex = 0;
  paginatedRecords: any[] = [];
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder, private userService: UsersService, private sweetalert: SweetalertService) {
    this.bookForm = this.fb.group({
      ID: ['',Validators.required],
      Titulo: ['', Validators.required],
      Autor: ['', Validators.required],
      Genero: ['', Validators.required],
      ISBN: ['', Validators.required],
      Anio_publicacion: ['', Validators.required],
      Cantidad: ['', Validators.required],
      Precio: ['', Validators.required],
      Resumen: ['', Validators.required],
      Imagen: ['',Validators.required],
      ImagenURL: [''],
      OtroGenero: [''],
      ID_Sucursal: ['', Validators.required]
    });
    this.loadBooks();
  }

  ngOnInit(): void {
    this.userService.getGeneros().subscribe(
      (data) => {
        if (data.message) {
          this.sweetalert.showNoReload(data.message);
        } else {
          data.forEach((gen: any) => {
            this.generos.push(gen.Genero);
          });
        }
      },
      (error) => {
        console.error('Error al cargar el archivo JSON:', error);
      }
    );
    this.userService.getSucursales().subscribe(
      (data) => {
        if (data.message) {
          this.sweetalert.showNoReload(data.message);
        } else {
          this.sucursales = data;
        }
      },
      (error) => {
        console.error('Error al cargar el archivo JSON:', error);
      }
    );
    this.loadBooks();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Guardamos la URL base64 en ImagenURL para que el `src` de la imagen la utilice
        this.bookForm.patchValue({
          ImagenURL: e.target.result,
          Imagen: e.target.result
        });
      };
      reader.readAsDataURL(file); // Convierte el archivo a Base64
    }
  }

  filterRecords() {
    if (!this.searchTerm) {
      this.filteredRecords = [...this.books];
    } else {
      this.filteredRecords = this.books.filter((record) => {
        return (
          (record.ID && record.ID.toString().toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.Titulo && record.Titulo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.Autor && record.Autor.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.Genero && record.Genero.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.ISBN && record.ISBN.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.Anio_publicacion && record.Anio_publicacion.toString().toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.Resumen && record.Resumen.toLowerCase().includes(this.searchTerm.toLowerCase()))
        );
      });
    }
    this.currentPage = 0;
    this.updatePaginatedRecords();
  }
  //método para actualizar los registros paginados
  updatePaginatedRecords() {
    this.startIndex = this.currentPage * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredRecords.length);
    this.paginatedRecords = this.filteredRecords.slice(this.startIndex, this.endIndex);
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
    this.totalPages = totalPages;
    
    let pages: number[] = [];
    if (totalPages <= 5) {
      pages = Array(totalPages).fill(0).map((_, i) => i);
    } else {
      if (this.currentPage <= 2) {
        pages = [0, 1, 2, 3, 4];
      } else if (this.currentPage >= totalPages - 3) {
        pages = Array(5).fill(0).map((_, i) => totalPages - 5 + i);
      } else {
        pages = Array(5).fill(0).map((_, i) => this.currentPage - 2 + i);
      }
    }
    return pages;
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRecords();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.updatePaginatedRecords();
  }

  //Método para cargar los libros
  loadBooks(): void {
    this.userService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.filteredRecords = [...this.books];
        this.updatePaginatedRecords();
      },
      error: (err) => {
        console.error('Error al cargar los libros:', err);
      }
    });
  }
  selectRow(record: any): void {
    this.isEditMode = true;
    this.selectedBook = record;
    this.bookForm.patchValue({
      ID: record.ID,
      Titulo: record.Titulo,
      Autor: record.Autor,
      Genero: record.Genero,
      ISBN: record.ISBN,
      Anio_publicacion: record.Anio_publicacion,
      Cantidad: record.Cantidad,
      Precio: record.Precio,
      Resumen: record.Resumen,
      ImagenURL: record.Imagen,
      ID_Sucursal: record.ID_Sucursal
    });
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  }
  


  addBook(): void {
    if (this.bookForm.get('ID')?.value && this.bookForm.get('Titulo')?.value) {
      const otroGenero = this.bookForm.get('OtroGenero')?.value;
      const genero = this.bookForm.get('Genero')?.value;
      if (genero === 'Otro' && otroGenero) {
        this.bookForm.patchValue({ Genero: otroGenero });
      } else {
        this.bookForm.patchValue({ Genero: genero });
      }
      // this.bookForm.patchValue({
      //   Imagen: this.bookForm.get('ImagenURL')?.value
      // });
      this.bookForm.removeControl('ImagenURL');
      this.bookForm.removeControl('OtroGenero');

      this.userService.addBook(this.bookForm.value).subscribe(
        (response) => {
          this.sweetalert.showNoReload('Libro agregado exitosamente');
          this.loadBooks();
          this.clearForm();
        },
        (error) => {
          this.sweetalert.showNoReload('Error al agregar libro');
          console.error(error);
        }
      );
    }
  }

  updateBook(): void {
    if (this.selectedBook && this.selectedBook.ID) {
      const otroGenero = this.bookForm.get('OtroGenero')?.value;
      const genero = this.bookForm.get('Genero')?.value;
      if (genero === 'Otro' && otroGenero) {
        this.bookForm.patchValue({ Genero: otroGenero });
      } else {
        this.bookForm.patchValue({ Genero: genero });
      }

      this.bookForm.removeControl('ImagenURL');
      this.bookForm.removeControl('OtroGenero');

      this.userService.updateBook(this.selectedBook.ID, this.bookForm.value).subscribe(
        (response) => {
          this.sweetalert.showReload('Libro modificado exitosamente')
        },
        (error) => {
          this.sweetalert.showNoReload('Error al modificar libro');
          console.error(error);
        }
      );
    }
  }

  deleteBook(): void {
    if (this.selectedBook && this.selectedBook.ID) {
      this.userService.deleteBook(this.selectedBook.ID).subscribe(
        (response) => {
          this.sweetalert.showReload('Libro eliminado exitosamente')
        },
        (error) => {
          this.sweetalert.showNoReload('Error al eliminar libro');
          console.error(error);
        }
      );
    }
  }

  clearForm(): void {
    this.bookForm.reset();
    this.selectedBook = null;
    this.isEditMode = false;
    this.bookForm.get('Genero')?.setValue('');
    this.bookForm.get('ID_Sucursal')?.setValue('');
  }
}
