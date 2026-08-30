import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {ImageLoadSchedulerService, ImageLoadTaskHandle} from './image-load-scheduler.service';

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
  readonly activeSrc = signal<string | null>(null);

  private loadTask: ImageLoadTaskHandle | null = null;

  constructor(
    private imageLoadScheduler: ImageLoadSchedulerService,
  ) {
    effect(onCleanup => {
      const src = this.src();

      this.cancelLoad();
      this.isLoaded.set(false);
      this.loadTask = this.imageLoadScheduler.schedule(() => this.activeSrc.set(src));

      onCleanup(() => this.cancelLoad());
    });
  }

  onLoad() {
    this.completeLoad();
    this.isLoaded.set(true);
    setTimeout(() => this.loaded.emit());
  }

  onError() {
    this.completeLoad();
    this.error.emit();
  }

  private completeLoad() {
    this.loadTask?.complete();
    this.loadTask = null;
  }

  private cancelLoad() {
    this.loadTask?.cancel();
    this.loadTask = null;
    this.activeSrc.set(null);
  }
}
