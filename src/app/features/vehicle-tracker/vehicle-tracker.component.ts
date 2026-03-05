import { Component, inject } from "@angular/core";
import { ListViewComponent } from "./components/list-view/list-view.component";
import { MobiService } from "./services/mobi.service";

@Component({
    selector: 'app-vehicle-tracker',
    templateUrl: './vehicle-tracker.component.html',
    imports: [ListViewComponent]
})
export class VehicleTrackerComponent {
      mobiService = inject(MobiService);
  ngOnInit() {
    this.mobiService.getUsers().subscribe(data => console.log(data));
  }
}