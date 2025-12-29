import {Component, Input, HostBinding, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'ico-chevron-right-icon',
  template: `
    <svg fill="none" [attr.width]="size + 'px'" [attr.height]="size + 'px'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6L15 12L9 18" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  styles: [
    `
      :host {
        display: block
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChevronRightIconComponent {
  @HostBinding('style.width.px')
  @HostBinding('style.height.px')
  @Input({required:true})
  size?: number;

  @Input()
  color = '#000000';
}
