import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { JsonPipe } from '@angular/common';
import { AuthService } from '../../../auth/services/authservice';
import { Supaservice } from '../../../../core/services/supaservice';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './profile-page.html',
})
export default class ProfilePage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private supaservice = inject(Supaservice);

  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  profileLoaded = signal<boolean>(false);

  avatarPreview = signal<string | null>(null);
  avatarFile = signal<File | null>(null);

  myForm: FormGroup = this.fb.group({
    username: ['', [Validators.minLength(3)]],
    avatar_url: [''],
    full_name: [''],
    website: [''],
    role: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }],
  });

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      this.isLoading.set(true);

      const session = this.authService.loggedSubject.getValue();
      const userId = session?.user?.id;
      const email = session?.user?.email ?? '';

      if (!userId) {
        console.error('No hay usuario logueado');
        return;
      }

      const profile = await this.supaservice.getProfileById(userId);

      this.myForm.patchValue({
        username: profile?.username ?? '',
        avatar_url: profile?.avatar_url ?? '',
        full_name: profile?.full_name ?? '',
        website: profile?.website ?? '',
        role: profile?.role ?? 'user',
        email,
      });

      this.avatarPreview.set(profile?.avatar_url ?? null);
      this.profileLoaded.set(true);

    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    this.avatarFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async onSubmit() {
    try {
      this.isSaving.set(true);
      this.myForm.markAllAsTouched();

      if (this.myForm.invalid) return;

      const session = this.authService.loggedSubject.getValue();
      const userId = session?.user?.id;

      if (!userId) {
        console.error('No hay usuario logueado');
        return;
      }

      let avatarUrl = this.myForm.get('avatar_url')?.value || null;

      if (this.avatarFile()) {
        avatarUrl = await this.supaservice.uploadAvatar(this.avatarFile()!, userId);
      }

      await this.supaservice.updateProfile(userId, {
        username: this.myForm.get('username')?.value || null,
        avatar_url: avatarUrl,
        full_name: this.myForm.get('full_name')?.value || null,
        website: this.myForm.get('website')?.value || null,
      });

      this.myForm.patchValue({
        avatar_url: avatarUrl
      });

      this.avatarFile.set(null);
      this.avatarPreview.set(avatarUrl);

      console.log('Perfil actualizado');

    } catch (error) {
      console.error('Error guardando perfil:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
