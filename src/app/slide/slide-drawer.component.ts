import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  finalize,
  map,
  scan,
  share,
  switchMapTo,
  takeUntil
} from 'rxjs/operators';
import { Direction } from './private_api';

@Component({
  selector: 'app-slide-drawer',
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        transition: 100ms all;
      }
    `
  ]
})
export class SlideDrawerComponent
  implements AfterViewChecked, AfterViewInit, OnDestroy {
  private readonly completeTreshold = 30;

  private unsubscribeSource = new Subject<void>();
  private unsubscribe$ = this.unsubscribeSource.asObservable();

  width: number;
  left: number;
  right: number;

  @Input() direction: Direction;
  @Output() directionChange = new EventEmitter<Direction>();

  @Input() transformX: number;
  @Output() transformXChange = new EventEmitter<number>();

  @HostBinding('style.transform')
  get transformXStyle() {
    return this.sanitizer.bypassSecurityTrustStyle(
      `translateX(${this.transformX}%)`
    );
  }

  get isAboveCompleteTreshold() {
    return Math.abs(this.transformX) > this.completeTreshold;
  }

  get isSlidingRight() {
    return this.direction === Direction.Right;
  }

  get isSlidingLeft() {
    return this.direction === Direction.Left;
  }

  constructor(public el: ElementRef, public sanitizer: DomSanitizer) {}

  ngAfterViewChecked() {
    const {
      width,
      left,
      right
    } = this.el.nativeElement.getBoundingClientRect();

    this.width = width;
    this.left = left;
    this.right = right;
  }

  ngAfterViewInit() {
    const touchstart$ = fromEvent<TouchEvent>(
      this.el.nativeElement,
      'touchstart'
    ).pipe(share());

    const touchmove$ = fromEvent<TouchEvent>(
      this.el.nativeElement,
      'touchmove'
    ).pipe(share());

    const touchend$ = fromEvent<TouchEvent>(
      this.el.nativeElement,
      'touchend'
    ).pipe(share());

    this.handleDirectionStream(touchstart$, touchmove$, touchend$);
    this.handleTransitionStream(touchstart$, touchmove$, touchend$);
  }

  ngOnDestroy() {
    this.unsubscribeSource.next();
  }

  private handleDirectionStream(
    touchstart$: Observable<TouchEvent>,
    touchmove$: Observable<TouchEvent>,
    touchend$: Observable<TouchEvent>
  ) {
    touchstart$
      .pipe(
        switchMapTo(
          touchmove$.pipe(
            map(event => event.changedTouches[0].clientX),
            scan((acc, curr) => [...acc, curr], []),
            map(events => ({
              first: events[0],
              last: events[events.length - 1]
            })),
            map(({ first, last }) => last - first),
            map(distance => (distance > 0 ? Direction.Right : Direction.Left)),
            distinctUntilChanged(),
            share(),
            takeUntil(touchend$)
          )
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(direction => this.directionChange.emit(direction));
  }

  private handleTransitionStream(
    touchstart$: Observable<TouchEvent>,
    touchmove$: Observable<TouchEvent>,
    touchend$: Observable<TouchEvent>
  ) {
    touchstart$
      .pipe(
        switchMapTo(
          touchmove$.pipe(
            map(event => event.changedTouches[0].clientX),
            scan((acc, curr) => [...acc, curr], []),
            map(events => ({
              first: events[0],
              last: events[events.length - 1]
            })),
            map(({ first, last }) => last - first),
            map(distance => this.calculateDistanceCovered(distance)),
            finalize(() => {
              this.completeOrResetTransition();
            }),
            takeUntil(touchend$)
          )
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(x => this.advanceTransition(x));
  }

  private calculateDistanceCovered(distance: number): number {
    return Math.floor((distance / this.width) * 100);
  }

  private completeOrResetTransition() {
    if (this.isAboveCompleteTreshold && this.isSlidingLeft) {
      return this.completeTransitionLeft();
    }
    if (this.isAboveCompleteTreshold && this.isSlidingRight) {
      return this.completeTransitionRight();
    }

    return this.resetTransition();
  }

  private advanceTransition(x: number) {
    this.transformXChange.emit(x);
  }

  private completeTransitionLeft() {
    this.transformXChange.emit(-100);
  }

  private completeTransitionRight() {
    this.transformXChange.emit(100);
  }

  private resetTransition() {
    this.transformXChange.emit(0);
  }
}
