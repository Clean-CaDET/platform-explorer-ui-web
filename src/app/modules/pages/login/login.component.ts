import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';


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
      sessionStorage.setItem('annotatorId', this.annotatorFormControl.value.toString());
      this.router.navigate(['/data-set']);
    }
  }

}
