import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../../shared/utils/form-utils';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authservice';


@Component({
  selector: 'login-page',
  imports: [JsonPipe, ReactiveFormsModule,RouterLink],
  templateUrl: './login-page.html',
})
export class LoginPage {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  formUtils = FormUtils;
  private authService = inject(AuthService);

  loginError: string | null = null;
  isLoading: boolean = false;

  myForm: FormGroup = this.fb.group({
    email: ['@gmail.com', [Validators.required, Validators.pattern(FormUtils.emailPattern)],[FormUtils.checkingServerResponse]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  async onSubmit() {
    this.loginError = null;
    this.isLoading = true;

    this.myForm.markAllAsTouched();
    if (this.myForm.invalid) {
      this.isLoading = false;
      return;
    }

    console.log(this.myForm.value);
    const loginData = this.myForm.value;

    try {
      const response = await this.authService.login(loginData.email, loginData.password);
      console.log('Login exitoso:', response);

      await new Promise(resolve => setTimeout(resolve, 300));

      const session = this.authService.loggedSubject.getValue();
      if (session) {
        console.log('Sesión establecida correctamente');
        this.router.navigate(['/plantas']);
      } else {
        console.warn('Sesión no establecida, esperando más...');
        setTimeout(() => {
          this.router.navigate(['/plantas']);
        }, 300);
      }
    } catch (error: any) {
      console.error('Error en login:', error);

      if (error.message) {
        this.loginError = 'Correo electrónico o contraseña incorrectos';
      } else {
        this.loginError = 'Error al iniciar sesión. Por favor, intenta nuevamente';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
