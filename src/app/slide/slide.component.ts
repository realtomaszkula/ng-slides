import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostBinding,
  Input
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-slide-content',
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        transition: 100ms all;
      }
    `
  ]
})
export class SlideContentComponent implements AfterViewChecked {
  width: number;

  private _transformX: any;
  @Input()
  @HostBinding('style.transform')
  set transformX(value: any) {
    this._transformX = this.sanitizer.bypassSecurityTrustStyle(
      `translateX(${value}%)`
    );
  }
  get transformX() {
    return this._transformX;
  }

  constructor(public el: ElementRef, public sanitizer: DomSanitizer) {}

  ngAfterViewChecked() {
    const { width } = this.el.nativeElement.getBoundingClientRect();

    this.width = width;
  }
}
