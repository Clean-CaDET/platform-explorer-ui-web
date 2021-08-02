import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

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

  constructor() { }

  public login(){
    if (this.annotatorFormControl.valid){
      alert(this.annotatorID);
    }
  }

  ngOnInit(): void {
  }

}
