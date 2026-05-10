import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message = signal<string | null>(null);
  isError = signal<boolean>(false);

  show(msg: string, error: boolean = false) {
    this.message.set(msg);
    this.isError.set(error);

    setTimeout(() => {
      this.message.set(null);
    }, 3000);
  }
}
