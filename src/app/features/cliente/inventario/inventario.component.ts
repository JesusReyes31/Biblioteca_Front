import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users/users.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import { PageEvent } from '@angular/material/paginator';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import { ToastrService } from 'ngx-toastr';
import { GeminiService } from '../../gemini/service/gemini.service';

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
  allbooks: any[] = [];
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
  filteredTitles: string[] = [];
  showTitleSuggestions: boolean = false;

  constructor(private fb: FormBuilder, 
    private userService: UsersService,
    private sweetalert: SweetalertService,
    private toastr: ToastrService,
    private geminiService: GeminiService
  ) {
    this.bookForm = this.fb.group({
      ID: [''],
      Titulo: ['', Validators.required],
      Autor: ['', Validators.required],
      Genero: ['', Validators.required],
      ISBN: ['', Validators.required],
      Anio_publicacion: ['', Validators.required],
      Cantidad: ['', Validators.required],
      Precio: ['', Validators.required],
      Resumen: ['', Validators.required],
      Imagen: [''],
      ImagenURL: [''],
      OtroGenero: ['']
    });
    // this.loadBooks();
    this.bookForm.get('Titulo')?.valueChanges.subscribe(value => {
      this.filterTitles(value);
    });
  }

  ngOnInit(): void {
    this.getgeneros()
    this.loadBooks();
  }
  getgeneros():void{
    this.generos = [];
    this.userService.getGeneros().subscribe(
      (data) => {
        if (data.message) {
          this.toastr.info(data.message,'',{toastClass:'custom-toast'});
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
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bookForm.patchValue({
          ImagenURL: e.target.result,
          // Imagen: e.target.result
        });
      };
      reader.readAsDataURL(file);
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
    this.books = [];
    this.userService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.filteredRecords = [...this.books];
        this.updatePaginatedRecords();
        this.userService.getAllBooks().subscribe((data) => {
          this.allbooks = data;
          console.log(this.allbooks);
        });
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
      ID: record.ID_Libro,
      Titulo: record.Titulo,
      Autor: record.Autor,
      Genero: record.Genero,
      ISBN: record.ISBN,
      Anio_publicacion: record.Anio_publicacion,
      Cantidad: record.Cantidad,
      Precio: record.Precio,
      Resumen: record.Resumen,
      ImagenURL: record.Imagen
    });

    if (record.Imagen) {
      this.bookForm.get('Imagen')?.clearValidators();
      this.bookForm.get('Imagen')?.updateValueAndValidity();
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  }
  


  addBook(): void {
    if (this.bookForm.valid) {
      const otroGenero = this.bookForm.get('OtroGenero')?.value;
      const genero = this.bookForm.get('Genero')?.value;
      
      // Preparar los datos del libro
      const bookData = {
        ...this.bookForm.value,
        Genero: genero === 'Otro' && otroGenero ? otroGenero : genero,
        Imagen: this.bookForm.get('ImagenURL')?.value || this.bookForm.get('Imagen')?.value
      };

      // Eliminar campos auxiliares
      delete bookData.ImagenURL;
      delete bookData.OtroGenero;

      this.userService.addBook(bookData).subscribe({
        next: (response) => {
          this.toastr.success('Libro agregado exitosamente','',{toastClass:'custom-toast'});
          this.limpieza();
        },
        error: (error) => {
          this.toastr.error('Error al agregar libro','',{toastClass:'custom-toast'});
        }
      });
    }
  }

  updateBook(): void {
    
    if (this.selectedBook && this.bookForm.valid) {
      const otroGenero = this.bookForm.get('OtroGenero')?.value;
      const genero = this.bookForm.get('Genero')?.value;
      
      // Preparar los datos del libro
      const bookData = {
        ...this.bookForm.value,
        Genero: genero === 'Otro' && otroGenero ? otroGenero : genero,
        Imagen: this.bookForm.get('ImagenURL')?.value || 
                this.bookForm.get('Imagen')?.value || 
                this.selectedBook.Imagen
      };

      // Eliminar campos auxiliares
      delete bookData.ImagenURL;
      delete bookData.OtroGenero;
      this.userService.updateBook(this.selectedBook.ID_Libro, bookData).subscribe({
        next: (response) => {
          this.toastr.success('Libro modificado exitosamente','',{toastClass:'custom-toast'});
          this.limpieza();
        },
        error: (error) => {
          this.toastr.error('Error al modificar libro','',{toastClass:'custom-toast'});
        }
      });
    } else {
      this.toastr.info('Por favor, complete todos los campos requeridos','',{toastClass:'custom-toast'});
    }
  }

  deleteBook(): void {
    if (this.selectedBook && this.selectedBook.ID) {
      this.userService.deleteBook(this.selectedBook.ID_Libro).subscribe(
        (response) => {
          this.toastr.success('Libro eliminado exitosamente','',{toastClass:'custom-toast'});
          this.limpieza();
        },
        (error) => {
          this.toastr.error('Error al eliminar libro','',{toastClass:'custom-toast'});
        }
      );
    }
  }

  limpieza(){
    this.getgeneros();
    this.loadBooks();
    this.clearForm();
  }

  clearForm(): void {
    const imageControl = this.bookForm.get('Imagen');
    this.bookForm.reset();
    
    imageControl?.setValidators([Validators.required]);
    imageControl?.updateValueAndValidity();
    
    this.selectedBook = null;
    this.isEditMode = false;
    this.bookForm.get('Genero')?.setValue('');
  }

  private getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.bookForm.controls).forEach(key => {
      const controlErrors = this.bookForm.get(key)?.errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }
  generarResumen(): void {
    const titulo = this.bookForm.get('Titulo')?.value;
    const autor = this.bookForm.get('Autor')?.value;
    const isbn = this.bookForm.get('ISBN')?.value;
    const anio = this.bookForm.get('Anio_publicacion')?.value;
  
    if (titulo && autor && isbn && anio) {
      this.geminiService.generarDescripcionLibro(titulo, autor, isbn, anio)
        .then(descripcion => {
          this.bookForm.patchValue({
            Resumen: descripcion
          });
        })
        .catch(error => {
          this.toastr.error('Error al generar el resumen', '', {toastClass:'custom-toast'});
        });
    }
  }

  filterTitles(value: string) {
    if (!value) {
      this.filteredTitles = [];
      this.showTitleSuggestions = false;
      return;
    }

    const filterValue = value.toLowerCase();
    this.filteredTitles = this.allbooks
      .filter(book => book.Titulo.toLowerCase().includes(filterValue))
      .map(book => book.Titulo);
    this.showTitleSuggestions = true;
  }

  selectExistingBook(titulo: string) {
    const selectedBook = this.allbooks.find(book => book.Titulo === titulo);
    if (selectedBook) {
      if (selectedBook.Imagen) {
        this.bookForm.get('Imagen')?.clearValidators();
        this.bookForm.get('Imagen')?.updateValueAndValidity();
      }

      this.bookForm.patchValue({
        ID: selectedBook.ID,
        Titulo: selectedBook.Titulo,
        Autor: selectedBook.Autor,
        Genero: selectedBook.Genero,
        ISBN: selectedBook.ISBN,
        Anio_publicacion: selectedBook.Anio_publicacion,
        Resumen: selectedBook.Resumen,
        ImagenURL: selectedBook.Imagen
      });
    }
    this.showTitleSuggestions = false;
  }
}
