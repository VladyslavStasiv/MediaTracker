import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService, MediaItem } from '../../services/media';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './media-list.html',
  styleUrl: './media-list.scss'
})
export class MediaListComponent implements OnInit {
  mediaItems: MediaItem[] = [];
  private readonly mediaService = inject(MediaService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.mediaService.getMediaItems().subscribe({
      next: (data) => {
        this.mediaItems = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Помилка:', err)
    });
  }
}
