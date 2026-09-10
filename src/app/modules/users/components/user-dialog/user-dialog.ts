import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SYSTEM_CONSTANTS } from '../../../../shared/constant/system.constants';
import { Roles } from '../../../../shared/services/roles.service';
import { RoleModel } from '../../../../shared/models/roles.models';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { ErrorMessage } from '../../../../shared/components/input-field/models/input';
import { ERROR_MESSAGE } from '../../../../shared/constant/error-message.constants';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    InputFieldComponent,
  ],
})
export class UserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolesService = inject(Roles);
  public roles: RoleModel[] = [];
  isEditMode = false;
  form = this.fb.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(SYSTEM_CONSTANTS.USERNAME_REGEX),
      ],
    ],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(255)],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(SYSTEM_CONSTANTS.PASSWORD_REGEX),
      ],
    ],
    roleId: [null, [Validators.required]],
    isActive: [true],
  });

  passwordInvalid: ErrorMessage[] = [
    {
      key: 'pattern',
      error: ERROR_MESSAGE.PASSWORD_INVALID,
    },
  ];

  usernameInvalid: ErrorMessage[] = [
    {
      key: 'pattern',
      error: ERROR_MESSAGE.USERNAME_INVALID,
    },
  ];

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {
    if (data) {
      this.isEditMode = true;
      this.form.patchValue(data);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  ngOnInit() {
    this.rolesService.getRoles().subscribe((roles: RoleModel[]) => {
      this.roles = roles;
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }
}
