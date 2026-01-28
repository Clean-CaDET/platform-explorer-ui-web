import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Annotator } from '../../data-set/model/annotator/annotator.model';
import { AuthService } from '../../data-set/services/auth.service';
import { LocalStorageService } from '../../data-set/services/shared/local-storage.service';


@Component({
    selector: 'de-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: false
})
export class ProfileComponent implements OnInit {

  public annotator: Annotator;
  public editMode: boolean = false;
  public oldEmail: string;
  public oldName: string;
  public oldRanking: number;
  public oldExperience: number;

  private warningSnackbarOptions: any = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 3000,
    panelClass: ['warningSnackbar'],
  };

  constructor(private router: Router, private storageService: LocalStorageService,
    private _snackBar: MatSnackBar,private dialog: MatDialog, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getAnnotatorById(Number(this.storageService.getLoggedInAnnotator())).subscribe(res => {
      this.annotator = res;
      this.oldEmail = res.email;
      this.oldName = res.name;
      this.oldRanking = res.ranking;
      this.oldExperience = res.yearsOfExperience;
    })
  }

  public edit() {
    this.editMode = true;
  }

  public save() {
    this.authService.updateAnnotator(this.annotator).subscribe(res => {
      if (res == null) {
        this._snackBar.open('Annotator with this email is already registered.', 'OK', this.warningSnackbarOptions);
        this.annotator.email = this.oldEmail;
        this.annotator.name = this.oldName;
        this.annotator.ranking = this.oldRanking;
        this.annotator.yearsOfExperience = this.oldExperience;
      } else {
        this.oldEmail = this.annotator.email;
        this.oldName = this.annotator.name;
        this.oldRanking = this.annotator.ranking;
        this.oldExperience = this.annotator.yearsOfExperience;
      }
    });
    this.editMode = false;
  }
}
