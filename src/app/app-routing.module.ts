import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnvironmentsComponent } from './components/environments/environments.component';
import { PlaygroundComponent } from './components/playground/playground.component';
import { SettingsComponent } from './components/settings/settings.component';
import { WorkflowRulesComponent } from './components/workflow-rules/workflow-rules.component';
import { WorkflowRulesEditorComponent } from './components/workflow-rules-editor/workflow-rules-editor.component';
import { WorkflowRulesOriginalComponent } from './components/workflow-rules-original/workflow-rules-original.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/api'
  },
  {
    path: 'api',
    component: PlaygroundComponent
  },
  {
    path: 'workflow-rules',
    component: WorkflowRulesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'editor'
      },
      {
        path: 'editor',
        component: WorkflowRulesEditorComponent
      },
      {
        path: 'original',
        component: WorkflowRulesOriginalComponent
      }
    ]
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
