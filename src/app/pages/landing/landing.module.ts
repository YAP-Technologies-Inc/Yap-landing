import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LandingRoutingModule } from './landing-routing.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { HeroComponent } from './hero/hero.component';
import { FeatureGridComponent } from './feature-grid/feature-grid.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FaqComponent } from './faq/faq.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    LandingPageComponent,
    HeroComponent,
    FeatureGridComponent,
    TimelineComponent,
    FaqComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
