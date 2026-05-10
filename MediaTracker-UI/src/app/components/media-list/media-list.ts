import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService, MediaItem } from '../../services/media';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './media-list.html',
  styleUrl: './media-list.scss'
})
export class MediaListComponent implements OnInit {
  mediaItems: MediaItem[] = [];
  private readonly mediaService = inject(MediaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toastService = inject(ToastService);

  searchQuery = '';
  filterStatus = 'All';

  showDeleteModal = false;
  itemToDeleteId: number | null = null;

  get filteredMediaItems(): MediaItem[] {
    return this.mediaItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.filterStatus === 'All' || item.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  ngOnInit(): void {
    this.mediaService.getMediaItems().subscribe({
      next: (data) => {
        this.mediaItems = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Помилка:', err)
    });
  }

  updateProgress(item: MediaItem, change: number): void {
    const newProgress = item.episodesWatched + change;

    if (newProgress < 0 || newProgress > item.totalEpisodes) return;
    item.episodesWatched = newProgress;
    if (newProgress === item.totalEpisodes) {
      item.status = 'Completed';
    } else if (newProgress === 0) {
      item.status = 'Plan to Watch';
    } else if (newProgress > 0 && item.status === 'Plan to Watch') {
      item.status = 'Watching';
    } else if (newProgress < item.totalEpisodes && item.status === 'Completed') {
      item.status = 'Watching';
    }

    this.mediaService.updateMediaItem(item.id, item).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => {
        console.error('Error updating progress:', err);
        item.episodesWatched -= change;
        this.cdr.detectChanges();
        this.toastService.show('Failed to save progress. Check connection.', true);
      }
    });
  }

  openDeleteModal(id: number): void {
    this.itemToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.itemToDeleteId = null;
  }

  onFileSelected(event: any, itemId: number): void {
    const file = event.target.files[0];
    if (file) {
      this.mediaService.uploadImage(itemId, file).subscribe({
        next: (response) => {
          const item = this.mediaItems.find(i => i.id === itemId);
          if (item) item.imageUrl = response.imageUrl;

          this.toastService.show('Cover uploaded successfully!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.toastService.show('Failed to upload cover.', true);
        }
      });
    }
  }

  autoFetchCover(item: MediaItem): void {
    this.toastService.show('Searching for cover...');

    this.mediaService.searchJikanCover(item.title).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          const imageUrl = response.data[0].images.jpg.image_url;

          this.mediaService.saveExternalImageUrl(item.id, imageUrl).subscribe({
            next: (res) => {
              item.imageUrl = res.imageUrl;
              this.toastService.show('Cover found and saved!');
              this.cdr.detectChanges();
            },
            error: () => this.toastService.show('Error saving cover to database.', true)
          });
        } else {
          this.toastService.show('No cover found for this title.', true);
        }
      },
      error: () => this.toastService.show('Failed to reach Jikan API.', true)
    });
  }

  confirmDelete(): void {
    if (this.itemToDeleteId !== null) {
      this.mediaService.deleteMediaItem(this.itemToDeleteId).subscribe({
        next: () => {
          this.mediaItems = this.mediaItems.filter(item => item.id !== this.itemToDeleteId);
          this.closeDeleteModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          this.closeDeleteModal();
          this.toastService.show('Item deleted successfully!');
        }
      });
    }
  }
}
