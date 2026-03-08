import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { Router ,RouterLink } from '@angular/router';
import { AuthService } from '../../../services/authservice';

@Component({
  selector: 'register-page',
  imports: [JsonPipe, ReactiveFormsModule,RouterLink],
  templateUrl: './register-page.html',

})
export class RegisterPage {

  private fb = inject(FormBuilder);
  formUtils = FormUtils;
  private router = inject(Router);
  private authService = inject(AuthService);

  registerError: string | null = null;

  myForm: FormGroup = this.fb.group({
    /*name: [
      ,
      [Validators.required, Validators.pattern(FormUtils.namePattern)],

    ],*/
    email: ['@gmail.com', [Validators.required, Validators.pattern(FormUtils.emailPattern)],[FormUtils.checkingServerResponse]],
    /*username: [, [Validators.required, Validators.minLength(6),Validators.pattern(FormUtils.notOnlySpacesPattern),FormUtils.notStrider]],*/
    password: [, [Validators.required, Validators.minLength(6)]],
    password2: [, [Validators.required]],
    }, {
    validators: [
      FormUtils.isFieldOneEqualFieldTwo('password','password2')
    ],
  });

onSubmit() {
  this.myForm.markAllAsTouched();

  const registerData = this.myForm.value;

  this.authService.register(registerData.email, registerData.password)
    .then((response:any) =>{
      console.log('Register exitoso:', response);
        this.router.navigate(['/login']);
    })
    .catch((error: { message: string; }) => {
        console.error('Error en register:', error);

        if (error.message) {
          this.registerError = 'Correo electrónico o contraseña incorrectos';
        } else {
          this.registerError = 'Error al iniciar sesión. Por favor, intenta nuevamente';
        }
      });
  console.log(this.myForm.value)
}
}
