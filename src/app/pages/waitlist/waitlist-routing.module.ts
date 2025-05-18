import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WaitlistPageComponent } from './waitlist-page/waitlist-page.component';

const routes: Routes = [
  {
    path: '',
    component: WaitlistPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WaitlistRoutingModule { }
