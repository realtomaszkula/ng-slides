import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { finalize, map, scan, switchMapTo, takeUntil } from 'rxjs/operators';
import { SlideContentComponent } from './slide.component';

@Component({
  selector: 'app-slide',
  template: `
    <app-slide-content [transformX]="transformX$ | async">
      <ng-content></ng-content>
    <app-slide-content>
  `,
  styles: [
    `
      :host {
        display: block;
        background-color: silver;
        overflow: hidden;
      }
    `
  ]
})
export class SlideComponent implements AfterViewInit, OnDestroy {
  @ViewChild(SlideContentComponent) slide: SlideContentComponent;

  private readonly completeTreshold = 30;

  private unsubscribeSource = new Subject<void>();
  unsubscribe$ = this.unsubscribeSource.asObservable();

  private transformXSource = new BehaviorSubject<number>(0);
  transformX$ = this.transformXSource.asObservable();

  get currentTransformValue() {
    return this.transformXSource.value;
  }

  ngAfterViewInit() {
    const touchstart$ = fromEvent<TouchEvent>(
      this.slide.el.nativeElement,
      'touchstart'
    );
    const touchmove$ = fromEvent<TouchEvent>(
      this.slide.el.nativeElement,
      'touchmove'
    );
    const touchend$ = fromEvent<TouchEvent>(
      this.slide.el.nativeElement,
      'touchend'
    );

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

  ngOnDestroy() {
    this.unsubscribeSource.next();
  }

  private calculateDistanceCovered(distance: number): number {
    return Math.floor((distance / this.slide.width) * 100);
  }

  private completeOrResetTransition() {
    const isAboveCompleteTreshold =
      Math.abs(this.currentTransformValue) > this.completeTreshold;
    const isMovingRight = this.currentTransformValue > 0;
    const isMovingLeft = !isMovingRight;

    if (isAboveCompleteTreshold && isMovingLeft) {
      return this.completeTransitionLeft();
    }
    if (isAboveCompleteTreshold && isMovingRight) {
      return this.completeTransitionRight();
    }

    return this.resetTransition();
  }

  private advanceTransition(x: number) {
    this.transformXSource.next(x);
  }

  private completeTransitionLeft() {
    this.transformXSource.next(-100);
  }

  private completeTransitionRight() {
    this.transformXSource.next(100);
  }

  private resetTransition() {
    this.transformXSource.next(0);
  }
}
