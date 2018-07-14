import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <app-slide *ngFor="let x of items">
    <section>
      Hello
    </section>
  </app-slide>
  `,
  styles: [
    `
      section {
        padding: 1em;
        background-color: tomato;
        color: white;
        text-align: center;
      }

      app-slide {
        margin-bottom: 1px;
      }
    `
  ]
})
export class AppComponent {
  items = Array(10);
}
