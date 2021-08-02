import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  annotatorID: number = 0;
  annotatorFormControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);

  constructor(private router: Router) { }

  public login(){
    if (this.annotatorFormControl.valid){
      alert(this.annotatorID);
      this.router.navigate(['/data-set']);
    }
  }

  ngOnInit(): void {
  }

}
