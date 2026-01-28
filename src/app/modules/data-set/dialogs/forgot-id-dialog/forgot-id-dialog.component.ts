import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'de-forgot-id-dialog',
    templateUrl: './forgot-id-dialog.component.html',
    styleUrls: ['./forgot-id-dialog.component.css'],
    standalone: true,
  imports: [FormsModule, MatDialogModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule]

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
