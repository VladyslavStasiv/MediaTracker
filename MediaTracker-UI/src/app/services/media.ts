import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface MediaItem {
  id: number;
  title: string;
  type: string;
  episodesWatched: number;
  totalEpisodes: number;
  status: string;
  rating: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5156/api/mediaitems';
  private readonly jikanCache = new Map<string, any>();

  getMediaItems(): Observable<MediaItem[]> {
    return this.http.get<MediaItem[]>(this.apiUrl);
  }

  addMediaItem(item: MediaItem): Observable<MediaItem> {
    return this.http.post<MediaItem>(this.apiUrl, item);
  }

  getMediaItem(id: number): Observable<MediaItem> {
    return this.http.get<MediaItem>(`${this.apiUrl}/${id}`);
  }

  updateMediaItem(id: number, item: MediaItem): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, item);
  }

  uploadImage(id: number, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/${id}/image`, formData);
  }

  searchJikanCover(title: string): Observable<any> {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`;
    return this.http.get(url);
  }

  saveExternalImageUrl(id: number, imageUrl: string): Observable<{ imageUrl: string }> {
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/${id}/image-url`, { imageUrl });
  }

  getJikanDetailsCached(title: string): Observable<any> {
    if (this.jikanCache.has(title)) {
      return of(this.jikanCache.get(title));
    }

    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`;
    return this.http.get(url).pipe(
      tap(data => this.jikanCache.set(title, data))
    );
  }

  translateEnToUk(text: string): Observable<any> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=uk&dt=t&q=${encodeURIComponent(text)}`;
    return this.http.get(url);
  }

  deleteMediaItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
