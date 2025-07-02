import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentLang!: string;
  targetLang!: string;
  buttonText!: string;
  tooltipText!: string;
  switchLink!: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentPath = this.document.location.pathname;
    const currentPathWithoutLocale = currentPath.startsWith('/es/')
      ? currentPath.substring(3)
      : (currentPath.startsWith('/en/') ? currentPath.substring(3) : currentPath);

    if (currentPath.startsWith('/es/')) {
      this.currentLang = 'es';
      this.targetLang = 'en';
      this.buttonText = 'EN';
      this.tooltipText = 'English';
    } else {
      this.currentLang = 'en';
      this.targetLang = 'es';
      this.buttonText = 'ES';
      this.tooltipText = 'Español';
    }

    let safePath = currentPathWithoutLocale;
    if (safePath === '/' || safePath === '' || safePath === '/home') {
      safePath = 'home'; // Default to home
    }
    // Ensure it doesn't start with a slash if it's not just "/"
    if (safePath.startsWith('/') && safePath.length > 1) {
      safePath = safePath.substring(1);
    }


    this.switchLink = `/${this.targetLang}/${safePath}`;
  }
}
