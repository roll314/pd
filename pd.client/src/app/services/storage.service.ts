import {computed, Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  readonly rootDir = signal('');
  readonly rootDir$ = toObservable(this.rootDir);

  readonly subPathArr = signal(['/']);
  readonly subPathArr$ = toObservable(this.subPathArr);

  readonly subPath = computed(() => this.subPathArr().join('/'));
  readonly subPath$ = toObservable(this.subPath);
}
