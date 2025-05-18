import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'three',
    loadChildren: () => import('./three-scene/three-scene.module').then(m => m.ThreeSceneModule)
  },
  {
    path: 'landing',
    loadChildren: () => import('./pages/landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'waitlist',
    loadChildren: () => import('./pages/waitlist/waitlist.module').then(m => m.WaitlistModule)
  },
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
