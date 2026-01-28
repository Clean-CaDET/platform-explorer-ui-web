import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../data-set/services/auth.service';
import { LocalStorageService } from '../../data-set/services/shared/local-storage.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'de-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class RegisterComponent {

  public name: string;
  public email: string;
  public experience: number;
  public ranking: number;

  private warningSnackbarOptions: any = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 3000,
    panelClass: ['warningSnackbar'],
  };
  private successSnackBarOptions: any = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 10000,
    panelClass: ['successSnackbar'],
  };
  private errorSnackBarOptions: any = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 3000,
    panelClass: ['errorSnackbar'],
  };

  constructor(private router: Router, private storageService: LocalStorageService,
    private _snackBar: MatSnackBar, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.storageService.getLoggedInAnnotator()) this.router.navigate(['/datasets']);
  }

  public register(){
    if (this.isNameValid() && this.isEmailValid() && this.isExperienceValid() && this.isRankingValid()) {
      this.authService.registerAnnotator(this.name, this.email, this.experience, this.ranking).subscribe((res: any) => {
          if (res.value.id == 0) this._snackBar.open('Annotator with this email is already registered.', 'OK', this.errorSnackBarOptions);
          else {
            this._snackBar.open('Successfully registered, your annotator ID is ' + res.value.id + '', 'OK', this.successSnackBarOptions);
            this.router.navigate(['/login']);
          }
        })
    }
  }

  private isNameValid(): boolean {
    if (!this.name) {
      this._snackBar.open('Name is required.', 'OK', this.warningSnackbarOptions);
      return false;
    } else {
      return true;
    }
  }

  private isEmailValid(): boolean {
    if (!this.email) {
      this._snackBar.open('Email is required.', 'OK', this.warningSnackbarOptions);
      return false;
    } else {
      return true;
    }
  }

  private isExperienceValid(): boolean {
    if (!this.experience) {
      this._snackBar.open('Experience is required.', 'OK', this.warningSnackbarOptions);
      return false;
    } else if (this.experience < 0) {
      this._snackBar.open('Experience cannot be negative number.', 'OK', this.warningSnackbarOptions);
      return false;
    } else {
      return true;
    }
  }

  private isRankingValid(): boolean {
    if (!this.ranking) {
      this._snackBar.open('Ranking is required.', 'OK', this.warningSnackbarOptions);
      return false;
    } else if (this.ranking < 1 || this.ranking > 3) {
      this._snackBar.open('Ranking must be between 1 and 3.', 'OK', this.warningSnackbarOptions);
      return false;
    } else {
      return true;
    }
  }
}
