import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { boundingExtent } from 'ol/extent';
import { fromLonLat } from 'ol/proj';
import { defaults, Zoom } from 'ol/control';

import {
  selectSelectedVehicleLocation,
  selectVehiclesWithLocations,
} from '../../store/vehicle-data/vehicle-data.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { MarkerComponent } from '../../../../shared/components/marker/marker.component';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  host: { class: 'block w-full h-full' },
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private mapContainer!: ElementRef<HTMLDivElement>;

  private readonly store = inject(Store);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private map!: Map;
  private subscription!: Subscription;
  private selectedSub!: Subscription;
  private markerRefs: Record<number, ComponentRef<MarkerComponent>> = {};
  private overlays: Overlay[] = [];

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat([24.105186, 56.946285]),
        zoom: 12,
      }),
      controls: defaults({ zoom: false }).extend([new Zoom({ className: 'ol-zoom' })]),
    });

    this.map.on('click', () => {
      this.store.dispatch(VehicleDataActions.deselectVehicle());
    });

    this.selectedSub = this.store.select(selectSelectedVehicleLocation).subscribe((location) => {
      Object.values(this.markerRefs).forEach((r) => r.setInput('selected', false));
      if (location) {
        this.markerRefs[location.vehicleid]?.setInput('selected', true);
        this.map.getView().animate({
          center: fromLonLat([location.lon, location.lat]),
          duration: 300,
        });
      }
    });

    this.subscription = this.store.select(selectVehiclesWithLocations).subscribe((vehicles) => {
      this.clearMarkers();

      const located = vehicles.filter((v) => v.location !== null);

      located.forEach((v) => {
        const ref = this.viewContainerRef.createComponent(MarkerComponent);
        ref.setInput('color', v.color);
        ref.setInput('icon', 'car');

        const el = ref.location.nativeElement as HTMLElement;
        el.addEventListener('click', (event) => {
          event.stopPropagation();
          this.store.dispatch(VehicleDataActions.selectVehicle({ vehicleId: v.vehicleid }));
        });

        const overlay = new Overlay({
          position: fromLonLat([v.location!.lon, v.location!.lat]),
          positioning: 'center-center',
          element: el,
          stopEvent: false,
        });

        this.map.addOverlay(overlay);
        this.overlays.push(overlay);
        this.markerRefs[v.vehicleid] = ref;
      });

      if (located.length > 0) {
        const coords = located.map((v) => fromLonLat([v.location!.lon, v.location!.lat]));
        this.map
          .getView()
          .fit(boundingExtent(coords), { padding: [50, 50, 50, 50], maxZoom: 15, duration: 300 });
      }
    });
  }

  private clearMarkers(): void {
    this.overlays.forEach((o) => this.map.removeOverlay(o));
    Object.values(this.markerRefs).forEach((ref) => ref.destroy());
    this.overlays = [];
    this.markerRefs = {};
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.selectedSub?.unsubscribe();
    this.clearMarkers();
    this.map?.setTarget(undefined);
  }
}
