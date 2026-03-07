import { Component } from '@angular/core';

@Component({
  selector: 'app-panel',
  host: { class: 'block bg-white rounded-4xl shadow-lg overflow-hidden' },
  template: `<ng-content />`,
})
export class PanelComponent {}
