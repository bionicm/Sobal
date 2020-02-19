import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material/material.module';
import { OptionNamePipe } from 'src/app/pipe/option-name.pipe';
import { DicimalPlacePipe } from 'src/app/pipe/dicimal-place.pipe';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';


@NgModule({
  imports: [
    TranslateModule.forChild(),
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    OptionNamePipe,
    DicimalPlacePipe
  ],
  declarations: [
    OptionNamePipe,
    DicimalPlacePipe,
    ErrorDialogComponent
  ],
  entryComponents: [
    ErrorDialogComponent
  ]
})
export class SharedModule { }
