import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { WaitlistRoutingModule } from './waitlist-routing.module';
import { WaitlistPageComponent } from './waitlist-page/waitlist-page.component';

@NgModule({
  declarations: [
    WaitlistPageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    WaitlistRoutingModule
  ]
})
export class WaitlistModule { }
