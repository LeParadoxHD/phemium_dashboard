import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { es_ES } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { MenuComponent } from './components/menu/menu.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxsModule } from '@ngxs/store';
import { ApisState, ConfigState, EnvironmentsState, LoginsState, SettingsState, ViewState } from './state/store';
import { environment } from 'src/environments/environment';
import { PlaygroundComponent } from './components/playground/playground.component';
import { EnvironmentsComponent } from './components/environments/environments.component';
import { SettingsComponent } from './components/settings/settings.component';
import { BannerComponent } from './components/banner/banner.component';
import { AddEditEnvironmentComponent } from './components/environments/add-edit-environment/add-edit-environment.component';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { ParametersComponent } from './components/playground/parameters/parameters.component';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { FieldListOptionsComponent } from './components/fields/field-list-options/field-list-options.component';
import { IsArrayParamPipe } from './pipes/is-array-param.pipe';
import { TrimArrayParamPipe } from './pipes/trim-array-param.pipe';
import { NgLetDirective } from './directives/let.directive';
import { RequestComponent } from './components/playground/request/request.component';
import { ResponseComponent } from './components/playground/response/response.component';
import { EditorFieldComponent } from './components/fields/editor-field/editor-field.component';
import { DatetimeFieldComponent } from './components/fields/datetime-field/datetime-field.component';
import { NzMessageModule } from 'ng-zorro-antd/message';

registerLocaleData(es);

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    PlaygroundComponent,
    EnvironmentsComponent,
    SettingsComponent,
    BannerComponent,
    AddEditEnvironmentComponent,
    ParametersComponent,
    FieldListOptionsComponent,
    DatetimeFieldComponent,
    IsArrayParamPipe,
    TrimArrayParamPipe,
    NgLetDirective,
    RequestComponent,
    ResponseComponent,
    EditorFieldComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutModule,
    NzIconModule,
    NzMenuModule,
    NzResizableModule,
    NzDropDownModule,
    NzBadgeModule,
    NzSelectModule,
    NzMessageModule,
    NzDividerModule,
    NzTabsModule,
    NzTableModule,
    NzButtonModule,
    NzBreadCrumbModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzSpinModule,
    NzAlertModule,
    MonacoEditorModule,
    ScrollingModule,
    NgxsModule.forRoot([ApisState, EnvironmentsState, SettingsState, ConfigState, ViewState, LoginsState], {
      developmentMode: !environment.production
    }),
    NgxsStoragePluginModule.forRoot({
      key: [ApisState, EnvironmentsState, SettingsState, ViewState, LoginsState]
    }),
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [{ provide: NZ_I18N, useValue: es_ES }],
  bootstrap: [AppComponent]
})
export class AppModule {}
