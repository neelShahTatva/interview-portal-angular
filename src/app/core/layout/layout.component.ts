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
  LucideAngularModule,
} from 'lucide-angular';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/services/auth.service';

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

  UserCircle2 = UserCircle2;
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
  ];

  toggleSidebar() {
    this.collapsed.update((v) => !v);
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.userName;
      this.email = user.email;
      this.role = user.roleName;
    }
  }

  onSignOut(): void {
    this.authService.logout();

    this.router.navigate(['/auth/login']);
  }
}
