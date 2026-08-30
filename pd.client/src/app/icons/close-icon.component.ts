import {Component, Input, HostBinding, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'ico-close-icon',
  template: `
    <svg [attr.fill]="color" [attr.width]="size + 'px'" [attr.height]="size + 'px'" xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         viewBox="0 0 512 512" xml:space="preserve">
      <g>
        <g>
         <polygon points="512,59.076 452.922,0 256,196.922 59.076,0 0,59.076 196.922,256 0,452.922 59.076,512 256,315.076 452.922,512
           512,452.922 315.076,256"/>
        </g>
      </g>
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
export class CloseIconComponent {
  @HostBinding('style.width.px')
  @HostBinding('style.height.px')
  @Input({required:true})
  size?: number;

  @Input()
  color = '#000000';
}
