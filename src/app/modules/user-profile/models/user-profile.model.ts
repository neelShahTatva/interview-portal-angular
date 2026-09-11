export interface UserProfile {
  id: number;
  username: string;
  email: string;
  roleId?: number;
  roleName: string;
  isActive: boolean;
  profilePictureUrl?: string;

  // Optional fields for standalone subcomponents
  role?: string;
  fullName?: string;
  skills?: string[];
  upcomingInterviews?: any[];
  upcomingInterviewCount?: number;
  recentActivity?: any[];
  totalUsers?: number;
  activeInterviewers?: number;
  interviewsThisMonth?: number;
  pendingApprovals?: number;
  interviewsConducted?: number;
  candidatesRated?: number;
  avgRating?: number;
}
