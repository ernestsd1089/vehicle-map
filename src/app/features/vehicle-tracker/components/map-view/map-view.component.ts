import {
  AfterViewInit,
  Component,
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
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import { boundingExtent } from 'ol/extent';
import { fromLonLat } from 'ol/proj';
import { defaults, Zoom } from 'ol/control';

import {
  selectLocatedVehicles,
  selectSelectedVehicleLocation,
} from '../../store/vehicle-data/vehicle-data.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { MapMarkerManager } from './map-marker.manager';
import { MapClusterManager } from './map-cluster.manager';

export const VEHICLE_SELECT_ZOOM = 18;

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
  private markerManager!: MapMarkerManager;
  private clusterManager!: MapClusterManager;

  private readonly vectorSource = new VectorSource();
  private readonly clusterSource = new Cluster({ source: this.vectorSource, distance: 50 });

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapContainer().nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: this.clusterSource, opacity: 0 }),
      ],
      view: new View({ center: fromLonLat([24.105186, 56.946285]), zoom: 12 }),
      controls: defaults({ zoom: false }).extend([new Zoom({ className: 'ol-zoom' })]),
    });

    this.markerManager = new MapMarkerManager(this.map, this.vectorSource, this.viewContainerRef, this.store);
    this.clusterManager = new MapClusterManager(this.map, this.clusterSource, this.viewContainerRef);

    this.map.on('click', () => this.store.dispatch(VehicleDataActions.deselectVehicle()));
    this.map.on('moveend', () => this.clusterManager.update(this.markerManager.getMarkers()));

    this.store
      .select(selectSelectedVehicleLocation)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((location) => {
        this.markerManager.updateSelection(location?.vehicleid ?? null);
        if (location) this.panToPoint(location.lon, location.lat, VEHICLE_SELECT_ZOOM);
      });

    this.store
      .select(selectLocatedVehicles)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vehicles) => {
        this.clusterManager.clear();
        this.markerManager.clear();
        vehicles.forEach((v) => this.markerManager.add(v.vehicleid, v.color, v.location));
        this.panToVehicles(vehicles.map((v) => v.location));
      });
  }

  private panToPoint(lon: number, lat: number, zoom?: number): void {
    this.map.getView().animate({ center: fromLonLat([lon, lat]), zoom, duration: 300 });
  }

  private fitToCoords(coords: number[][]): void {
    if (coords.length === 0) return;
    this.map.getView().fit(boundingExtent(coords), { padding: [50, 50, 50, 50], maxZoom: 15, duration: 300 });
  }

  private panToVehicles(locations: { lat: number; lon: number }[]): void {
    this.fitToCoords(locations.map((l) => fromLonLat([l.lon, l.lat])));
  }

  ngOnDestroy(): void {
    this.clusterManager?.clear();
    this.markerManager?.clear();
    this.map?.setTarget(undefined);
  }
}
