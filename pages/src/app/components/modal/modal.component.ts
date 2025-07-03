import { Component, OnInit, HostListener, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgxImageZoomModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @ViewChild('zoomImage', { static: false }) zoomImage!: ElementRef<HTMLDivElement>;

  showModal$: Observable<boolean>;
  imageUrl$: Observable<string | null>;

  // Zoom properties
  currentMagnification: number = 1;
  readonly scrollStepSize: number = 0.1;
  readonly minZoom: number = 0.5;
  readonly maxZoom: number = 5;

  // Panning properties
  isPanning: boolean = false;
  startX: number = 0;
  startY: number = 0;
  translateX: number = 0;
  translateY: number = 0;

  constructor(
    private modalService: ModalService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.showModal$ = this.modalService.showModal$;
    this.imageUrl$ = this.modalService.modalImageUrl$;

    this.showModal$.subscribe(isOpen => {
      if (!isOpen) {
        this.resetZoomAndPan();
      }
    });
    this.imageUrl$.subscribe(() => {
      this.resetZoomAndPan();
    });
  }

  ngOnInit(): void {}

  resetZoomAndPan(): void {
    this.currentMagnification = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
    if (this.zoomImage && this.zoomImage.nativeElement) {
      this.renderer.setStyle(this.zoomImage.nativeElement.firstChild, 'transform', 'translate(0px, 0px)');
    }
  }

  closeModal(): void {
    this.modalService.close();
  }

  zoomIn(): void {
    this.currentMagnification = Math.min(this.maxZoom, this.currentMagnification + this.scrollStepSize);
  }

  zoomOut(): void {
    this.currentMagnification = Math.max(this.minZoom, this.currentMagnification - this.scrollStepSize);
    if (this.currentMagnification === 1) { // Reset pan when zoomed back to original
      this.translateX = 0;
      this.translateY = 0;
      if (this.zoomImage && this.zoomImage.nativeElement) {
        this.renderer.setStyle(this.zoomImage.nativeElement.firstChild, 'transform', `translate(${this.translateX}px, ${this.translateY}px)`);
      }
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (this.currentMagnification > 1) {
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      this.renderer.setStyle(this.zoomImage.nativeElement, 'cursor', 'grabbing');
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
      // Apply transform to the ngx-image-zoom internal image element
      // This requires ngx-image-zoom to have a somewhat predictable internal structure
      // or a way to access the transformed element.
      // We'll target the first child of the lib-ngx-image-zoom component,
      // which is usually the container that gets transformed.
      if (this.zoomImage && this.zoomImage.nativeElement && this.zoomImage.nativeElement.firstChild) {
         this.renderer.setStyle(this.zoomImage.nativeElement.firstChild, 'transform', `translate(${this.translateX}px, ${this.translateY}px) scale(${this.currentMagnification})`);
      }
    }
  }

  onMouseUp(): void {
    if (this.isPanning) {
      this.isPanning = false;
      if (this.zoomImage && this.zoomImage.nativeElement) {
        this.renderer.setStyle(this.zoomImage.nativeElement, 'cursor', 'grab');
      }
    }
  }

  onMouseLeave(): void {
    // Optional: Stop panning if mouse leaves the modal content area while dragging
    // if (this.isPanning) {
    //   this.onMouseUp();
    // }
  }


  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    this.modalService.close();
  }
}
