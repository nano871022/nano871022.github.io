import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor, *ngIf

interface SocialLink {
  name: string;
  url: string;
  iconClass?: string; // e.g., for Font Awesome or other icon libraries
  iconUrl?: string;   // Alternatively, direct image URL for icon
}

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent {
  bio: string = "Hello! I'm [Your Name/Alias], a passionate IT professional with a knack for creating innovative solutions. My journey in tech started [mention when/how] and I've since worked on various exciting projects involving [mention key areas like web development, data science, cloud computing, etc.]. I love tackling challenges and continuously learning new technologies to build efficient and user-friendly applications.";

  skills: string[] = [
    'Angular',
    'TypeScript',
    'JavaScript',
    'HTML5 & CSS3',
    'Node.js (Basic)',
    'Git & GitHub',
    'Problem Solving',
    // Add more skills
  ];

  socialLinks: SocialLink[] = [
    { name: 'GitHub', url: 'https://github.com/your-username', iconUrl: 'assets/icons/github-logo.svg' /* Or use iconClass: 'fab fa-github' */ },
    { name: 'LinkedIn', url: 'https://linkedin.com/in/your-profile', iconUrl: 'assets/icons/linkedin-logo.svg' /* Or use iconClass: 'fab fa-linkedin' */ },
    { name: 'Personal Website/Blog', url: 'https://your-website.com', iconUrl: 'assets/icons/website-icon.svg' },
    // Add other links like Twitter, Dev.to, etc.
  ];

  constructor() {
    // In a real application, you might fetch this data from a service or a JSON file.
  }
}
