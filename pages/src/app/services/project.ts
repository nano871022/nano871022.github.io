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
      name: 'CR-Alameda181',
      description: 'CR-Alameda181 aims to enhance the daily management experience for residents and administrators of the Alameda 181 complex by providing a centralized digital platform for:\nManaging community schedules\nAccessing important documents via Google Drive\nViewing service availability and usage\nVisualizing community activity trends\nDisplaying application information and support details\nThe app emphasizes user-friendliness , information accessibility , and efficient resource management tailored to a residential context.',
      technologies: ['Android', 'Gradle','Kotlin', 'Composable', 'Materia-UI-3', 'GitHub Actions','GCP'],
      repoUrl: 'https://github.com/nano871022/CR-Alameda181', // Replace with actual URL
      imageUrl: 'assets/images/portfolio-preview.jpg', // Example path
      architectureDiagramUrl: 'assets/diagrams/cralameda181-architecture.png', // Example path
      status: 'in-progress',
      relatedLinks: [
        { name: 'Wiki', url: 'https://github.com/nano871022/CR-Alameda181/wiki', iconUrl: 'https://lh5.googleusercontent.com/uAApEStdmEhUTsgT6RcFJU-ivfeQkVl4ZSjdfoEXlihHIKpg-a0mqO61ZaqiabVbMVVsw_puslrw7wFbIQAneUuidvColA-j-te_foRB70e69ohp-oS2o639BJt7PZDC2tq3rIMLIT4=w16383' },
        { name: 'GitHub Actions', url: 'cralameda181.japl.dev', iconUrl: 'https://lh5.googleusercontent.com/uAApEStdmEhUTsgT6RcFJU-ivfeQkVl4ZSjdfoEXlihHIKpg-a0mqO61ZaqiabVbMVVsw_puslrw7wFbIQAneUuidvColA-j-te_foRB70e69ohp-oS2o639BJt7PZDC2tq3rIMLIT4=w16383'  }
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
