import {Component, Input, HostBinding, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'ico-pause-icon',
  template: `
    <svg [attr.width]="size + 'px'" [attr.height]="size + 'px'" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path [attr.fill]="color" d="M120.16 45A20.162 20.162 0 0 0 100 65.16v381.68A20.162 20.162 0 0 0 120.16 467h65.68A20.162 20.162 0 0 0 206 446.84V65.16A20.162 20.162 0 0 0 185.84 45h-65.68zm206 0A20.162 20.162 0 0 0 306 65.16v381.68A20.162 20.162 0 0 0 326.16 467h65.68A20.162 20.162 0 0 0 412 446.84V65.16A20.162 20.162 0 0 0 391.84 45h-65.68z"/>
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
export class PauseIconComponent {
  @HostBinding('style.width')
  @HostBinding('style.height')
  get appliedSize(): string {
    return this.applySizeToHost ? `${this.size}px` : '';
  }

  @Input()
  applySizeToHost = true;

  @Input({required:true})
  size?: number;

  @Input()
  color = '#000000';
}
