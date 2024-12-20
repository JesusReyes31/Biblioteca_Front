import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users/users.service';
import { SweetalertService } from '../../services/sweetalert/sweetalert.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activate.component.html',
  styleUrl: './activate.component.css'
})
export class ActivateComponent implements OnInit {
  activationSuccess: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsersService,
    private sweetalert: SweetalertService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.activateAccount(token);
      }
    });
  }

  activateAccount(token: string) {
    this.userService.activateAccount(token).subscribe(
      (response) => {
        this.activationSuccess = true;
        this.toastr.success('Cuenta activada exitosamente');
      },
      (error) => {
        this.activationSuccess = false;
        this.errorMessage = 'Error al activar la cuenta. El enlace puede haber expirado.';
        this.toastr.error('Error al activar la cuenta');
      }
    );
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
