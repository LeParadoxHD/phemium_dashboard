import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnvironmentsComponent } from './components/environments/environments.component';
import { PlaygroundComponent } from './components/playground/playground.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/playground'
  },
  {
    path: 'playground',
    component: PlaygroundComponent
  },
  {
    path: 'environments',
    component: EnvironmentsComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
