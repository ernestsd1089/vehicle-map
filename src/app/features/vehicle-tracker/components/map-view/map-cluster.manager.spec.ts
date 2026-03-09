import { ComponentRef } from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

import { MarkerComponent } from '../../../../shared/components/marker/marker.component';
import { MarkerEntry } from './map-marker.manager';
import { MAP_VEHICLE_SELECT_ZOOM } from './map-view.constants';
import { MapClusterManager } from './map-cluster.manager';

jest.mock('ol/Overlay', () => {
  return jest.fn().mockImplementation((options) => ({
    getElement: jest.fn().mockReturnValue(options.element),
  }));
});

function createMarker(vehicleId: number): { el: HTMLElement; overlay: any; marker: MarkerEntry } {
  const el = document.createElement('div');
  const overlay = {
    getElement: jest.fn().mockReturnValue(el),
  };
  const ref = {
    setInput: jest.fn(),
    location: { nativeElement: document.createElement('div') },
    destroy: jest.fn(),
  };
  const feature = new Feature<Point>({ vehicleId });
  feature.setGeometry(new Point([0, 0]));
  return { el, overlay, marker: { ref, overlay, feature } as any };
}

function createClusterFeature(features: Feature<Point>[]): Feature {
  const clusterFeature = new Feature({});
  clusterFeature.set('features', features);
  clusterFeature.setGeometry(new Point([0, 0]));
  return clusterFeature;
}

