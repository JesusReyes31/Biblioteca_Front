import { Component, inject } from '@angular/core';
import { LoadingService } from '../../services/loading/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
