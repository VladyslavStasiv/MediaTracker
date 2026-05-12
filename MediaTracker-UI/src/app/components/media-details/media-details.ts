import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MediaService, MediaItem } from '../../services/media';

@Component({
  selector: 'app-media-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './media-details.html',
  styleUrl: './media-details.scss'
})
export class MediaDetailsComponent implements OnInit {
  item: MediaItem | null = null;

  synopsisEn: string = 'Loading description...';
  synopsisUk: string = 'Переклад завантажується...';
  genres: string[] = [];

  private readonly route = inject(ActivatedRoute);
  private readonly mediaService = inject(MediaService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.mediaService.getMediaItem(id).subscribe({
        next: (data) => {
          this.item = data;
          this.cdr.detectChanges();
          this.loadSynopsisAndGenres(data.title);
        },
        error: (err) => console.error('Error loading details:', err)
      });
    }
  }

  loadSynopsisAndGenres(title: string): void {
    this.mediaService.getJikanDetailsCached(title).subscribe({
      next: (response) => {
        if (response.data?.length > 0) {
          const animeData = response.data[0];

          if (animeData.genres) {
            this.genres = animeData.genres.map((g: any) => g.name);
          }

          if (animeData.synopsis) {
            this.synopsisEn = animeData.synopsis;

            this.mediaService.translateEnToUk(this.synopsisEn).subscribe({
              next: (transRes) => {
                if (transRes?.[0]) {
                  this.synopsisUk = transRes[0].map((item: any) => item[0]).join('');
                } else {
                  this.synopsisUk = 'Не вдалося розпізнати переклад.';
                }
                this.cdr.detectChanges();
              },
              error: () => {
                this.synopsisUk = 'Помилка доступу до Google Translate.';
                this.cdr.detectChanges();
              }
            });

          } else {
            this.synopsisEn = 'Description not available.';
            this.synopsisUk = 'Опис відсутній.';
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.synopsisEn = 'Failed to load description.';
        this.synopsisUk = 'Помилка завантаження.';
        this.cdr.detectChanges();
      }
    });
  }
}
