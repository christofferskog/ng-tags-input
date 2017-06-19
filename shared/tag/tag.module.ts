import {NgModule} from '@angular/core';

import {SharedModule} from '@modules/shared.module';
import {TagComponent} from './tag.component';

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [
    TagComponent
  ],
  declarations: [
    TagComponent
  ]
})

export class TagModule {}
