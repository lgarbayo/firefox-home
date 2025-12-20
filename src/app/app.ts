import { Component } from '@angular/core';
import { HomePageComponent } from './component/home_page/home_page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomePageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
