import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

// TODO: Make this component more useful.
export class TagComponent implements OnInit {
  @Input() isTagEditable: boolean;
  @Input() tagLabel: string;

  @Input() set tag(tag) {
    this._tag = tag;
  }

  @Output() tagChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() tagRemove: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('tagLabelElement') tagLabelElement: ElementRef;

  get tag() {
    return this._tag;
  }

  private _tag: any;

  constructor() {}

  ngOnInit() {}

  updateTag(): void {

    if (!this.isTagEditable) {
      return;
    }

    this.tagChange.emit({
      previousValue: this.tag[this.tagLabel],
      newValue: this.tagLabelElement.nativeElement.innerHTML
    });
  }
}
