import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './header/header.component';

@NgModule({
  imports: [
    TranslateModule.forChild(),
    SharedModule
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class CoreModule { }
