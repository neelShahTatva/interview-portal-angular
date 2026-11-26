import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BulkUploadConflictItem, BulkUploadDialogData } from '../../models/question.model';

@Component({
  selector: 'app-bulk-upload-conflict-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    ButtonComponent
],
  templateUrl: './bulk-upload-conflict-dialog.component.html',
  styleUrl: './bulk-upload-conflict-dialog.component.scss',
})
export class BulkUploadConflictDialogComponent {
  conflicts: BulkUploadConflictItem[] = [];
  title = 'Upload Conflicts Detected';

  constructor(
    private dialogRef: MatDialogRef<BulkUploadConflictDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulkUploadDialogData
  ) {
    if (data) {
      this.conflicts = data.conflicts || [];
      if (data.title) {
        this.title = data.title;
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
