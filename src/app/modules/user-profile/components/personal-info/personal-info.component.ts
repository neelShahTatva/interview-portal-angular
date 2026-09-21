import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserProfile } from '@modules/user-profile/models';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss',
})
export class PersonalInfoComponent {
  @Input() user!: UserProfile;
}
