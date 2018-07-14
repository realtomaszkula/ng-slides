import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SlideContentComponent } from './slide.component';
import { SlideComponent } from './slide-container.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SlideContentComponent, SlideComponent],
  exports: [SlideComponent]
})
export class SlideModule {}
