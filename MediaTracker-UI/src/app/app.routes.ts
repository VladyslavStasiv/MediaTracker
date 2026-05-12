import { Routes } from '@angular/router';
import { MediaListComponent } from './components/media-list/media-list';
import { MediaFormComponent } from './components/media-form/media-form';

export const routes: Routes = [
  { path: '', component: MediaListComponent },
  { path: 'add', component: MediaFormComponent },
  { path: 'edit/:id', component: MediaFormComponent },
  { path: 'details/:id', loadComponent: () => import('./components/media-details/media-details').then(m => m.MediaDetailsComponent) },
];
