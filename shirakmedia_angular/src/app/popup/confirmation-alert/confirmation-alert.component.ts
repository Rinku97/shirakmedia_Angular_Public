import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-confirmation-alert',
  templateUrl: './confirmation-alert.component.html',
  styleUrls: ['./confirmation-alert.component.scss']
})
export class ConfirmationAlertComponent {

  message:string  = "";

  constructor(public dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    if(this.data){
      this.message = this.data.message;
    }
  }

  onYesOrNoClick(btnName:string): void {
    if(btnName == "yes"){
      this.dialogRef.close(btnName);
    }

    this.dialogRef.close(btnName);
  }

}
