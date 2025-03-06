import { Routes } from '@angular/router';

import { ViewsComponent } from './views.component';

export const viewsRoutes: Routes = [
  {
    path: '',
    component: ViewsComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'rooms',
        loadComponent: () => import('./rooms/rooms.component').then((c) => c.RoomsComponent),
      },
    ],
  },
];
