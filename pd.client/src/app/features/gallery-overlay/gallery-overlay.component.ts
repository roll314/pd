import {
  ChangeDetectionStrategy,
  Component, computed, ElementRef,
  HostListener,
  input,
  OnInit,
  output, Renderer2, signal, WritableSignal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ThumbComponent } from '../files/thumb/thumb.component';
import { StorageService } from '../../services/storage.service';
import { ThumbSize } from '../../../../../shared/thumbSize';
import { DownloadIconComponent } from '../../icons/download-icon.component';
import { CloseIconComponent } from '../../icons/close-icon.component';
import { ChevronLeftIconComponent } from '../../icons/chevron-left-icon.component';
import { ChevronRightIconComponent } from '../../icons/chevron-right-icon.component';
import { UrlService } from '../../services/url.service';
import { VideoPlayerComponent } from './video-player/video-player.component';

const SWIPE_THRESHOLD_PX = 50;
const MAX_ZOOM = 4;
const MIN_ZOOM = 0.5;

const ZOOMABLE_CONTENT_CLASS= 'zoomable-content';
const ZOOMABLE_CONTAINER_CLASS = 'zoomable-container';
const NO_TRANSITION_CLASS = 'no-transition';

export enum GalleryItemType {
  VIDEO,
  IMAGE,
}

export interface GalleryItem {
  uid: string;
  name: string;
  type: GalleryItemType;
  changedAt: number;
}

