import { trigger, transition, style, animate } from '@angular/animations';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-show-large-image',
  templateUrl: './show-large-image.component.html',
  styleUrls: ['./show-large-image.component.scss'],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('300ms', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class ShowLargeImageComponent {

  constructor(
    public dialogRef: MatDialogRef<ShowLargeImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string, name: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

}
