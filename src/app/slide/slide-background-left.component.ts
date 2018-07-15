import { Component } from '@angular/core';

@Component({
  selector: 'app-slide-background-left',
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        padding: 1em;
        text-align: start;
      }
    `
  ]
})
export class SlideBackgroundLeftComponent {}
