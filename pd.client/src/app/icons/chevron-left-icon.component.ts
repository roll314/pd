import {Component, Input, HostBinding, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'ico-chevron-left-icon',
  template: `
    <svg fill="none" [attr.width]="size + 'px'" [attr.height]="size + 'px'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 6L9 12L15 18" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
export class ChevronLeftIconComponent {
  @HostBinding('style.width.px')
  @HostBinding('style.height.px')
  @Input({required:true})
  size?: number;

  @Input()
  color = '#000000';
}
