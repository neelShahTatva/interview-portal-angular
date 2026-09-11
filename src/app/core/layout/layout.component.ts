import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  ClipboardList,
  Activity,
  FileCheck,
  Menu,
  Bot,
  LogOut,
  ChevronDown,
  UserCircle2,
  UserCircle,
  LucideAngularModule,
} from 'lucide-angular';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatMenuModule,
    MatButtonModule,
    LucideAngularModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class Layout {
  collapsed = signal(false);
  ChevronDown = ChevronDown;

  userName = '';
  email = '';
  role = 'ADMIN';
  profilePictureUrl: string | null = null;

  get headerAvatarUrl(): string | null {
    if (!this.profilePictureUrl) return null;
    if (
      this.profilePictureUrl.startsWith('http://') ||
      this.profilePictureUrl.startsWith('https://') ||
      this.profilePictureUrl.startsWith('data:')
    ) {
      return this.profilePictureUrl;
    }
    if (this.profilePictureUrl.startsWith('/')) {
      return `${environment.baseUrl}${this.profilePictureUrl}`;
    }
    return `${environment.baseUrl}/uploads/profile-pictures/${this.profilePictureUrl}`;
  }

  UserCircle2 = UserCircle2;
  UserCircle = UserCircle;
  Menu = Menu;
  LogOut = LogOut;
  Bot = Bot;

  constructor(private authService: AuthService, private router: Router) { }

  navItems = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: LayoutDashboard,
    },

    {
      label: 'Users',
      route: '/users',
      icon: Users,
    },

    {
      label: 'Question Bank',
      route: '/question-bank',
      icon: BookOpen,
    },

    {
      label: 'Candidates',
      route: '/candidates',
      icon: UserCheck,
    },

    {
      label: 'Assessments',
      route: '/assessments',
      icon: ClipboardList,
    },

    {
      label: 'Evaluations',
      route: '/evaluations',
      icon: Activity,
    },

    {
      label: 'Submissions',
      route: '/submissions',
      icon: FileCheck,
    },

    {
      label: 'My Profile',
      route: '/profile',
      icon: UserCircle,
    },
  ];

  toggleSidebar() {
    this.collapsed.update((v) => !v);
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userName = user.userName;
        this.email = user.email;
        this.role = user.roleName;
        this.profilePictureUrl = user.profilePictureUrl || user.profilePicture || null;
      }
    });
  }

  onSignOut(): void {
    this.authService.logout();

    this.router.navigate(['/auth/login']);
  }
}
