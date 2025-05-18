import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SceneComponent } from './scene/scene.component';
import { ThreeSceneRoutingModule } from './routing/three-scene-routing.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    SceneComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ThreeSceneRoutingModule
  ],
  exports: [
    SceneComponent
  ]
})
export class ThreeSceneModule { }
