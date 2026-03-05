import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsersService } from './features/vehicle-tracker/services/users.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  userService = inject(UsersService);
  ngOnInit() {
    this.userService.getUsers().subscribe(data => console.log(data));
  }
}
