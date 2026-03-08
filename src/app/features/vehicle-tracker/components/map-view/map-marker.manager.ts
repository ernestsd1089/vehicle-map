import { ComponentRef, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { MarkerComponent } from '../../../../shared/components/marker/marker.component';
import { VehicleLocation } from '../../models/location.model';

export interface MarkerEntry {
  ref: ComponentRef<MarkerComponent>;
  overlay: Overlay;
  feature: Feature<Point>;
}

export class MapMarkerManager {
  private markers: Record<number, MarkerEntry> = {};

  constructor(
    private readonly map: Map,
    private readonly vectorSource: VectorSource,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly store: Store,
  ) {}

  getMarkers(): Record<number, MarkerEntry> {
    return this.markers;
  }

  add(vehicleId: number, color: string, location: VehicleLocation): void {
    const position = fromLonLat([location.lon, location.lat]);
    const { ref, overlay } = this.createOverlay(vehicleId, color, position);
    const feature = this.addToVectorSource(vehicleId, position);
    this.markers[vehicleId] = { ref, overlay, feature };
  }

  updateSelection(vehicleId: number | null): void {
    Object.values(this.markers).forEach(({ ref }) => ref.setInput('selected', false));
    if (vehicleId !== null) {
      this.markers[vehicleId]?.ref.setInput('selected', true);
    }
  }

  clear(): void {
    Object.values(this.markers).forEach(({ ref, overlay }) => {
      this.map.removeOverlay(overlay);
      ref.destroy();
    });
    this.vectorSource.clear();
    this.markers = {};
  }

  private createOverlay(
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

  private addToVectorSource(vehicleId: number, position: number[]): Feature<Point> {
    const feature = new Feature({ geometry: new Point(position), vehicleId });
    this.vectorSource.addFeature(feature);
    return feature;
  }
}
