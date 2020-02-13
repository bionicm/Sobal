import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeviceListComponent } from './component/device/device-list/device-list.component';
import { DevicePreferenceComponent } from './component/device/device-preference/device-preference.component';

const routes: Routes = [
  { path: '', component: DeviceListComponent },
  { path: 'device', component: DevicePreferenceComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
