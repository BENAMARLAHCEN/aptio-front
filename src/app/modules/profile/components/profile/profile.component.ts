import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
      private profileService: ProfileService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.profileService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.isLoading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  editProfile(): void {
    this.router.navigate(['/dashboard/profile/edit']);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not provided';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
