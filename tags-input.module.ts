import {NgModule} from '@angular/core';

import {SharedModule} from '@modules/shared.module';
import {DropdownModule} from './shared/dropdown/dropdown.module';
import {TagModule} from './shared/tag/tag.module';
import {TagsInputComponent} from './tags-input.component';

@NgModule({
  imports: [
    SharedModule,
    DropdownModule,
    TagModule
  ],
  exports: [
    TagsInputComponent
  ],
  declarations: [
    TagsInputComponent
  ]
})

export class TagsInputModule {}
