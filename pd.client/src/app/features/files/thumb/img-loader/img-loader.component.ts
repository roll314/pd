import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-img-loader',
  imports: [
    MatProgressSpinnerModule
  ],
  templateUrl: 'img-loader.component.html',
  styleUrl: 'img-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImgLoaderComponent {
  readonly src = input.required<string>();
  readonly alt = input<string>('');
  readonly error = output();
  readonly loaded = output();

  readonly isLoaded = signal(false);

  constructor() {
    effect(() => {
      // to run effect
      this.src();

      this.isLoaded.set(false);
    });
  }

  onLoad() {
    this.isLoaded.set(true);
    setTimeout(() => this.loaded.emit());
  }
}
