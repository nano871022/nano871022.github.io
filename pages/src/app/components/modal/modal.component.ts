import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';
import { NgxImageZoomModule } from 'ngx-image-zoom'; // Import NgxImageZoomModule here
import { Observable } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgxImageZoomModule], // Add NgxImageZoomModule
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  showModal$: Observable<boolean>;
  imageUrl$: Observable<string | null>;

  constructor(private modalService: ModalService) {
    this.showModal$ = this.modalService.showModal$;
    this.imageUrl$ = this.modalService.modalImageUrl$;
  }

  ngOnInit(): void {}

  closeModal() {
    this.modalService.close();
  }

  // Optional: Close modal on Escape key press
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) { // Temporarily change to Event to see if it compiles, then cast
    const keyboardEvent = event as KeyboardEvent;
    // We expect 'escape' to be handled by the decorator, but if we needed to check:
    // if (keyboardEvent.key === 'Escape') {
    this.modalService.close();
    // }
  }
}
