import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from 'src/app/session-storage.service';


@Component({
  selector: 'de-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: [ './navbar.component.css' ]
})
export class NavbarComponent {

  constructor(private sessionService: SessionStorageService, private router: Router) {}

  public logout() {
    this.sessionService.clearSessionStorage();
    this.router.navigate(['/login']);
  }

  public isLoggedIn() {
    return this.sessionService.getLoggedInAnnotator() != null;
  }
}