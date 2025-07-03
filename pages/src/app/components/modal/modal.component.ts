import { Component, OnInit, HostListener, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
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
export class ModalComponent implements OnInit, OnDestroy {
  // Use a more specific target for ViewChild if possible, or ensure #zoomImageContainer is on the correct element in HTML
  @ViewChild('zoomImageContainer', { static: false }) zoomImageContainerRef!: ElementRef<HTMLDivElement>;

  showModal$: Observable<boolean>;
  imageUrl$: Observable<string | null>;
  private subscriptions = new Subscription();

  // Zoom properties
  currentMagnification: number = 1;
  readonly scrollStepSize: number = 0.1;
  readonly minZoom: number = 1; // Min zoom should be 1 to prevent issues with panning logic
  readonly maxZoom: number = 5;

  // Panning properties
  isPanning: boolean = false;
  private lastPanX: number = 0;
  private lastPanY: number = 0;
  currentX: number = 0;
  currentY: number = 0;

  // Store the reference to the dynamically created zoom image element
  private zoomedImageElement: HTMLElement | null = null;


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
        if (!isOpen) {
          this.resetZoomAndPan();
        } else {
          // Attempt to find the zoomed image element when modal opens or image changes
          // This might need a slight delay if ngx-image-zoom creates elements asynchronously
          setTimeout(() => this.attachToZoomedImage(), 0);
        }
      })
    );
    this.subscriptions.add(
      this.imageUrl$.subscribe(() => {
        this.resetZoomAndPan();
        if (this.showModal$) { // If modal is already open when image url changes
            setTimeout(() => this.attachToZoomedImage(), 0);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private attachToZoomedImage(): void {
    if (this.zoomImageContainerRef && this.zoomImageContainerRef.nativeElement) {
      // ngx-image-zoom creates an image dynamically. We need to find it.
      // This selector might need adjustment based on ngx-image-zoom's internal structure.
      // Common is that it creates a div wrapper and then an img tag inside.
      // Or it might be a div that has the background image.
      // Let's assume it's the first `<img>` tag within the `lib-ngx-image-zoom` component.
      const ngxImageZoomComponent = this.zoomImageContainerRef.nativeElement.querySelector('lib-ngx-image-zoom');
      if (ngxImageZoomComponent) {
        // We are looking for the element that gets transformed (scaled) by ngx-image-zoom
        // This is often a direct child or a specific classed element.
        // For ngx-image-zoom, the actual image that is displayed zoomed is often inside a container.
        // Let's assume the library applies zoom to an image tag or a specific container.
        // The panning should be applied to the same element that `magnification` scales.
        // The library itself might be transforming an inner element.
        // We will apply our pan (translate) transform to the same element.
        // The `ngxImageZoomFullContainer` is a common class used by such libraries for the zoomed image.
        this.zoomedImageElement = ngxImageZoomComponent.querySelector('.ngxImageZoomFullContainer > img, .ngxImageZoomContainer > img');

        if (!this.zoomedImageElement && ngxImageZoomComponent.firstChild && ngxImageZoomComponent.firstChild instanceof HTMLElement) {
            // Fallback: try to use the first HTMLElement child of lib-ngx-image-zoom component
            this.zoomedImageElement = ngxImageZoomComponent.firstChild as HTMLElement;
        }
         // Ensure the element we found is what we expect, e.g., an IMG or a DIV with background
        if (this.zoomedImageElement) {
            this.renderer.setStyle(this.zoomedImageElement, 'transform-origin', 'top left');
        }
      }
    }
  }


  resetZoomAndPan(): void {
    this.currentMagnification = 1;
    this.currentX = 0;
    this.currentY = 0;
    this.lastPanX = 0;
    this.lastPanY = 0;
    this.isPanning = false;
    if (this.zoomedImageElement) {
      this.applyTransform();
    }
  }

  closeModal(): void {
    this.modalService.close();
  }

  zoomIn(): void {
    const oldMagnification = this.currentMagnification;
    this.currentMagnification = Math.min(this.maxZoom, this.currentMagnification + this.scrollStepSize);
    this.adjustPanForZoom(oldMagnification, this.currentMagnification);
    if (!this.zoomedImageElement) this.attachToZoomedImage(); // Ensure we have the element
    this.applyTransform();
  }

  zoomOut(): void {
    const oldMagnification = this.currentMagnification;
    this.currentMagnification = Math.max(this.minZoom, this.currentMagnification - this.scrollStepSize);
    this.adjustPanForZoom(oldMagnification, this.currentMagnification);

    if (this.currentMagnification === this.minZoom) { // Typically minZoom is 1
      // Reset pan only if zoomed all the way out to original size
      this.currentX = 0;
      this.currentY = 0;
    }
    if (!this.zoomedImageElement) this.attachToZoomedImage(); // Ensure we have the element
    this.applyTransform();
  }

  // Adjust pan position to keep the zoomed point stable
  private adjustPanForZoom(oldMagnification: number, newMagnification: number): void {
    // This is a simplified adjustment. A more accurate one would consider mouse position.
    // For now, scale current pan based on zoom change.
    const zoomRatio = newMagnification / oldMagnification;
    this.currentX *= zoomRatio;
    this.currentY *= zoomRatio;
  }

  onMouseDown(event: MouseEvent): void {
    // Prevent dragging if the target is a button (like zoom controls)
    if ((event.target as HTMLElement).closest('button')) {
        return;
    }
    if (this.currentMagnification > this.minZoom) { // Allow panning only when zoomed
      this.isPanning = true;
      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
      if (this.zoomImageContainerRef?.nativeElement) {
        this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', 'grabbing');
      }
      event.preventDefault(); // Prevent text selection or other default drag behaviors
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      const deltaX = event.clientX - this.lastPanX;
      const deltaY = event.clientY - this.lastPanY;

      this.currentX += deltaX;
      this.currentY += deltaY;

      this.applyTransform();

      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
    }
  }

  onMouseUp(): void {
    if (this.isPanning) {
      this.isPanning = false;
      if (this.zoomImageContainerRef?.nativeElement) {
        this.renderer.setStyle(this.zoomImageContainerRef.nativeElement, 'cursor', 'grab');
      }
    }
  }

  onMouseLeave(): void {
     // If you want panning to stop when mouse leaves container:
    if (this.isPanning) {
      this.onMouseUp();
    }
  }

  private applyTransform(): void {
    if (this.zoomedImageElement) {
        // ngx-image-zoom applies its own scale. We need to combine our translate with its scale.
        // The library might reset transform if we directly set it.
        // A common pattern for ngx-image-zoom is that it scales the image.
        // We need to ensure our translation is applied *in addition* to its scaling.
        // The ideal way is if ngx-image-zoom provides an API for this or event outputs for current transform.
        // Lacking that, we assume it scales using `transform: scale(...)`.
        // We will set `transform: translate(...) scale(...)`.
        // Note: currentMagnification is handled by ngx-image-zoom's [magnification] input.
        // We should only apply translateX and translateY.
        // The challenge: ngx-image-zoom also uses transform for its zoom.
        // We must ensure our panning transform doesn't get overwritten or conflict.
        // For now, let's assume we are transforming a container *around* ngx-image-zoom,
        // or ngx-image-zoom's own scaling doesn't interfere if we re-apply scale too.

        // The `ngx-image-zoom` component itself handles the scaling via its `magnification` input.
        // We should apply panning to an element that contains it, or to an internal element
        // if we can reliably target it and if the library doesn't fight back.

        // Let's try to apply transform to the `this.zoomedImageElement` we identified.
        // This element is usually the one that `ngx-image-zoom` scales.
        // We'll add our translation to its existing transform.
        // This is tricky; ngx-image-zoom might overwrite this.
        // A robust solution might require forking/modifying ngx-image-zoom or finding a library with built-in panning.

        // For now, this will apply translate and let ngx-image-zoom handle scale.
        // The `transform-origin: top left` helps make translations more predictable.
        this.renderer.setStyle(this.zoomedImageElement, 'transform', `translate(${this.currentX}px, ${this.currentY}px)`);
        // If ngx-image-zoom also sets scale on this.zoomedImageElement, they will conflict.
        // The component's template passes `[magnification]="currentMagnification"` to `lib-ngx-image-zoom`.
        // This means ngx-image-zoom is responsible for the scale transform.
        // We must ensure our translation is applied to an element that it makes sense for.
        // The most common pattern for these zoom libraries is:
        // <outer-container (for viewport)>
        //   <inner-container (this gets panned and zoomed)>
        //     <image>
        // Our this.zoomedImageElement is likely the <inner-container> or <image> itself.
    }
  }

  // This is the existing method, ensure it's not modified unintentionally.
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) { // Changed type from KeyboardEvent to Event as per original
    const keyboardEvent = event as KeyboardEvent; // Cast to use properties like 'key' if needed, though original didn't
    // The decorator handles the key check, so direct call to close is fine
    this.modalService.close();
  }
}
