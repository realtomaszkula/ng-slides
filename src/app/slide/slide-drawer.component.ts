import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostBinding,
  Input
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

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
export class SlideDrawerComponent implements AfterViewChecked {
  width: number;
  left: number;
  right: number;

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
    const {
      width,
      left,
      right
    } = this.el.nativeElement.getBoundingClientRect();

    this.width = width;
    this.left = left;
    this.right = right;
  }
}
