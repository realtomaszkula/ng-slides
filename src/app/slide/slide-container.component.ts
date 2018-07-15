import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  finalize,
  map,
  scan,
  share,
  switchMapTo,
  takeUntil
} from 'rxjs/operators';
import { SlideDrawerComponent } from './slide-drawer.component';

enum Direction {
  Left = 'Left',
  Right = 'Right'
}

@Component({
  selector: 'app-slide',
  template: `
    <app-slide-drawer [transformX]="transformX$ | async">
      <ng-content select="app-slide-foreground"></ng-content>
    </app-slide-drawer>

    <ng-content 
      *ngIf="isSwipingRight$ | async" 
      select="app-slide-background-left">
    </ng-content>

    <ng-content 
      *ngIf="isSwipingLeft$ | async" 
      select="app-slide-background-right">
    </ng-content>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        height: 50px;
      }
    `
  ]
})
export class SlideComponent implements AfterViewInit, OnDestroy {
  @ViewChild(SlideDrawerComponent) drawer: SlideDrawerComponent;

  private readonly completeTreshold = 30;

  private unsubscribeSource = new Subject<void>();
  private unsubscribe$ = this.unsubscribeSource.asObservable();

  isSwipingLeft$: Observable<boolean>;
  isSwipingRight$: Observable<boolean>;

  private transformXSource = new BehaviorSubject<number>(0);
  transformX$ = this.transformXSource.asObservable();

  get currentTransformValue() {
    return this.transformXSource.value;
  }

  ngAfterViewInit() {
    const touchstart$ = fromEvent<TouchEvent>(
      this.drawer.el.nativeElement,
      'touchstart'
    ).pipe(share());

    const touchmove$ = fromEvent<TouchEvent>(
      this.drawer.el.nativeElement,
      'touchmove'
    ).pipe(share());

    const touchend$ = fromEvent<TouchEvent>(
      this.drawer.el.nativeElement,
      'touchend'
    ).pipe(share());

    this.setDirectionStreams(touchstart$, touchmove$, touchend$);
    this.setTransitionStream(touchstart$, touchmove$, touchend$);
  }

  ngOnDestroy() {
    this.unsubscribeSource.next();
  }

  private setTransitionStream(
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

  private setDirectionStreams(
    touchstart$: Observable<TouchEvent>,
    touchmove$: Observable<TouchEvent>,
    touchend$: Observable<TouchEvent>
  ) {
    const direction$ = touchstart$.pipe(
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
    );
    this.isSwipingLeft$ = direction$.pipe(map(d => d === Direction.Left));
    this.isSwipingRight$ = direction$.pipe(map(d => d === Direction.Right));
  }

  private calculateDistanceCovered(distance: number): number {
    return Math.floor((distance / this.drawer.width) * 100);
  }

  private completeOrResetTransition() {
    const isAboveCompleteTreshold =
      Math.abs(this.currentTransformValue) > this.completeTreshold;
    const isMovingRight = this.currentTransformValue > 0;
    const isMovingLeft = this.currentTransformValue < 0;

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
