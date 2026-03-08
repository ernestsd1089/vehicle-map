import { Component, computed, input } from '@angular/core';
import { contrastColor } from '../../utils/color.utils';
import { AZURE_BLUE } from '../../tokens/design-tokens';

@Component({
  selector: 'app-marker',
  template: `
    @if (icon()) {
      <span
        [class]="iconClass()"
        [style.mask]="iconMask()"
        [style.webkitMask]="iconMask()"
        [style.background-color]="iconColor()"
      ></span>
    } @else if (label() !== null) {
      <span class="text-base font-bold" [style.color]="iconColor()">{{ label() }}</span>
    }
  `,
  styleUrl: './marker.component.scss',
  host: {
    class:
      'relative flex items-center justify-center rounded-full cursor-pointer transition-[transform,box-shadow] duration-150 ease-in-out',
    '[class.selected]': 'selected()',
    '[class.sm]': 'size() === "sm"',
    '[class.disabled]': 'disabled()',
    '[style.background-color]': 'color()',
    '[style.box-shadow]': 'hostShadow()',
  },
})
export class MarkerComponent {
  color = input<string>(AZURE_BLUE);
  icon = input<string>('');
  label = input<number | null>(null);
  selected = input<boolean>(false);
  disabled = input<boolean>(false);
  size = input<'sm' | 'md'>('md');

  iconColor = computed(() => contrastColor(this.color()));
  iconMask = computed(() => `url('/icons/${this.icon()}.svg') center / contain no-repeat`);
  iconClass = computed(() => `block ${this.size() === 'sm' ? 'w-4 h-4' : 'w-[1.4rem] h-[1.4rem]'}`);
  hostShadow = computed(() => {
    const border = `inset 0 0 0 2px ${this.iconColor()}`;
    if (this.selected()) {
      return `${border}, 0 0 0 2px white, 0 0 0 4px #1a73e8, 0 4px 12px rgba(0,0,0,0.3)`;
    }
    return `${border}, 0 2px 6px rgba(0,0,0,0.3)`;
  });
}
