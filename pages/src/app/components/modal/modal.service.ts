import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private showModal = new BehaviorSubject<boolean>(false);
  private modalImageUrl = new BehaviorSubject<string | null>(null);

  showModal$ = this.showModal.asObservable();
  modalImageUrl$ = this.modalImageUrl.asObservable();

  constructor() { }

  open(imageUrl: string) {
    this.modalImageUrl.next(imageUrl);
    this.showModal.next(true);
  }

  close() {
    this.showModal.next(false);
    this.modalImageUrl.next(null);
  }
}
