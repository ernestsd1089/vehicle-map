import { ComponentRef, ViewContainerRef } from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { MarkerComponent } from '../../../../shared/components/marker/marker.component';
import { VehicleLocation } from '../../models/location.model';
import { MapMarkerManager } from './map-marker.manager';

jest.mock('ol/Overlay', () => {
  return jest.fn().mockImplementation((options) => ({
    getElement: jest.fn().mockReturnValue(options.element),
  }));
});

describe('MapMarkerManager', () => {
  let manager: MapMarkerManager;
  let mockMap: { addOverlay: jest.Mock; removeOverlay: jest.Mock; getView: jest.Mock };
  let mockVectorSource: { addFeature: jest.Mock; clear: jest.Mock };
  let mockViewContainerRef: { createComponent: jest.Mock };
  let mockStore: { dispatch: jest.Mock };

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

    mockVectorSource = {
      addFeature: jest.fn(),
      clear: jest.fn(),
    };

    mockViewContainerRef = {
      createComponent: jest.fn(),
    };

    mockStore = {
      dispatch: jest.fn(),
    };

    manager = new MapMarkerManager(
      mockMap as any,
      mockVectorSource as any,
      mockViewContainerRef as any,
      mockStore as any,
    );
  });

  describe('getMarkers', () => {
    it('returns empty object initially', () => {
      expect(manager.getMarkers()).toEqual({});
    });

    it('returns all added markers', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const location: VehicleLocation = { vehicleid: 1, lat: 56.946285, lon: 24.105186 };
      manager.add(1, '#ff0000', location);

      const markers = manager.getMarkers();
      expect(Object.keys(markers)).toHaveLength(1);
      expect(markers[1]).toBeDefined();
      expect(markers[1].ref).toBe(mockRef);
    });
  });

  describe('add', () => {
    it('calls createComponent with MarkerComponent', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const location: VehicleLocation = { vehicleid: 42, lat: 56.946285, lon: 24.105186 };
      manager.add(42, '#ff0000', location);

      expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(MarkerComponent);
    });

    it('sets color and icon inputs on the component ref', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const location: VehicleLocation = { vehicleid: 1, lat: 56.946285, lon: 24.105186 };
      manager.add(1, '#aabbcc', location);

      expect(mockRef.setInput).toHaveBeenCalledWith('color', '#aabbcc');
      expect(mockRef.setInput).toHaveBeenCalledWith('icon', 'car');
    });

    it('calls map.addOverlay after creating the overlay', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const location: VehicleLocation = { vehicleid: 1, lat: 56.946285, lon: 24.105186 };
      manager.add(1, '#ff0000', location);

      expect(mockMap.addOverlay).toHaveBeenCalledTimes(1);
    });

    it('calls vectorSource.addFeature with a Feature', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const location: VehicleLocation = { vehicleid: 1, lat: 56.946285, lon: 24.105186 };
      manager.add(1, '#ff0000', location);

      expect(mockVectorSource.addFeature).toHaveBeenCalledTimes(1);
      const addedFeature = mockVectorSource.addFeature.mock.calls[0][0];
      expect(addedFeature).toBeInstanceOf(Feature);
    });

    it('stores the marker accessible via getMarkers', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const location: VehicleLocation = { vehicleid: 7, lat: 56.946285, lon: 24.105186 };
      manager.add(7, '#ff0000', location);

      const markers = manager.getMarkers();
      expect(markers[7]).toBeDefined();
      expect(markers[7].ref).toBe(mockRef);
      expect(markers[7].feature).toBeInstanceOf(Feature);
    });

    it('dispatches selectVehicle action when the marker element is clicked', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      const vehicleId = 99;
      const location: VehicleLocation = { vehicleid: vehicleId, lat: 56.946285, lon: 24.105186 };
      manager.add(vehicleId, '#ff0000', location);

      const el = mockRef.location.nativeElement as HTMLElement;
      el.click();

      expect(mockStore.dispatch).toHaveBeenCalledWith(
        VehicleDataActions.selectVehicle({ vehicleId }),
      );
    });
  });

  describe('updateSelection', () => {
    it('sets selected=true only for the given vehicleId and false for others', () => {
      const mockRef1 = createMockRef();
      const mockRef2 = createMockRef();
      mockViewContainerRef.createComponent
        .mockReturnValueOnce(mockRef1)
        .mockReturnValueOnce(mockRef2);

      manager.add(1, '#ff0000', { vehicleid: 1, lat: 56.0, lon: 24.0 });
      manager.add(2, '#00ff00', { vehicleid: 2, lat: 57.0, lon: 25.0 });

      jest.clearAllMocks();
      manager.updateSelection(1);

      expect(mockRef1.setInput).toHaveBeenCalledWith('selected', false);
      expect(mockRef1.setInput).toHaveBeenCalledWith('selected', true);
      expect(mockRef2.setInput).toHaveBeenCalledWith('selected', false);
      expect(mockRef2.setInput).not.toHaveBeenCalledWith('selected', true);
    });

    it('sets all markers to selected=false when called with null', () => {
      const mockRef1 = createMockRef();
      const mockRef2 = createMockRef();
      mockViewContainerRef.createComponent
        .mockReturnValueOnce(mockRef1)
        .mockReturnValueOnce(mockRef2);

      manager.add(1, '#ff0000', { vehicleid: 1, lat: 56.0, lon: 24.0 });
      manager.add(2, '#00ff00', { vehicleid: 2, lat: 57.0, lon: 25.0 });

      jest.clearAllMocks();
      manager.updateSelection(null);

      expect(mockRef1.setInput).toHaveBeenCalledWith('selected', false);
      expect(mockRef2.setInput).toHaveBeenCalledWith('selected', false);
      expect(mockRef1.setInput).not.toHaveBeenCalledWith('selected', true);
      expect(mockRef2.setInput).not.toHaveBeenCalledWith('selected', true);
    });
  });

  describe('clear', () => {
    it('calls map.removeOverlay for each marker overlay', () => {
      const mockRef1 = createMockRef();
      const mockRef2 = createMockRef();
      mockViewContainerRef.createComponent
        .mockReturnValueOnce(mockRef1)
        .mockReturnValueOnce(mockRef2);

      manager.add(1, '#ff0000', { vehicleid: 1, lat: 56.0, lon: 24.0 });
      manager.add(2, '#00ff00', { vehicleid: 2, lat: 57.0, lon: 25.0 });

      manager.clear();

      expect(mockMap.removeOverlay).toHaveBeenCalledTimes(2);
    });

    it('destroys each component ref', () => {
      const mockRef1 = createMockRef();
      const mockRef2 = createMockRef();
      mockViewContainerRef.createComponent
        .mockReturnValueOnce(mockRef1)
        .mockReturnValueOnce(mockRef2);

      manager.add(1, '#ff0000', { vehicleid: 1, lat: 56.0, lon: 24.0 });
      manager.add(2, '#00ff00', { vehicleid: 2, lat: 57.0, lon: 25.0 });

      manager.clear();

      expect(mockRef1.destroy).toHaveBeenCalledTimes(1);
      expect(mockRef2.destroy).toHaveBeenCalledTimes(1);
    });

    it('calls vectorSource.clear', () => {
      manager.clear();

      expect(mockVectorSource.clear).toHaveBeenCalledTimes(1);
    });

    it('getMarkers returns empty object after clear', () => {
      const mockRef = createMockRef();
      mockViewContainerRef.createComponent.mockReturnValue(mockRef);

      manager.add(1, '#ff0000', { vehicleid: 1, lat: 56.0, lon: 24.0 });
      manager.clear();

      expect(manager.getMarkers()).toEqual({});
    });
  });
});
