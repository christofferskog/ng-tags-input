import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  EventEmitter,
  ElementRef,
  forwardRef,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';

import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';

import {Utils} from '@services/utils.service';

import {TagsInputApi} from './shared/tags-input-api.service';
import {TagsInputUtils} from './shared/tags-input-utils.service';
// import {DropdownComponent} from './shared/dropdown/dropdown.component';

@Component({
  selector: 'tags-input',
  templateUrl: './tags-input.component.html',
  styleUrls: ['./tags-input.component.scss'],
  providers: [
    {
     provide: NG_VALUE_ACCESSOR,
     useExisting: forwardRef(() => TagsInputComponent),
     multi: true
   }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TagsInputComponent implements ControlValueAccessor, OnDestroy, OnInit {

  @Input() beforeTagAdded: (currentTag: string) => boolean;
  @Input() options: any[] = [];
  @Input() disabled = false;
  @Input() required = false;
  @Input() isCaseSensitive = false;
  @Input() isCurrentTagClearedOnBlur = false;
  @Input() isSpacesReplaced = false;
  @Input() isTagsAddedOnPaste = true;
  @Input() isTagsEditable = true;
  @Input() isDuplicatesAllowed = false;
  @Input() cap: number;
  @Input() tagLabel = 'name';
  @Input() pasteSplitPattern = ',';
  @Input() spacesReplacement = '-';
  @Input() label = '';
  @Input() placeholder = '';

  @Output() tagAdded: EventEmitter<any> = new EventEmitter<any>();
  @Output() tagUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() tagRemoved: EventEmitter<any> = new EventEmitter<any>();
  @Output() tagInvalid: EventEmitter<any> = new EventEmitter<any>();
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('tagsInput') tagsInput: ElementRef;
  @ViewChild('input') input: ElementRef;
  @ViewChildren('tagElement') tagElements: QueryList<any>;

  public id: string = Utils.getUniqueID();
  public previousCurrentTagValue: string;
  public isFocused: boolean;
  public isDropdownOpen: boolean;
  public isPastedText: boolean;

  private documentSubject = new Subject();
  private documentSubscription: Subscription;
  private documentClickHandler: any;
  private documentTouchHandler: any;
  private _model: any[] = [];
  private _currentTag = '';

  set currentTag(currentTag) {

    this._currentTag = currentTag;

    if (this.isPastedText) {

      this.isPastedText = false;

      this.addTagsFromText();
    }
  }

  get currentTag() {
    return this._currentTag;
  }

  set model(model) {

    for (const tag of model) {

      if (this.isSpacesReplaced) {
        tag[this.tagLabel] = this.replaceSpaces(tag[this.tagLabel]);
      }

      if (!tag.tagId) {
        tag.tagId = Utils.getUniqueID();
      }
    };

    if (!this.isDuplicatesAllowed) {
      this._model = TagsInputUtils.removeDupes(model, this.tagLabel);
    }
    else {
      this._model = model;
    }

    this.cd.markForCheck();
  }

  get model() {
    return this._model;
  }

  constructor(private cd: ChangeDetectorRef, private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {

    this.documentClickHandler = this.renderer.listen('document', 'click', (e: any) => {
      this.documentSubject.next(e);
    });

    this.documentTouchHandler = this.renderer.listen('document', 'touchend', (e: any) => {
      this.documentSubject.next(e);
    });

    this.documentSubscription = this.documentSubject.debounceTime(100).subscribe(
      (e: any) => {

        if (this.elementRef.nativeElement !== e.target && !this.elementRef.nativeElement.contains(e.target)) {

          this.isDropdownOpen = false;

          this.cd.markForCheck();
        }
      }
    );
  }

  ngOnDestroy() {
    this.documentClickHandler();
    this.documentTouchHandler();
    this.documentSubscription.unsubscribe();
  }

  propagateChange = (_: any) => {};

  registerOnChange(fn: () => any) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  writeValue(value: any) {

    if (value !== undefined && value !== null) {
      this.model = value;
    }
  }

  addTag(): void {

    if (this.beforeTagAdded && !this.beforeTagAdded(this.currentTag)) {
      return;
    }

    const existingTag: number = Utils.findObjectIndex(this.model, {[this.tagLabel]: this.currentTag}, this.tagLabel, this.isCaseSensitive);

    if (!this.currentTag || this.disabled || existingTag !== -1 || this.model.length >= this.cap) {

      this.tagInvalid.emit(this.currentTag);

      return;
    }

    this.model = [...this.model, {
      tagId: Utils.getUniqueID(),
      [this.tagLabel]: this.currentTag.trim()
    }];

    this.clearCurrentTag();
  }

  addTagsFromText(): void {

    if (!this.currentTag || !this.isTagsAddedOnPaste || this.disabled || this.model.length >= this.cap) {

      this.tagInvalid.emit(null);

      return;
    }

    const tags: any[] = this.currentTag.split(this.pasteSplitPattern);

    for (const plainTextTag of tags) {

      const existingTag: any = Utils.findObjectByQuery(this.model, this.tagLabel, plainTextTag, this.isCaseSensitive);

      if (!existingTag) {

        if (this.beforeTagAdded && !this.beforeTagAdded(this.currentTag)) {
          continue;
        }

        this.model = [...this.model, {
          tagId: Utils.getUniqueID(),
          [this.tagLabel]: plainTextTag.trim()
        }];
      }
    };

    // Without a timeout the input will not be cleared,
    // regardless of the current input model state.
    setTimeout(() => {
      this.clearCurrentTag();
    });
  }

  addFromDropdown(option: any): void {

    if (!option || !option[this.tagLabel] || this.disabled || this.model.length >= this.cap) {

      this.tagInvalid.emit(null);

      return;
    }

    const newTag: any = Object.assign({}, option, {tagId: Utils.getUniqueID()});

    this.model = [...this.model, newTag];
  }

  updateTag(event: any, tag: any): void {

    if (!this.isTagsEditable || (this.beforeTagAdded && !this.beforeTagAdded(event.newValue))) {
      return;
    }

    const existingTag: number = Utils.findObjectIndex(this.model, {[this.tagLabel]: event.newValue}, this.tagLabel, this.isCaseSensitive);

    if (!event.newValue || this.disabled || existingTag !== -1) {

      this.tagInvalid.emit(this.currentTag);

      this.removeTag(tag);

      return;
    }

    tag[this.tagLabel] = event.newValue;

    this.model = [...this.model, ...tag];
  }

  removeTag(tag: any): void {
    this.model = this.model.filter((item) => item.tagId !== tag.tagId);
    this.tagRemoved.emit(tag);
  }

  onPaste(e: any): void {
    this.isPastedText = true;
  }

  focusChange(): boolean {

    if (this.disabled) {
      return false;
    }

    this.isFocused = !this.isFocused;

    if (!this.isFocused) {

      if (this.isCurrentTagClearedOnBlur) {
        this.clearCurrentTag();
      }
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = true;
  }

  clearCurrentTag(): void {
    this.currentTag = '';
  }

  currentTagChange(e: any): boolean {

    const length: number = this.model.length;
    const lastTag: any = this.model[length - 1];

    if ((e.keyCode || e.which || 0) === 8 && lastTag) {

      if (lastTag.isMarkedForDelete) {
        this.removeTag(lastTag);
      }

      if (this.previousCurrentTagValue === '' && !lastTag.isMarkedForDelete) {
        lastTag.isMarkedForDelete = true;
      }

      this.setPreviousCurrentTagValue();

      return false;
    }

    if (length && lastTag.isMarkedForDelete) {
      lastTag.isMarkedForDelete = false;
    }

    this.setPreviousCurrentTagValue();
  }

  replaceSpaces(string: string): any {

    string = string.trim();

    if (string.indexOf(' ') !== -1) {
      return string.replace(/ /g, this.spacesReplacement);
    }

    return string;
  }

  setPreviousCurrentTagValue(): void {
    this.previousCurrentTagValue = this.currentTag;
  }

  trackByFn(i, tag) {
    return tag.tagId;
  }
}