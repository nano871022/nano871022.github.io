import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private projects: Project[] = [
    {
      id: '1',
      name: 'My Awesome Portfolio Website',
      description: 'The very website you are looking at! Built with Angular and deployed with GitHub Actions.',
      technologies: ['Angular', 'TypeScript', 'HTML', 'SCSS', 'GitHub Actions'],
      repoUrl: 'https://github.com/your-username/your-repo-name', // Replace with actual URL
      imageUrl: 'assets/images/portfolio-preview.jpg', // Example path
      architectureDiagramUrl: 'assets/diagrams/portfolio-architecture.png', // Example path
      status: 'in-progress',
      relatedLinks: [
        { name: 'Angular Documentation', url: 'https://angular.dev', iconUrl: 'assets/icons/angular-logo.svg' },
        { name: 'GitHub Actions', url: 'https://github.com/features/actions' }
      ]
    },
    {
      id: '2',
      name: 'Old Project X',
      description: 'A legacy system developed for client Y, focusing on data processing.',
      technologies: ['Java', 'Spring Boot', 'MySQL'],
      repoUrl: 'https://github.com/your-username/old-project-x', // Replace
      status: 'old',
      architectureDiagramUrl: 'assets/diagrams/project-x-architecture.png', // Example path
    },
    {
      id: '3',
      name: 'Learning AI Concepts',
      description: 'Currently exploring machine learning and AI through online courses and small experiments.',
      technologies: ['Python', 'Jupyter Notebooks', 'Scikit-learn'],
      status: 'learning',
    }
  ];

  constructor() { }

  getProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return of(this.projects.find(project => project.id === id));
  }
}
