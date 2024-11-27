import { Component } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FooterService } from '../../services/footer/footer.service';

@Component({
  selector: 'app-credencial',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './credencial.component.html',
  styleUrl: './credencial.component.css'
})
export class CredencialComponent {
  public pdfSrc: SafeResourceUrl | null = null;
  constructor(private usersService:UsersService,private sanitizer: DomSanitizer,private footer:FooterService){}
  ngOnInit(){
    // Llamamos al servicio para enviar el nombre al backend
    this.usersService.getCredencial().subscribe((data: Blob) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        // Usar DomSanitizer para marcar la URL como segura
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          fileReader.result as string
        );
      };
      fileReader.readAsDataURL(data);
    }, error => {
      console.error('Error al cargar la credencial:', error);
    });
  }
  ngAfterViewChecked(): void {
    this.footer.adjustFooterPosition()
  }
}
