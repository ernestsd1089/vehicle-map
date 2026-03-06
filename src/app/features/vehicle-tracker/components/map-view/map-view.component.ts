import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { MobiService } from '../../services/mobi.service';
import { Store } from '@ngrx/store';
import { UsersFeature } from '../../store/users/users.reducer';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
})
export class MapViewComponent implements OnInit {
  store = inject(Store);

  ngOnInit(): void {}
}
