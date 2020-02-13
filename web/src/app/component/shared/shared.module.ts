import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material/material.module';
import { OptionNamePipe } from 'src/app/pipe/option-name.pipe';
import { DicimalPlacePipe } from 'src/app/pipe/dicimal-place.pipe';


@NgModule({
  imports: [
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
    DicimalPlacePipe
  ]
})
export class SharedModule { }
