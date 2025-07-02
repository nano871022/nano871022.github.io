import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Project, ProjectRelatedLink } from '../../../models/project.model';
import { ProjectService } from '../../../services/project';
import { ModalService } from '../../modal/modal.service'; // Import ModalService

// NgxImageZoomModule is now only needed by ModalComponent, not directly here.
// If ProjectDetailComponent was not standalone and part of an NgModule,
// NgxImageZoomModule would typically be in that NgModule's imports.
// Since both are standalone, ModalComponent imports NgxImageZoomModule itself.

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule], // Removed NgxImageZoomModule, it's in ModalComponent
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project$!: Observable<Project | undefined>;
  projectNotFound = false;

  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private location = inject(Location);
  private modalService = inject(ModalService); // Inject ModalService

  ngOnInit(): void {
    this.project$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.projectService.getProjectById(id);
        }
        this.projectNotFound = true;
        return new Observable<Project | undefined>(observer => observer.next(undefined));
      })
    );

    // A simple way to check if project was found after observable resolves
    this.project$.subscribe(project => {
      if (!project && this.route.snapshot.paramMap.get('id')) { // check id again to ensure it's not initial undefined
        this.projectNotFound = true;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  openImageModal(imageUrl: string | undefined): void {
    if (imageUrl) {
      this.modalService.open(imageUrl);
    }
  }
}
