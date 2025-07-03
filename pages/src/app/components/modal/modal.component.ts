import { Component, OnInit, HostListener, ElementRef, ViewChild, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgxImageZoomModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('zoomImageContainer', { static: false }) zoomImageContainerRef!: ElementRef<HTMLDivElement>;
  // Attempt to get a direct reference to the ngx-image-zoom component instance or its element
  @ViewChild('ngxImageZoom', { static: false, read: ElementRef }) ngxImageZoomRef!: ElementRef<HTMLElement>;

  showModal$: Observable<boolean>;
  imageUrl$: Observable<string | null>;
  private subscriptions = new Subscription();
  private isModalOpen: boolean = false; // Track modal state locally

  currentMagnification: number = 1;
  readonly scrollStepSize: number = 0.1;
  readonly minZoom: number = 1;
  readonly maxZoom: number = 5;

  isPanning: boolean = false;
  private lastPanX: number = 0;
  private lastPanY: number = 0;
  currentX: number = 0;
  currentY: number = 0;

  private panTargetElement: HTMLElement | null = null;

  constructor(
    private modalService: ModalService,
    private renderer: Renderer2
  ) {
    this.showModal$ = this.modalService.showModal$;
    this.imageUrl$ = this.modalService.modalImageUrl$;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.showModal$.subscribe(isOpen => {
        this.isModalOpen = isOpen; // Update local state
        if (isOpen) {
          this.resetZoomAndPan();
          // Defer finding the pan target until view is initialized and ngx-image-zoom is present
          setTimeout(() => this.setPanTargetElement(), 0);
        } else {
          this.resetZoomAndPan(); // Also resets isPanning flag
        }
      })
    );
    this.subscriptions.add(
      this.imageUrl$.subscribe(() => {
        this.resetZoomAndPan();
        if (this.isModalOpen) { // Use local state to check if modal is currently open
             setTimeout(() => this.setPanTargetElement(), 0);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // Initial setup of pan target if modal is already shown (e.g. on component load)
    if (this.isModalOpen) { // Use local state
        this.setPanTargetElement();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setPanTargetElement(): void {
    if (this.ngxImageZoomRef && this.ngxImageZoomRef.nativeElement) {
      this.panTargetElement = this.ngxImageZoomRef.nativeElement;
      // Ensure the pan target itself is not draggable if it's an image, to prevent ghosting.
      this.renderer.setAttribute(this.panTargetElement, 'draggable', 'false');
      this.applyTransform(); // Apply initial transform if any
    } else if (this.zoomImageContainerRef && this.zoomImageContainerRef.nativeElement) {
      // Fallback if ViewChild for ngxImageZoom didn't work as expected (e.g. due to *ngIf)
      const ngxZoomElement = this.zoomImageContainerRef.nativeElement.querySelector('lib-ngx-image-zoom');
      if (ngxZoomElement && ngxZoomElement instanceof HTMLElement) {
        this.panTargetElement = ngxZoomElement;
        this.renderer.setAttribute(this.panTargetElement, 'draggable', 'false');
        this.applyTransform();
      } else {
        this.panTargetElement = null;
      }
    } else {
        this.panTargetElement = null;
    }
  }

  resetZoomAndPan(): void {
    this.currentMagnification = 1;
    this.currentX = 0;
    this.currentY = 0;
    this.lastPanX = 0;
    this.lastPanY = 0;
    this.isPanning = false;
    // Re-set pan target in case of dynamic changes or if modal is re-shown
    // No, setPanTargetElement should be called when modal becomes visible or image changes.
    // Here, we just apply the reset transform.
    if (this.panTargetElement) {
        this.applyTransform(); // This will apply translate(0,0)
    }
  }

  closeModal(): void {
    this.modalService.close();
  }

  zoomIn(): void {
    this.currentMagnification = Math.min(this.maxZoom, this.currentMagnification + this.scrollStepSize);
    // No need to call applyTransform() here for zoom, as ngx-image-zoom handles its own magnification.
    // Panning transform is independent.
  }

  zoomOut(): void {
    this.currentMagnification = Math.max(this.minZoom, this.currentMagnification - this.scrollStepSize);
    if (this.currentMagnification === this.minZoom) {
      this.currentX = 0; // Reset pan position when fully zoomed out
      this.currentY = 0;
      if (this.panTargetElement) {
          this.applyTransform(); // Apply reset pan
      }
    }
  }

  onMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) return;

    if (this.currentMagnification > this.minZoom && this.panTargetElement) {
      this.isPanning = true;
      this.lastPanX = event.clientX - this.currentX; // Adjust start position by current translation
      this.lastPanY = event.clientY - this.currentY;

      // Set cursor on the container that has the mouse events attached
      if (this.zoomImageContainerRef?.nativeElement) {
        this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', 'grabbing');
      }
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning && this.panTargetElement) {
      this.currentX = event.clientX - this.lastPanX;
      this.currentY = event.clientY - this.lastPanY;
      this.applyTransform();
    }
  }

  onMouseUp(): void {
    if (this.isPanning) {
      this.isPanning = false;
      if (this.zoomImageContainerRef?.nativeElement) {
         this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', (this.currentMagnification > this.minZoom ? 'grab' : 'default'));
      }
    }
  }

  onMouseLeave(): void {
    if (this.isPanning) {
      this.onMouseUp(); // Stop panning if mouse leaves the modal content area
    }
  }

  private applyTransform(): void {
    if (this.panTargetElement) {
      this.renderer.setStyle(this.panTargetElement, 'transform', `translate(${this.currentX}px, ${this.currentY}px)`);
      // The ngx-image-zoom component will handle its own scaling internally.
      // We are moving the entire component.
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    this.modalService.close();
  }
}
