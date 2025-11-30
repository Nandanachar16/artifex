import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: '', redirectTo: 'artifex', pathMatch: 'full' },
    {
      path: 'artifex', data: { breadcrumb: '' },
      children: [
        { path: '', redirectTo: 'home', pathMatch: 'full' },
        { path: 'home', component: HomeComponent, data: { breadcrumb: 'Home' } }
      ]
    }
  ];