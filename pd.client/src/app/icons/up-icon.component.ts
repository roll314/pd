import {Component, Input, HostBinding, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'ico-up-icon',
  template: `
    <svg [attr.width]="size + 'px'" [attr.height]="size + 'px'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 16L9 16C11.2091 16 13 14.2091 13 12L13 7" stroke="#200E32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 10L13 7L10 10" stroke="#200E32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
export class UpIconComponent {
  @HostBinding('style.width.px')
  @HostBinding('style.height.px')
  @Input({required:true})
  size?: number;
}
