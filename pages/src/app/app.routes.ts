import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { ProjectListComponent } from './components/projects/project-list/project-list';
import { ProjectDetailComponent } from './components/projects/project-detail/project-detail';
import { AboutMeComponent } from './components/about-me/about-me';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
  { path: 'home', component: HomeComponent, title: 'Home' },
  {
    path: 'projects',
    component: ProjectListComponent,
    title: 'Projects'
  },
  {
    path: 'projects/:id',
    component: ProjectDetailComponent,
    title: 'Project Details' // We can make this dynamic later if needed
  },
  { path: 'about', component: AboutMeComponent, title: 'About Me' },
  // Consider adding a PageNotFoundComponent later
  { path: '**', redirectTo: '/home' } // Wildcard route, redirects to home for now
];
