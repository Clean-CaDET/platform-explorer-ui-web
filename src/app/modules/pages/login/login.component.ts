import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(private router: Router, private storageService: LocalStorageService) { }

  ngOnInit(): void {
    this.storageService.getLoggedInAnnotator() ? this.router.navigate(['/datasets']) : this.router.navigate(['/login']);
  }

  public login(){
    if (this.annotatorFormControl.valid) {
      this.storageService.setLoggedInAnnotator(this.annotatorFormControl.value.toString());
      this.router.navigate(['/datasets']);
    }
  }

}
