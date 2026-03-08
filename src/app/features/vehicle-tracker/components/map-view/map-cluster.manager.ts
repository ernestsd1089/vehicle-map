import { ComponentRef, ViewContainerRef } from '@angular/core';
import Map from 'ol/Map';
import Cluster from 'ol/source/Cluster';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { boundingExtent } from 'ol/extent';

import { MarkerComponent } from '../../../../shared/components/marker/marker.component';
import { MarkerEntry } from './map-marker.manager';
import { VEHICLE_SELECT_ZOOM } from './map-view.component';

export class MapClusterManager {
  private clusterOverlays: { overlay: Overlay; ref: ComponentRef<MarkerComponent> }[] = [];

  constructor(
    private readonly map: Map,
    private readonly clusterSource: Cluster,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  update(markers: Record<number, MarkerEntry>): void {
    this.clear();
    Object.values(markers).forEach(({ overlay }) => {
      overlay.getElement()!.style.display = '';
    });

    for (const clusterFeature of this.clusterSource.getFeatures()) {
      const features = clusterFeature.get('features') as Feature<Point>[];
      if (features.length <= 1) continue;

      features.forEach((f) => {
        const el = markers[f.get('vehicleId') as number]?.overlay.getElement();
        if (el) el.style.display = 'none';
      });

      this.createOverlay(features, (clusterFeature.getGeometry() as Point).getCoordinates());
    }
  }

  clear(): void {
    this.clusterOverlays.forEach(({ ref, overlay }) => {
      this.map.removeOverlay(overlay);
      ref.destroy();
    });
    this.clusterOverlays = [];
  }

  private createOverlay(features: Feature<Point>[], position: number[]): void {
    const ref = this.viewContainerRef.createComponent(MarkerComponent);
    ref.setInput('label', features.length);

    const el = ref.location.nativeElement as HTMLElement;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      const coords = features.map((f) => (f.getGeometry() as Point).getCoordinates());
      this.map
        .getView()
        .fit(boundingExtent(coords), { padding: [100, 100, 100, 100], maxZoom: VEHICLE_SELECT_ZOOM, duration: 300 });
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
}
