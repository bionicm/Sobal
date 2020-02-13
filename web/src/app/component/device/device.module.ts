import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { DeviceListComponent } from './device-list/device-list.component';
import { DeviceListItemComponent } from './device-list-item/device-list-item.component';
import { DevicePreferenceListComponent } from './device-preference-list/device-preference-list.component';
import { DevicePreferenceListItemComponent } from './device-preference-list-item/device-preference-list-item.component';
import { DevicePreferenceComponent } from './device-preference/device-preference.component';
import { StatusComponent } from './status/status.component';
import { PinDialogComponent } from './pin-dialog/pin-dialog.component';

@NgModule({
  declarations: [
    DeviceListComponent,
    DeviceListItemComponent,
    DevicePreferenceComponent,
    DevicePreferenceListComponent,
    DevicePreferenceListItemComponent,
    StatusComponent,
    PinDialogComponent
  ],
  imports: [
    TranslateModule.forChild(),
    SharedModule
  ],
  exports: [
    DeviceListComponent,
    DeviceListItemComponent,
    DevicePreferenceComponent,
    DevicePreferenceListComponent,
    DevicePreferenceListItemComponent
  ],
  entryComponents: [
    PinDialogComponent
  ]
})
export class DeviceModule { }
