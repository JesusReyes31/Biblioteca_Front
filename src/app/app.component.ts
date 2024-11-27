import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './core/components/loading/loading.component';
import { ImageLoadingDirective } from './shared/directives/image-loading.directive';
import { FooterService } from './core/services/footer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LoadingComponent,ImageLoadingDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Biblioteca_Front';
  constructor(private footerService: FooterService) {}
  ngAfterViewInit() {
    this.footerService.adjustFooterPosition()
  }
}
