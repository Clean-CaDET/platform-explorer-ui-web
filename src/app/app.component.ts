import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './modules/data-set/nav/navbar.component';

@Component({
    selector: 'de-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterModule, NavbarComponent]
})
export class AppComponent {
  title = 'platform-explorer-ui-web';
}
