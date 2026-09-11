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
import { ButtonComponent } from '../../../../shared/components/button/button.component';

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
    ButtonComponent,
  ],
})
export class UserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolesService = inject(Roles);
  public roles: RoleModel[] = [
    { id: 1, roleName: 'Admin' },
    { id: 2, roleName: 'Interviewer' },
  ];
  isEditMode = false;
  isSelfProfile = false;
  submitted = false;

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
      [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
        Validators.maxLength(255),
      ],
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

  emailInvalid: ErrorMessage[] = [
    {
      key: 'pattern',
      error: 'Enter a valid email address',
    },
  ];

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {
    if (data) {
      this.isEditMode = true;
      this.isSelfProfile = !!data.isSelfProfile;
      this.form.patchValue({
        ...data,
        roleId: data.roleId !== undefined && data.roleId !== null ? Number(data.roleId) : null,
      });
      // Password is only required on create, not on edit
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  ngOnInit() {
    this.rolesService.getRoles().subscribe({
      next: (roles: RoleModel[]) => {
        if (Array.isArray(roles) && roles.length > 0) {
          this.roles = roles;
        }
      },
      error: () => {
        // Fallback default roles are already set
      },
    });
  }

  submit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }
}
