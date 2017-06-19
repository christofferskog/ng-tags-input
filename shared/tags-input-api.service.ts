import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()

export class TagsInputApi {

  private _config = new Subject<any>();
  private _removed = new Subject<any[]>();
  private _added = new Subject<any[]>();

  config$ = this._config.asObservable();
  removed$ = this._removed.asObservable();
  added$ = this._added.asObservable();

  setConfig(config: any): void {
    this._config.next(config);
  }

  setRemoved(tags: Array<any>): void {
    this._removed.next(tags);
  }

  setAdded(tags: Array<any>): void {
    this._added.next(tags);
  }
}