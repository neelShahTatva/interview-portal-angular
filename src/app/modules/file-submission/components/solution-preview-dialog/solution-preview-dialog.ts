import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-solution-preview-dialog',
  standalone: true,
  templateUrl: './solution-preview-dialog.html',
  styleUrl: './solution-preview-dialog.scss',
  imports: [
    MatDialogModule,
    ButtonComponent,
  ]
})
export class SolutionPreviewDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {}
}