import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ButtonComponent } from '@shared/components';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    ButtonComponent
  ],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {

  deleteComment: string = '';
  submitted: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {}

  confirm(): void {
    // Comment is mandatory only when requireComment is true
    if (this.data?.requireComment && !this.deleteComment.trim()) {
      this.submitted = true;
      return;
    }

    this.dialogRef.close({
      confirmed: true,
      comment: this.deleteComment.trim()
    });
  }

  cancel(): void {
    this.dialogRef.close({
      confirmed: false
    });
  }
}