@Component({
  imports: [
    CommonModule,
    ThumbComponent,
    DownloadIconComponent,
    CloseIconComponent,
    ChevronRightIconComponent,
    ChevronLeftIconComponent,
    VideoPlayerComponent,
  ],
  selector: 'app-gallery-overlay',
  standalone: true,
  templateUrl: './gallery-overlay.component.html',
  styleUrl: './gallery-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryOverlayComponent implements OnInit {
  readonly items = input.required<GalleryItem[]>();
  readonly selectedId = input.required<string>();
  readonly closed = output();

  readonly currentIndex = signal(0);

  readonly currentItem = computed(() => this.items()[this.currentIndex()]);

  readonly GalleryItemType = GalleryItemType;

  private startX = 0;
  private startY = 0;
  private endX = 0;

  readonly subPath = this.storageService.subPath;
  readonly rootDir = this.storageService.rootDir;

  readonly ThumbSize = ThumbSize;

  private isPinching = false;
  currentScale = signal(1);
  private initialDistance = 0;

  readonly translateX = signal(0);
  readonly translateY = signal(0);

  private lastTouchX = 0;
  private lastTouchY = 0;
  private isDragging = false;

  private isMouseDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  constructor(
    private storageService: StorageService,
    private urlService: UrlService,
    private renderer: Renderer2,
    private elRef: ElementRef,
  ) {
  }

  ngOnInit() {
    const index = this.items().findIndex(img => img.uid === this.selectedId());
    this.currentIndex.set(index);
  }

  next() {
    if (this.currentIndex() < this.items().length - 1) {
      this.currentScale.set(1); // Сброс зума
      this.currentIndex.update(currentIndex => currentIndex + 1);
    }
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(currentIndex => currentIndex - 1);
    }
  }

  close() {
    this.closed.emit();
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 2) {
      this.isPinching = true;
      this.initialDistance = this.getDistance(event.touches[0], event.touches[1]);
      return;
    }

    if (this.currentScale() > 1 && event.touches.length === 1) {
      this.isDragging = true;
      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    }

    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;

    const contentEl = this.elRef.nativeElement.querySelector(`.${ZOOMABLE_CONTENT_CLASS}`);
    this.renderer.addClass(contentEl, NO_TRANSITION_CLASS);
  }

  onTouchMove(event: TouchEvent) {
    if (this.isPinching && event.touches.length === 2) {
      event.preventDefault();

      const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
      const scale = currentDistance / this.initialDistance;
      const newScale = this.currentScale() * scale;

      const clampedScale = Math.max(MIN_ZOOM, Math.min(newScale, MAX_ZOOM));
      this.currentScale.set(clampedScale);
      this.initialDistance = currentDistance;

      this.clampTranslate(this.translateX(), this.translateY(), clampedScale);
      return;
    }

    if (this.isDragging && event.touches.length === 1) {
      event.preventDefault();

      const touch = event.touches[0];
      const dx = (touch.clientX - this.lastTouchX) / this.currentScale();;
      const dy = (touch.clientY - this.lastTouchY) / this.currentScale();;

      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;

      const newX = this.translateX() + dx;
      const newY = this.translateY() + dy;

      this.clampTranslate(newX, newY);
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.isPinching && event.touches.length < 2) {
      this.isPinching = false;
    }

    if (this.isDragging) {
      this.isDragging = false;
    }

    this.endX = event.changedTouches[0].clientX;

    if (this.currentScale() <= 1) {
      this.handleSwipe(event);
    }
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  handleSwipe(event: TouchEvent): void {
    if (this.isPinching) return; // Игнорируем при зуме

    const deltaX = this.endX - this.startX;
    const deltaY = event.changedTouches[0].clientY - this.startY;

    // Проверяем, что движение преимущественно горизонтальное
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 2; // Отношение 2:1

    if (!isHorizontalSwipe || Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return; // Игнорируем вертикальные или слишком короткие свайпы
    }

    if (deltaX < 0) {
      this.next();
    } else {
      this.prev();
    }
  }

  @HostListener('window:keydown.arrowright')
  onArrowRight() {
    this.next();
  }

  @HostListener('window:keydown.arrowleft')
  onArrowLeft() {
    this.prev();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }

  getFileUrl() {
    return this.urlService.getFileUrl(this.currentItem().name, true);
  }

  resetZoom() {
    this.currentScale.set(1);
    this.translateX.set(0);
    this.translateY.set(0);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.currentScale() <= 1) {
      return;
    }

    this.isMouseDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    const contentEl = this.elRef.nativeElement.querySelector(`.${ZOOMABLE_CONTENT_CLASS}`);
    this.renderer.addClass(contentEl, NO_TRANSITION_CLASS);

    event.preventDefault();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isMouseDragging) return;

    event.preventDefault();

    const dx = (event.clientX - this.lastMouseX) / this.currentScale();
    const dy = (event.clientY - this.lastMouseY) / this.currentScale();

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    const newX = this.translateX() + dx;
    const newY = this.translateY() + dy;

    this.clampTranslate(newX, newY);
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUp() {
    this.isMouseDragging = false;

    const contentEl = this.elRef.nativeElement.querySelector(`.${ZOOMABLE_CONTENT_CLASS}`);
    this.renderer.removeClass(contentEl, 'no-transition');
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!event.ctrlKey) {
      return;
    }

    event.preventDefault();

    const scaleDelta = -event.deltaY * 0.002;
    const newScale = Math.max(MIN_ZOOM, Math.min(this.currentScale() + scaleDelta, MAX_ZOOM));

    if (newScale === this.currentScale()) {
      return;
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();

    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    const scaleRatio = newScale / this.currentScale();

    const newTranslateX = this.translateX() - offsetX * (scaleRatio - 1);
    const newTranslateY = this.translateY() - offsetY * (scaleRatio - 1);

    this.currentScale.set(newScale);

    this.clampTranslate(newTranslateX, newTranslateY, newScale);
  }

  private clampTranslate(x: number, y: number, scale: number = this.currentScale()) {
    const container = this.elRef.nativeElement.querySelector(`.${ZOOMABLE_CONTAINER_CLASS}`) as HTMLElement;
    const content = this.elRef.nativeElement.querySelector(`.${ZOOMABLE_CONTENT_CLASS}`) as HTMLElement;

    if (!container || !content) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const contentWidth = contentRect.width;
    const contentHeight = contentRect.height;

    // Максимальное смещение, при котором контент остается в границах контейнера
    const maxTranslateX = Math.max(0, (contentWidth - containerWidth) / 2 / scale);
    const minTranslateX = -maxTranslateX;

    const maxTranslateY = Math.max(0, (contentHeight - containerHeight) / 2 / scale);
    const minTranslateY = -maxTranslateY;

    // Применяем ограничения
    const clampedX = Math.min(maxTranslateX, Math.max(minTranslateX, x));
    const clampedY = Math.min(maxTranslateY, Math.max(minTranslateY, y));

    this.translateX.set(clampedX);
    this.translateY.set(clampedY);
  }
}
