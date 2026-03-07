import { Component, computed, input } from '@angular/core';
import { contrastColor } from '../../utils/color.utils';
import { AZURE_BLUE } from '../../tokens/design-tokens';

@Component({
  selector: 'app-marker',
  template: `
    @if (icon()) {
      <span
        class="icon"
        [style.mask]="iconMask()"
        [style.webkitMask]="iconMask()"
        [style.background-color]="iconColor()"
      ></span>
    }
  `,
  styleUrl: './marker.component.scss',
  host: {
    class: 'marker',
    '[class.selected]': 'selected()',
    '[class.sm]': 'size() === "sm"',
    '[style.background-color]': 'color()',
  },
})
export class MarkerComponent {
  color = input<string>(AZURE_BLUE);
  icon = input<string>('');
  selected = input<boolean>(false);
  size = input<'sm' | 'md'>('md');

  iconColor = computed(() => contrastColor(this.color()));
  iconMask = computed(() => `url('/icons/${this.icon()}.svg') center / contain no-repeat`);
}
