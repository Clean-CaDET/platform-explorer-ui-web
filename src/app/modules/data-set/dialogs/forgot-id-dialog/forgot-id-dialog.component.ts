import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'de-forgot-id-dialog',
    templateUrl: './forgot-id-dialog.component.html',
    styleUrls: ['./forgot-id-dialog.component.css'],
    standalone: false
})

export class ForgotIdDialogComponent implements OnInit {

  public email: string;

  constructor(private dialogRef: MatDialogRef<ForgotIdDialogComponent>,
    private authService: AuthService) { }

  ngOnInit(): void {
  }

  public submit(): void {
    if (!this.isValidInput()) return;
    this.authService.getAnnotatorByEmail(this.email).subscribe(res => {
      if (res) this.dialogRef.close(res.id);
      else this.dialogRef.close(null);
    })
  }

  private isValidInput(): boolean {
    return this.email != '';
  }

}
