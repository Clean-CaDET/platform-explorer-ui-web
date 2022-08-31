import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ForgotIdDialogComponent } from '../../data-set/dialogs/forgot-id-dialog/forgot-id-dialog.component';
import { LocalStorageService } from '../../data-set/services/shared/local-storage.service';


@Component({
  selector: 'de-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  annotatorFormControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);

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
    private _snackBar: MatSnackBar,private dialog: MatDialog) { }

  ngOnInit(): void {
    this.storageService.getLoggedInAnnotator() ? this.router.navigate(['/datasets']) : this.router.navigate(['/login']);
  }

  public login(){
    if (this.annotatorFormControl.valid) {
      this.storageService.setLoggedInAnnotator(this.annotatorFormControl.value.toString());
      this.router.navigate(['/datasets']);
    }
  }

  public forgotId() {
    let dialogRef = this.dialog.open(ForgotIdDialogComponent);
    dialogRef.afterClosed().subscribe((id: number) => {
        if (id) this._snackBar.open('Your annotator ID is ' + id + '', 'OK', this.successSnackBarOptions);
        else this._snackBar.open('Annotator ID for this email does not exist.', 'OK', this.errorSnackBarOptions);
    });
  }
}
