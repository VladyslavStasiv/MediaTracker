import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MediaService, MediaItem } from '../../services/media';

@Component({
  selector: 'app-media-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './media-form.html',
  styleUrl: './media-form.scss'
})
export class MediaFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly mediaService = inject(MediaService);
  private readonly router = inject(Router);

  private readonly englishRegex = /^[\x20-\x7E]+$/;

  mediaForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.pattern(this.englishRegex)]],
    type: ['Anime', Validators.required],
    episodesWatched: [0, [Validators.required, Validators.min(0)]],
    totalEpisodes: [12, [Validators.required, Validators.min(1)]],
    status: ['Plan to Watch', Validators.required],
    rating: [0, [Validators.min(0), Validators.max(10)]]
  });

  onSubmit(): void {
    if (this.mediaForm.valid) {
      const newItem: MediaItem = {
        id: 0,
        ...this.mediaForm.value
      };

      this.mediaService.addMediaItem(newItem).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => console.error('Error adding item:', err)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
