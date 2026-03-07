import {
  AfterViewInit,
  Component,
  ComponentRef,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { boundingExtent } from 'ol/extent';
import { fromLonLat } from 'ol/proj';
import { defaults, Zoom } from 'ol/control';

import {
  selectLocatedVehicles,
  selectSelectedVehicleLocation,
} from '../../store/vehicle-data/vehicle-data.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { MarkerComponent } from '../../../../shared/components/marker/marker.component';

interface MarkerEntry {
  ref: ComponentRef<MarkerComponent>;
  overlay: Overlay;
}

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  host: { class: 'block w-full h-full' },
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  private readonly store = inject(Store);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private map!: Map;
  private markers: Record<number, MarkerEntry> = {};

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapContainer().nativeElement,
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

    this.store
      .select(selectSelectedVehicleLocation)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((location) => {
        this.updateMarkerSelection(location?.vehicleid ?? null);
        if (location) {
          this.map.getView().animate({
            center: fromLonLat([location.lon, location.lat]),
            duration: 300,
          });
        }
      });

    this.store
      .select(selectLocatedVehicles)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vehicles) => {
        this.clearMarkers();
        vehicles.forEach((v) => this.addMarker(v.vehicleid, v.color, v.location));
        this.panToVehicles(vehicles.map((v) => v.location));
      });
  }

  private updateMarkerSelection(vehicleId: number | null): void {
    Object.values(this.markers).forEach(({ ref }) => ref.setInput('selected', false));
    if (vehicleId !== null) {
      this.markers[vehicleId]?.ref.setInput('selected', true);
    }
  }

  private panToVehicles(locations: { lat: number; lon: number }[]): void {
    if (locations.length === 0) return;
    const coords = locations.map((l) => fromLonLat([l.lon, l.lat]));
    this.map
      .getView()
      .fit(boundingExtent(coords), { padding: [50, 50, 50, 50], maxZoom: 15, duration: 300 });
  }

  private addMarker(
    vehicleId: number,
    color: string,
    location: { lat: number; lon: number },
  ): void {
    const ref = this.viewContainerRef.createComponent(MarkerComponent);
    ref.setInput('color', color);
    ref.setInput('icon', 'car');

    const el = ref.location.nativeElement as HTMLElement;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      this.store.dispatch(VehicleDataActions.selectVehicle({ vehicleId }));
    });

    const overlay = new Overlay({
      position: fromLonLat([location.lon, location.lat]),
      positioning: 'center-center',
      element: el,
      stopEvent: false,
    });

    this.map.addOverlay(overlay);
    this.markers[vehicleId] = { ref, overlay };
  }

  private clearMarkers(): void {
    Object.values(this.markers).forEach(({ ref, overlay }) => {
      this.map.removeOverlay(overlay);
      ref.destroy();
    });
    this.markers = {};
  }

  ngOnDestroy(): void {
    this.clearMarkers();
    this.map?.setTarget(undefined);
  }
}
