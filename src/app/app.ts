import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobiService } from './features/vehicle-tracker/services/mobi.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  mobiService = inject(MobiService);
  ngOnInit() {
    this.mobiService.getUsers().subscribe(data => console.log(data));
  }
}
