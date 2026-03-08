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
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { boundingExtent } from 'ol/extent';
import { fromLonLat } from 'ol/proj';
import { defaults, Zoom } from 'ol/control';

import {
  selectLocatedVehicles,
  selectSelectedVehicleLocation,
} from '../../store/vehicle-data/vehicle-data.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { MarkerComponent } from '../../../../shared/components/marker/marker.component';
import { VehicleLocation } from '../../models/location.model';

interface MarkerEntry {
  ref: ComponentRef<MarkerComponent>;
  overlay: Overlay;
  feature: Feature<Point>;
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
  private clusterOverlays: { overlay: Overlay; ref: ComponentRef<MarkerComponent> }[] = [];

  private readonly vectorSource = new VectorSource();
  private readonly clusterSource = new Cluster({ source: this.vectorSource, distance: 50 });

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapContainer().nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: this.clusterSource, opacity: 0 }),
      ],
      view: new View({
        center: fromLonLat([24.105186, 56.946285]),
        zoom: 12,
      }),
      controls: defaults({ zoom: false }).extend([new Zoom({ className: 'ol-zoom' })]),
    });

    this.map.on('click', () => {
      this.store.dispatch(VehicleDataActions.deselectVehicle());
    });

    this.map.on('moveend', () => this.updateClustering());

    this.store
      .select(selectSelectedVehicleLocation)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((location) => {
        this.updateMarkerSelection(location?.vehicleid ?? null);
        if (location) this.panToPoint(location.lon, location.lat, 16);
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

  private panToPoint(lon: number, lat: number, zoom?: number): void {
    this.map.getView().animate({ center: fromLonLat([lon, lat]), zoom, duration: 300 });
  }

  private fitToCoords(coords: number[][]): void {
    if (coords.length === 0) return;
    this.map
      .getView()
      .fit(boundingExtent(coords), { padding: [50, 50, 50, 50], maxZoom: 15, duration: 300 });
  }

  private panToVehicles(locations: { lat: number; lon: number }[]): void {
    this.fitToCoords(locations.map((l) => fromLonLat([l.lon, l.lat])));
  }

  private addMarker(vehicleId: number, color: string, location: VehicleLocation): void {
    const position = fromLonLat([location.lon, location.lat]);
    const { ref, overlay } = this.createMarkerOverlay(vehicleId, color, position);
    const feature = this.addVehicleToClusterSource(vehicleId, position);
    this.markers[vehicleId] = { ref, overlay, feature };
  }

  private createMarkerOverlay(
    vehicleId: number,
    color: string,
    position: number[],
  ): { ref: ComponentRef<MarkerComponent>; overlay: Overlay } {
    const ref = this.viewContainerRef.createComponent(MarkerComponent);
    ref.setInput('color', color);
    ref.setInput('icon', 'car');

    const el = ref.location.nativeElement as HTMLElement;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      this.store.dispatch(VehicleDataActions.selectVehicle({ vehicleId }));
    });

    const overlay = new Overlay({ position, positioning: 'center-center', element: el, stopEvent: false });
    this.map.addOverlay(overlay);
    return { ref, overlay };
  }

  private addVehicleToClusterSource(vehicleId: number, position: number[]): Feature<Point> {
    const feature = new Feature({ geometry: new Point(position), vehicleId });
    this.vectorSource.addFeature(feature);
    return feature;
  }

  private updateClustering(): void {
    this.clearClusterOverlays();
    Object.values(this.markers).forEach(({ overlay }) => {
      overlay.getElement()!.style.display = '';
    });

    for (const clusterFeature of this.clusterSource.getFeatures()) {
      const features = clusterFeature.get('features') as Feature<Point>[];
      if (features.length <= 1) continue;

      features.forEach((f) => {
        const el = this.markers[f.get('vehicleId') as number]?.overlay.getElement();
        if (el) el.style.display = 'none';
      });

      this.createClusterOverlay(features, (clusterFeature.getGeometry() as Point).getCoordinates());
    }
  }

  private createClusterOverlay(features: Feature<Point>[], position: number[]): void {
    const ref = this.viewContainerRef.createComponent(MarkerComponent);
    ref.setInput('label', features.length);

    const el = ref.location.nativeElement as HTMLElement;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      this.fitToCoords(features.map((f) => (f.getGeometry() as Point).getCoordinates()));
    });

    const overlay = new Overlay({
      position,
      positioning: 'center-center',
      element: el,
      stopEvent: false,
    });
    this.map.addOverlay(overlay);
    this.clusterOverlays.push({ ref, overlay });
  }

  private clearClusterOverlays(): void {
    this.clusterOverlays.forEach(({ ref, overlay }) => {
      this.map.removeOverlay(overlay);
      ref.destroy();
    });
    this.clusterOverlays = [];
  }

  private clearMarkers(): void {
    this.clearClusterOverlays();
    Object.values(this.markers).forEach(({ ref, overlay }) => {
      this.map.removeOverlay(overlay);
      ref.destroy();
    });
    this.vectorSource.clear();
    this.markers = {};
  }

  ngOnDestroy(): void {
    this.clearMarkers();
    this.map?.setTarget(undefined);
  }
}
