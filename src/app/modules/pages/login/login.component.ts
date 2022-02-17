import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../data-set/services/shared/session-storage.service';


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

  constructor(private router: Router, private sessionService: SessionStorageService) { }

  ngOnInit(): void {
    if (this.sessionService.getLoggedInAnnotator() != null) this.router.navigate(['/datasets']);
  }

  public login(){
    if (this.annotatorFormControl.valid) {
      this.sessionService.setLoggedInAnnotator(this.annotatorFormControl.value.toString());
      this.router.navigate(['/datasets']);
    }
  }

}
