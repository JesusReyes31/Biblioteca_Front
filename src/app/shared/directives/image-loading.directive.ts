import { Directive, ElementRef, HostBinding, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: 'img[appImageLoading]',
  standalone: true
})
export class ImageLoadingDirective {
  @Input() loadingHeight = '200px';
  @Input() loadingWidth = '200px';

  private originalSrc: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Ocultar la imagen original inicialmente
    this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    
    // Crear el contenedor
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'image-loading-wrapper');
    
    // Crear el skeleton loader
    const skeleton = this.renderer.createElement('div');
    this.renderer.addClass(skeleton, 'image-skeleton');
    
    // Insertar elementos en el DOM
    this.renderer.insertBefore(this.el.nativeElement.parentNode, wrapper, this.el.nativeElement);
    this.renderer.appendChild(wrapper, skeleton);
    this.renderer.appendChild(wrapper, this.el.nativeElement);

    // Escuchar eventos de la imagen
    this.el.nativeElement.addEventListener('load', () => {
      this.renderer.setStyle(skeleton, 'display', 'none');
      this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
      this.renderer.addClass(this.el.nativeElement, 'fade-in');
    });

    this.el.nativeElement.addEventListener('error', () => {
      this.renderer.setStyle(skeleton, 'display', 'none');
      this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
    });
  }

  @Input()
  set src(value: string) {
    this.originalSrc = value;
    this.el.nativeElement.src = value;
  }
}
