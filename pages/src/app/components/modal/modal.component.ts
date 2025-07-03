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
  @ViewChild('ngxImageZoom', { static: false, read: ElementRef }) ngxImageZoomRef!: ElementRef<HTMLElement>;

  showModal$: Observable<boolean>;
  imageUrl$: Observable<string | null>;
  private subscriptions = new Subscription();
  private isModalOpen: boolean = false;

  currentMagnification: number = 1;
  readonly scrollStepSize: number = 0.1;
  readonly minZoom: number = 1; // Panning typically makes sense only when > 1x
  readonly maxZoom: number = 5;

  isPanning: boolean = false;
  private lastPanX: number = 0;
  private lastPanY: number = 0;
  currentX: number = 0;
  currentY: number = 0;

  private panTargetElement: HTMLElement | null = null;
  private isZoomActiveByClick: boolean = false; // Specific for 'toggle' mode

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
        this.isModalOpen = isOpen;
        if (isOpen) {
          this.resetState();
          setTimeout(() => this.setPanTargetElement(), 0);
        } else {
          this.resetState();
        }
      })
    );
    this.subscriptions.add(
      this.imageUrl$.subscribe(() => {
        this.resetState();
        if (this.isModalOpen) {
             setTimeout(() => this.setPanTargetElement(), 0);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    if (this.isModalOpen) {
        this.setPanTargetElement();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setPanTargetElement(): void {
    if (this.ngxImageZoomRef && this.ngxImageZoomRef.nativeElement) {
      this.panTargetElement = this.ngxImageZoomRef.nativeElement;
      this.renderer.setAttribute(this.panTargetElement, 'draggable', 'false');
      // Critical: Ensure the pan target itself has a transform style to begin with if it doesn't.
      // This helps if we are applying 'translate' and the library applies 'scale'.
      // The browser combines these. If no initial transform, it might behave unexpectedly.
      // However, ngx-image-zoom likely applies its own transform for scaling.
      // this.renderer.setStyle(this.panTargetElement, 'transform', 'translate(0px, 0px)');
      this.applyCurrentPanTransform(); // Apply initial pan (usually 0,0)
    } else {
      this.panTargetElement = null;
    }
  }

  private resetState(): void {
    this.currentMagnification = 1;
    this.currentX = 0;
    this.currentY = 0;
    this.lastPanX = 0;
    this.lastPanY = 0;
    this.isPanning = false;
    this.isZoomActiveByClick = false; // Reset zoom toggle state
    if (this.panTargetElement) {
        this.applyCurrentPanTransform();
    }
     // Reset cursor on the container
    if (this.zoomImageContainerRef?.nativeElement) {
      this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', 'default');
    }
  }

  closeModal(): void {
    this.modalService.close();
  }

  // Zoom buttons will now primarily control our magnification state.
  // ngx-image-zoom with zoomMode="toggle" will react to clicks on the image itself.
  // We need to decide if zoom buttons change magnification AND simulate a click for toggle,
  // or if they just change magnification and we rely on user clicking image to activate zoom.
  // For now, let zoom buttons adjust magnification. User clicks image to activate/deactivate zoom.
  // Panning is only allowed if zoom is active (currentMagnification > 1 AND isZoomActiveByClick is true).

  zoomIn(): void {
    this.currentMagnification = Math.min(this.maxZoom, this.currentMagnification + this.scrollStepSize);
    // If zoom was not active, and now magnification > 1, we don't auto-activate zoom.
    // User must click the image to activate the "toggle" zoom mode.
    // Update cursor based on potential to pan if zoom becomes active.
    this.updateCursor();
  }

  zoomOut(): void {
    this.currentMagnification = Math.max(this.minZoom, this.currentMagnification - this.scrollStepSize);
    if (this.currentMagnification === this.minZoom) {
      this.currentX = 0;
      this.currentY = 0;
      // If zoom is not active by click, or we zoomed out to 1x, reset pan.
      if (this.panTargetElement && (!this.isZoomActiveByClick || this.currentMagnification === this.minZoom)) {
          this.applyCurrentPanTransform();
      }
    }
    // If zoom becomes inactive due to magnification <= minZoom, panning should stop.
    if (this.currentMagnification <= this.minZoom && this.isZoomActiveByClick) {
        // This scenario is tricky: if magnification is 1, but toggle was active.
        // ngx-image-zoom's "toggle" might still show zoomed if its internal state isn't reset by magnification.
        // For simplicity, if magnification is 1, we consider zoom "off" for panning.
    }
    this.updateCursor();
  }

  // We need to know when ngx-image-zoom's "toggle" mode is active.
  // Unfortunately, ngx-image-zoom doesn't seem to emit an event for its toggle state.
  // We can infer it: first click on image (if not panning) toggles zoom on.
  // This is a simplification. A more robust way would be an output event from the library.

  onImageClick(event: MouseEvent): void {
    // This event should be on the zoom-image-container or ngx-image-zoom itself.
    // Let's assume it's on zoom-image-container for now.
    if (this.isPanning) return; // Don't toggle zoom if click was part of a pan.

    // If zoomMode is "toggle", the first click on the image itself should activate/deactivate the zoom.
    // We'll use our own flag `isZoomActiveByClick`.
    // The click on lib-ngx-image-zoom will be handled by the library for zoom toggling.
    // We need to synchronize our `isZoomActiveByClick`.

    // This is complex because the library handles the click to toggle its internal zoom.
    // We'll assume the first click on the image (when not panning) is to toggle the zoom.
    // If currentMagnification is already > 1, a click might be to *deactivate* zoom.
    // Or, if magnification is 1, a click is to *activate* it.

    // Let's simplify: if magnification > 1, we assume a click might be for panning setup.
    // The library's own click handler will manage its "toggle" state.
    // We only enable panning if magnification > 1. The "toggle" state is implicit.
    // For "toggle" mode, the library itself handles the zoom activation on click.
    // We just need to ensure panning only occurs when currentMagnification > 1.
    // The `isZoomActiveByClick` logic might be overly complex if library handles toggle well.
    // Let's remove `isZoomActiveByClick` for now and rely on currentMagnification.
    this.updateCursor(); // Update cursor after a click might change zoom state.
  }


  onMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) return;

    // With zoomMode="toggle", a click might be to toggle zoom OR start a pan.
    // If it's the first click that enables zoom, we don't want to immediately pan.
    // This requires careful handling. ngx-image-zoom will handle the click for zoom.
    // If zoom is *already* active (currentMagnification > 1), then mousedown can start pan.

    if (this.currentMagnification > this.minZoom && this.panTargetElement) {
      // Check if the click is on the ngx-image-zoom component itself or its children
      const clickedOnZoomArea = this.ngxImageZoomRef?.nativeElement?.contains(event.target as Node);

      if (clickedOnZoomArea) {
        this.isPanning = true;
        this.lastPanX = event.clientX - this.currentX;
        this.lastPanY = event.clientY - this.currentY;
        this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', 'grabbing');
        event.preventDefault();
      }
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning && this.panTargetElement) {
      this.currentX = event.clientX - this.lastPanX;
      this.currentY = event.clientY - this.lastPanY;
      this.applyCurrentPanTransform();
    }
  }

  onMouseUp(event: MouseEvent): void {
    // If this mouseup is the one that toggled zoom off via ngx-image-zoom, reset pan vars.
    // This is hard to detect without an event from ngx-image-zoom.
    // For now, just handle panning state.
    if (this.isPanning) {
      this.isPanning = false;
    }
    this.updateCursor(); // Cursor depends on whether zoom is active
  }

  onMouseLeaveContainer(): void { // Renamed to be more specific
    if (this.isPanning) {
      this.isPanning = false; // Stop panning if mouse leaves the interactive container
      this.updateCursor();
    }
  }

  private applyCurrentPanTransform(): void {
    if (this.panTargetElement) {
      this.renderer.setStyle(this.panTargetElement, 'transform', `translate(${this.currentX}px, ${this.currentY}px)`);
    }
  }

  private updateCursor(): void {
    if (!this.zoomImageContainerRef?.nativeElement) return;

    // If zoom is active (magnification > 1), cursor is 'grab', unless panning then 'grabbing'.
    // If not zoomed, cursor is 'default'.
    // For "toggle" mode, the library might show zoomed image even if currentMagnification was externally set to 1
    // if its internal toggle state is still "on". This makes cursor logic tricky.
    // We assume if currentMagnification > 1, it's zoomed.
    if (this.isPanning) {
        this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', 'grabbing');
    } else if (this.currentMagnification > this.minZoom) {
        this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', 'grab');
    } else {
        this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', 'default');
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) {
    this.modalService.close();
  }
}
