import { Component, Output, EventEmitter } from '@angular/core';
import { Direction, Slide } from './private_api';

@Component({
  selector: 'app-slide',
  template: `
    <app-slide-drawer 
      [transformX]="transformX"
      (transformXChange)="onTransformX($event)"
      [direction]="direction" 
      (directionChange)="direction = $event">
      <ng-content select="app-slide-foreground"></ng-content>
    </app-slide-drawer>

    <ng-content 
      *ngIf="isSlidingRight" 
      select="app-slide-background-left">
    </ng-content>

    <ng-content 
      *ngIf="isSlidingLeft" 
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
export class SlideComponent {
  @Output() slideLeft = new EventEmitter<void>();
  @Output() slideRight = new EventEmitter<void>();

  direction: Direction;
  transformX: number;

  get isSlidingRight() {
    return this.direction === Direction.Right;
  }

  get isSlidingLeft() {
    return this.direction === Direction.Left;
  }

  onTransformX(x: number) {
    this.transformX = x;

    switch (x) {
      case Slide.Right: {
        this.slideRight.emit();
        break;
      }
      case Slide.Left: {
        this.slideLeft.emit();
        break;
      }
    }
  }
}
