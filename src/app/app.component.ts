import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <app-slide *ngFor="let x of items" (slideLeft)="onLeft()" (slideRight)="onRight()">
    <app-slide-foreground>Hello</app-slide-foreground>
    <app-slide-background-left>Left</app-slide-background-left>
    <app-slide-background-right>Right</app-slide-background-right>
  </app-slide>
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 1em;
      }

      app-slide {
        margin-bottom: 1px;
      }

      app-slide-foreground {
        background-color: tomato;
        color: white;
      }

      app-slide-background-left {
        background-color: yellow;
      }

      app-slide-background-right {
        background-color: aliceblue;
      }
    `
  ]
})
export class AppComponent {
  items = Array(10);

  onLeft() {
    console.log('left');
  }

  onRight() {
    console.log('right');
  }
}
