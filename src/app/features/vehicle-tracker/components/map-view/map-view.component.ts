import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';

import { selectVehiclesWithLocations } from '../../store/vehicle-locations/vehicle-locations.reducer';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  host: { class: 'block w-full h-full' },
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private mapContainer!: ElementRef<HTMLDivElement>;

  private readonly store = inject(Store);
  private map!: Map;
  private readonly vectorSource = new VectorSource();
  private subscription!: Subscription;

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: this.vectorSource }),
      ],
      view: new View({
        center: fromLonLat([24.105186, 56.946285]),
        zoom: 12,
      }),
    });

    this.subscription = this.store.select(selectVehiclesWithLocations).subscribe((vehicles) => {
      this.vectorSource.clear();

      const features = vehicles
        .filter((v) => v.location !== null)
        .map((v) => {
          const feature = new Feature({
            geometry: new Point(fromLonLat([v.location!.lon, v.location!.lat])),
          });
          feature.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 8,
                fill: new Fill({ color: v.color }),
                stroke: new Stroke({ color: '#ffffff', width: 2 }),
              }),
            }),
          );
          return feature;
        });

      this.vectorSource.addFeatures(features);

      const vectorExtent = this.vectorSource.getExtent();
      if (features.length > 0 && vectorExtent) {
        this.map.getView().fit(vectorExtent, {
          padding: [50, 50, 50, 50],
          maxZoom: 15,
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.map?.setTarget(undefined);
  }
}
