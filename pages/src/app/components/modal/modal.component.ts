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

  // Zoom properties
  currentMagnification: number = 1;
  readonly scrollStepSize: number = 0.1; // Same as default for ngx-image-zoom scroll
  readonly minZoom: number = 0.5; // Arbitrary minimum zoom
  readonly maxZoom: number = 5; // Arbitrary maximum zoom, can be adjusted

  constructor(private modalService: ModalService) {
    this.showModal$ = this.modalService.showModal$;
    this.imageUrl$ = this.modalService.modalImageUrl$;

    // Reset magnification when modal is closed or image changes
    this.showModal$.subscribe(isOpen => {
      if (!isOpen) {
        this.currentMagnification = 1; // Reset zoom when modal closes
      }
    });
    this.imageUrl$.subscribe(() => {
      this.currentMagnification = 1; // Reset zoom when image changes
    });
  }

  ngOnInit(): void {}

  closeModal() {
    this.modalService.close();
  }

  zoomIn() {
    this.currentMagnification = Math.min(this.maxZoom, this.currentMagnification + this.scrollStepSize);
  }

  zoomOut() {
    this.currentMagnification = Math.max(this.minZoom, this.currentMagnification - this.scrollStepSize);
  }

  // Optional: Close modal on Escape key press
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) { // Changed Event to KeyboardEvent
    // The decorator handles the key check, so direct call to close is fine
    this.modalService.close();
  }
}
