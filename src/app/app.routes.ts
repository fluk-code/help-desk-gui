import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./views/views.module').then((m) => m.PagesModule),
  },
  { path: '**', redirectTo: '' },
];
