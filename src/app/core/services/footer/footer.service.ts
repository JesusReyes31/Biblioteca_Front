import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  adjustFooterPosition = () => {
    const sectionContent = document.getElementById('contenido');
    const footer = document.getElementById('footer');
    if (sectionContent && footer) {
      const contentHeight = sectionContent.offsetHeight + 50; // Ajusta la altura del contenido
      const windowHeight = window.innerHeight - 100; // Altura de la ventana disponible
      // console.log(contentHeight,windowHeight)
      if (contentHeight <= windowHeight) {
        footer.classList.add('footer-fixed'); // Fija el pie de página si el contenido es pequeño
        // console.log('Se agregó')
        // footer.classList.remove('footer');
      } else {
        // footer.classList.add('footer')
        footer.classList.remove('footer-fixed'); // Coloca el pie de página al final del contenido si es grande
      }
    }
  };
}
