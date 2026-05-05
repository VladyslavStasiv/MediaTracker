import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MediaItem {
  id: number;
  title: string;
  type: string;
  episodesWatched: number;
  totalEpisodes: number;
  status: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5156/api/mediaitems';

  getMediaItems(): Observable<MediaItem[]> {
    return this.http.get<MediaItem[]>(this.apiUrl);
  }

  addMediaItem(item: MediaItem): Observable<MediaItem> {
    return this.http.post<MediaItem>(this.apiUrl, item);
  }
}
