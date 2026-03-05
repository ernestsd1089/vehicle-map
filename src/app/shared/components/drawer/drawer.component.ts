import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { TailwindWidth } from "../../types/tailwind.types";

@Component({
    selector: 'app-drawer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [class]="currentWidth()"
            class="transition-all duration-300 h-full bg-white shadow-lg overflow-hidden">
            <ng-content />
        </div>
    `,
})
export class DrawerComponent {
    isExpanded = input<boolean>(false);

    expandedWidth = input<TailwindWidth>('w-full');
    collapsedWidth = input<TailwindWidth>('w-1/4');

    currentWidth() {
        return this.isExpanded() ? this.expandedWidth() : this.collapsedWidth();
    }
}