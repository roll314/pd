import {Observable, Operator} from 'rxjs';

export class ObservableValue<T> extends Observable<T>{
  private _value: T | null = null;

  get value(): T | null {
    return this._value;
  }

  constructor(
    private observable: Observable<T>,
    private defaultValue: T | null
  ) {
    super();
    this._value = defaultValue;
    // Subject::asObservable used the same mechanism
    this.source = this.observable;
    this.observable.subscribe(value => this._value = value);
  }

  // todo not sure it should works like that
  override lift<R>(operator: Operator<T, R>): ObservableValue<R> {
    const observable = new ObservableValue<R>((this as unknown as ObservableValue<R>), null);
    observable.operator = operator;
    return observable;
  }
}

export function asObservableValue<T>(observable: Observable<T>, defaultValue: T | null = null): ObservableValue<T> {
  return new ObservableValue(observable, defaultValue);
}
