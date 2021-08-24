import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UtilService } from 'src/app/util/util.service';

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

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  public login(){
    if (this.annotatorFormControl.valid) {
      UtilService.setAnnotatorId(this.annotatorFormControl.value);
      this.router.navigate(['/data-set']);
    }
  }

}
