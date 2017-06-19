import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  EventEmitter,
  Output,
  TemplateRef
} from '@angular/core';

import {TagsInputComponent} from '@components/tags-input/tags-input.component';
import {Utils} from '@services/utils.service';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DropdownComponent {
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  @Input() model: any[];
  @Input() options: any[];
  @Input() isOpen: boolean;
  @Input() tagLabel: string;
  @Output() optionClicked: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  emitOption(option: any): void {

    if (this.isExistingInModel(option)) {
      return;
    }

    this.optionClicked.emit(option);
  }

  isExistingInModel(option: any): boolean {

    const existingOption: number = Utils.findObjectByQuery(this.model, this.tagLabel, option[this.tagLabel]);

    if (existingOption) {
      return true;
    }
    else {
      return false;
    }
  }

  trackByFn(i, tag) {
    return tag.tagId;
  }
}
