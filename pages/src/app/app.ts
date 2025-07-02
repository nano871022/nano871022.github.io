import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { ModalComponent } from './components/modal/modal.component'; // Import ModalComponent

@Component({
  selector: 'app-root',
  standalone: true, // Explicitly mark as standalone
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ModalComponent], // Add ModalComponent here
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'pages';
}
