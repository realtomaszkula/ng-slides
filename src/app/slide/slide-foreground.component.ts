import { Component } from '@angular/core';

@Component({
  selector: 'app-slide-foreground',
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        padding: 1em;
        text-align: center;
      }
    `
  ]
})
export class SlideForegroundComponent {}