describe('MapClusterManager', () => {
  let manager: MapClusterManager;
  let mockMap: { addOverlay: jest.Mock; removeOverlay: jest.Mock; getView: jest.Mock };
  let mockClusterSource: { getFeatures: jest.Mock };
  let mockViewContainerRef: { createComponent: jest.Mock };

  function createMockRef(): ComponentRef<MarkerComponent> {
    return {
      setInput: jest.fn(),
      destroy: jest.fn(),
      location: { nativeElement: document.createElement('div') },
    } as any;
  }

  beforeEach(() => {
    jest.clearAllMocks();

    mockMap = {
      addOverlay: jest.fn(),
      removeOverlay: jest.fn(),
      getView: jest.fn().mockReturnValue({ animate: jest.fn(), fit: jest.fn() }),
    };

    mockClusterSource = {
      getFeatures: jest.fn().mockReturnValue([]),
    };

    mockViewContainerRef = {
      createComponent: jest.fn(),
    };

    manager = new MapClusterManager(
      mockMap as any,
      mockClusterSource as any,
      mockViewContainerRef as any,
    );
  });

  describe('clear', () => {
    it('calls map.removeOverlay for each cluster overlay and destroys each ref', () => {
      const mockRef1 = createMockRef();
      const mockRef2 = createMockRef();
      mockViewContainerRef.createComponent
        .mockReturnValueOnce(mockRef1)
        .mockReturnValueOnce(mockRef2);

      const { marker: marker1 } = createMarker(1);
      const { marker: marker2 } = createMarker(2);

      const feature1 = new Feature<Point>({ vehicleId: 1 });
      feature1.setGeometry(new Point([0, 0]));
      const feature2 = new Feature<Point>({ vehicleId: 2 });
      feature2.setGeometry(new Point([1, 1]));

      const clusterFeature = createClusterFeature([feature1, feature2]);
      mockClusterSource.getFeatures.mockReturnValue([clusterFeature]);

      const markers: Record<number, MarkerEntry> = { 1: marker1, 2: marker2 };
      manager.update(markers);

      jest.clearAllMocks();
      manager.clear();

      expect(mockMap.removeOverlay).toHaveBeenCalledTimes(1);
      expect(mockRef1.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('shows all marker elements (sets style.display to empty string) when there are no cluster features', () => {
      mockClusterSource.getFeatures.mockReturnValue([]);

      const { el: el1, marker: marker1 } = createMarker(1);
      const { el: el2, marker: marker2 } = createMarker(2);

      el1.style.display = 'none';
      el2.style.display = 'none';

      const markers: Record<number, MarkerEntry> = { 1: marker1, 2: marker2 };
      manager.update(markers);

      expect(el1.style.display).toBe('');
      expect(el2.style.display).toBe('');
    });

    it('does not call createComponent when there are no cluster features', () => {
      mockClusterSource.getFeatures.mockReturnValue([]);

      const { marker } = createMarker(1);
      manager.update({ 1: marker });

      expect(mockViewContainerRef.createComponent).not.toHaveBeenCalled();
    });

    it('does not create a cluster overlay for a cluster feature with only one feature', () => {
      const { marker: marker1 } = createMarker(1);

      const singleFeature = new Feature<Point>({ vehicleId: 1 });
      singleFeature.setGeometry(new Point([0, 0]));
      const clusterFeature = createClusterFeature([singleFeature]);
      mockClusterSource.getFeatures.mockReturnValue([clusterFeature]);

      const markers: Record<number, MarkerEntry> = { 1: marker1 };
      manager.update(markers);

      expect(mockViewContainerRef.createComponent).not.toHaveBeenCalled();
      expect(mockMap.addOverlay).not.toHaveBeenCalled();
    });

    it('shows the individual marker element for a single-feature cluster (not hidden)', () => {
      const { el, marker } = createMarker(1);
      el.style.display = 'none';

      const singleFeature = new Feature<Point>({ vehicleId: 1 });
      singleFeature.setGeometry(new Point([0, 0]));
      const clusterFeature = createClusterFeature([singleFeature]);
      mockClusterSource.getFeatures.mockReturnValue([clusterFeature]);

      manager.update({ 1: marker });

      expect(el.style.display).toBe('');
    });

    it('hides individual marker elements for features inside a multi-feature cluster', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const { el: el1, marker: marker1 } = createMarker(1);
      const { el: el2, marker: marker2 } = createMarker(2);

      const feature1 = new Feature<Point>({ vehicleId: 1 });
      feature1.setGeometry(new Point([0, 0]));
      const feature2 = new Feature<Point>({ vehicleId: 2 });
      feature2.setGeometry(new Point([1, 1]));

      const clusterFeature = createClusterFeature([feature1, feature2]);
      mockClusterSource.getFeatures.mockReturnValue([clusterFeature]);

      const markers: Record<number, MarkerEntry> = { 1: marker1, 2: marker2 };
      manager.update(markers);

      expect(el1.style.display).toBe('none');
      expect(el2.style.display).toBe('none');
    });

    it('calls createComponent and addOverlay for a multi-feature cluster', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const { marker: marker1 } = createMarker(1);
      const { marker: marker2 } = createMarker(2);

      const feature1 = new Feature<Point>({ vehicleId: 1 });
      feature1.setGeometry(new Point([0, 0]));
      const feature2 = new Feature<Point>({ vehicleId: 2 });
      feature2.setGeometry(new Point([1, 1]));

      const clusterFeature = createClusterFeature([feature1, feature2]);
      mockClusterSource.getFeatures.mockReturnValue([clusterFeature]);

      const markers: Record<number, MarkerEntry> = { 1: marker1, 2: marker2 };
      manager.update(markers);

      expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(MarkerComponent);
      expect(mockMap.addOverlay).toHaveBeenCalledTimes(1);
    });

    it('sets the label input to the number of features in the cluster', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const { marker: marker1 } = createMarker(1);
      const { marker: marker2 } = createMarker(2);
      const { marker: marker3 } = createMarker(3);

      const feature1 = new Feature<Point>({ vehicleId: 1 });
      feature1.setGeometry(new Point([0, 0]));
      const feature2 = new Feature<Point>({ vehicleId: 2 });
      feature2.setGeometry(new Point([1, 1]));
      const feature3 = new Feature<Point>({ vehicleId: 3 });
      feature3.setGeometry(new Point([2, 2]));

      const clusterFeature = createClusterFeature([feature1, feature2, feature3]);
      mockClusterSource.getFeatures.mockReturnValue([clusterFeature]);

      const markers: Record<number, MarkerEntry> = { 1: marker1, 2: marker2, 3: marker3 };
      manager.update(markers);

      expect(mockRef.setInput).toHaveBeenCalledWith('label', 3);
    });

    it('calls map.getView().fit with boundingExtent and correct options when cluster overlay is clicked', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const { marker: marker1 } = createMarker(1);
      const { marker: marker2 } = createMarker(2);

      const feature1 = new Feature<Point>({ vehicleId: 1 });
      feature1.setGeometry(new Point([10, 20]));
      const feature2 = new Feature<Point>({ vehicleId: 2 });
      feature2.setGeometry(new Point([30, 40]));

      const clusterFeature = createClusterFeature([feature1, feature2]);
      mockClusterSource.getFeatures.mockReturnValue([clusterFeature]);

      const markers: Record<number, MarkerEntry> = { 1: marker1, 2: marker2 };
      manager.update(markers);

      const clusterEl = mockRef.location.nativeElement as HTMLElement;
      clusterEl.click();

      const mockView = mockMap.getView();
      expect(mockView.fit).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          padding: [100, 100, 100, 100],
          maxZoom: MAP_VEHICLE_SELECT_ZOOM,
          duration: 300,
        }),
      );
    });

    it('clears existing cluster overlays before creating new ones when update is called twice', () => {
      const mockRef1 = createMockRef();
      const mockRef2 = createMockRef();
      mockViewContainerRef.createComponent
        .mockReturnValueOnce(mockRef1)
        .mockReturnValueOnce(mockRef2);

      const { marker: marker1 } = createMarker(1);
      const { marker: marker2 } = createMarker(2);

      const feature1 = new Feature<Point>({ vehicleId: 1 });
      feature1.setGeometry(new Point([0, 0]));
      const feature2 = new Feature<Point>({ vehicleId: 2 });
      feature2.setGeometry(new Point([1, 1]));

      const clusterFeature = createClusterFeature([feature1, feature2]);
      mockClusterSource.getFeatures.mockReturnValue([clusterFeature]);

      const markers: Record<number, MarkerEntry> = { 1: marker1, 2: marker2 };

      manager.update(markers);
      expect(mockRef1.destroy).not.toHaveBeenCalled();

      manager.update(markers);

      expect(mockRef1.destroy).toHaveBeenCalledTimes(1);
      expect(mockMap.removeOverlay).toHaveBeenCalledTimes(1);
      expect(mockRef2.destroy).not.toHaveBeenCalled();
    });
  });
});
