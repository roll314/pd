import {
  ChangeDetectionStrategy,
  Component, computed,
  effect,
  ElementRef, HostListener,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { PauseIconComponent } from '../../../icons/pause-icon.component';
import { PlayIconComponent } from '../../../icons/play-icon.component';
import { UrlService } from '../../../services/url.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { throttle } from 'lodash-es';
import { SpeakerIconComponent } from '../../../icons/speaker-icon.component';
import { ThumbSize } from '../../../../../../shared/thumbSize';

export interface SemiProgress {
  start: number;
  end: number;
}

const VIDEO_PLAYER_FETCH_PROGRESS_UPDATE_INTERVAL_MS = 500;

@Component({
  selector: 'app-video-player',
  templateUrl: 'video-player.component.html',
  styleUrls: ['video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PauseIconComponent,
    PlayIconComponent,
    MatProgressSpinnerModule,
    MatSliderModule,
    FormsModule,
    SpeakerIconComponent,
  ]
})
export class VideoPlayerComponent {
  readonly videoElRef =  viewChild<ElementRef<HTMLVideoElement>>('video');

  readonly name = input.required<string>();

  readonly subPath = this.storageService.subPath;
  readonly rootDir = this.storageService.rootDir;

  readonly isPaused = signal(true);

  readonly videoUrl = computed(() => this.urlService.getVideoPreviewUrl(this.name(), ThumbSize.PREVIEW));

  readonly isMetaDataFetched = signal(false);
  readonly duration = signal(0);
  readonly currentTime = signal(0);
  readonly canPlay = signal(false);
  readonly canplaythrough = signal(false);
  readonly isInSeek = signal(false);
  readonly fetchProgress = signal<SemiProgress[]>([]);
  readonly isEnded = signal(false);
  readonly isWaiting = signal(false);
  readonly videoError = signal<MediaError | null | undefined>(undefined);

  readonly isVideoBusy = computed(() => !this.canPlay() || this.isWaiting() || this.isInSeek());
  readonly isPreviewShown = signal(true);
  readonly isVideoShown = computed(() => !this.isPreviewShown() && !this.isVideoBusy());

  readonly volume = signal(1);

  private get videoEl(): HTMLVideoElement | undefined {
    return this.videoElRef()?.nativeElement;
  }

  constructor(
    private storageService: StorageService,
    private urlService: UrlService,
  ) {
    effect(() => {
      // to keep effect active;
      this.name();

      this.isMetaDataFetched.set(false);
      this.duration.set(0);
      this.currentTime.set(0);
      this.canPlay.set(false);
      this.canplaythrough.set(false);
      this.isInSeek.set(false);
      this.fetchProgress.set([]);
      this.isEnded.set(false);
      this.isWaiting.set(false);
      this.videoError.set(undefined);

      this.isPreviewShown.set(true);
      this.isPaused.set(true);

      const videoEl = this.videoEl;
      if (videoEl) {
        videoEl.pause();

        const onLoadedmetadata = () => {
          this.isMetaDataFetched.set(true);
          this.duration.set(videoEl.duration);
        };
        videoEl.addEventListener('loadedmetadata', onLoadedmetadata);

        const onTimeupdate = () => this.currentTime.set(videoEl.currentTime!);
        videoEl.addEventListener('timeupdate', onTimeupdate);

        const onCanplay = () => this.canPlay.set(true);
        videoEl.addEventListener('canplay', onCanplay);

        const onCanplaythrough = () => this.canplaythrough.set(true);
        videoEl.addEventListener('canplaythrough', onCanplaythrough);

        const onSeeking = () => this.isInSeek.set(true);
        videoEl.addEventListener('seeking', onSeeking);

        const onSeeked = () => this.isInSeek.set(false);
        videoEl.addEventListener('seeked', onSeeked);

        const onDurationchange = () => this.currentTime.set(videoEl.currentTime!);
        videoEl.addEventListener('durationchange', onDurationchange);

        const onProgress = () => this.updateBuffered();
        videoEl.addEventListener('progress', onProgress);

        const onEnded = () => this.isEnded.set(true);
        videoEl.addEventListener('ended', onEnded);

        const onWaiting = () => this.isWaiting.set(true);
        videoEl.addEventListener('waiting', onWaiting);

        const onPlaying = () => this.isWaiting.set(false);
        videoEl.addEventListener('playing', onPlaying);

        const onError = () => this.videoError.set(this.videoEl?.error);
        videoEl.addEventListener('playing', onError);

        const onPause = () => this.isPaused.set(true);
        videoEl.addEventListener('pause', onPause);

        const onPlay = () => this.isPaused.set(false);
        videoEl.addEventListener('play', onPlay);

        const bufferedUpdateTimerId = window.setInterval(
          () => this.updateBuffered(),
          VIDEO_PLAYER_FETCH_PROGRESS_UPDATE_INTERVAL_MS,
        );

        return () => {
          videoEl.removeEventListener('seeking', onSeeking);
          videoEl.removeEventListener('seeked', onSeeked);
          videoEl.removeEventListener('durationchange', onDurationchange);
          videoEl.removeEventListener('progress', onProgress);
          videoEl.removeEventListener('ended', onEnded);
          videoEl.removeEventListener('waiting', onWaiting);
          videoEl.removeEventListener('playing', onPlaying);
          videoEl.removeEventListener('playing', onError);

          clearInterval(bufferedUpdateTimerId);
        }
      }

      return () => {};
    })
  }

  private updateBuffered() {
    const buffered = this.videoEl?.buffered;

    if (!buffered) {
      return;
    }

    const duration = this.duration();

    const res: SemiProgress[] = [];

    for (let i = 0; i < buffered.length; i++) {
      res.push({
        start: buffered.start(i) / duration,
        end: buffered.end(i) / duration,
      });
    }

    this.fetchProgress.set(res);
  }

  play() {
    this.videoElRef()?.nativeElement.play();
    this.isPreviewShown.set(false);
  }

  pause() {
    this.videoElRef()?.nativeElement.pause();
  }

  @HostListener('click')
  onClick() {
    if (this.isPaused()) {
      this.play();
    } else {
      this.pause();
    }
  }

  setCurrentTime(value: number) {
    if (!this.videoEl) {
      return;
    }
    this.videoEl.currentTime = value;
  }

  setCurrentTimeThrottled = throttle(
    this.setCurrentTime.bind(this),
    100,
  );
}
