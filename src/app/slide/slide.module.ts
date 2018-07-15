import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SlideBackgroundLeftComponent } from './slide-background-left.component';
import { SlideBackgroundRightComponent } from './slide-background-right.component';
import { SlideComponent } from './slide-container.component';
import { SlideDrawerComponent } from './slide-drawer.component';
import { SlideForegroundComponent } from './slide-foreground.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    SlideDrawerComponent,
    SlideComponent,
    SlideBackgroundLeftComponent,
    SlideBackgroundRightComponent,
    SlideForegroundComponent
  ],
  exports: [
    SlideComponent,
    SlideBackgroundLeftComponent,
    SlideBackgroundRightComponent,
    SlideForegroundComponent
  ]
})
export class SlideModule {}
