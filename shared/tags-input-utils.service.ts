import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

import {Utils} from '@services/utils.service';

@Injectable()

export class TagsInputUtils {

  static removeDupes(list: any[], key: string): any[] {

    const sortedList = Utils.getSortedList(list, key);

    for (let i = sortedList.length; i > 0; --i) {

      const tag = sortedList[i - 1]; // -1 to account for length being higher than array index count
      const previousTag = sortedList[i - 2];

      if (!previousTag) {
        break;
      }

      // Check if the current tag is the same as the previous one (previous = current and the one to the left)
      if (sortedList[i - 1][key] === previousTag[key]) {

        const existingTagIndex = Utils.findObjectIndex(list, sortedList[i - 1], 'tagId');

        list.splice(existingTagIndex, 1);

        // This must happen after we remove it from the model or sortedModel[i - 1] will be undefined since it's been removed
        sortedList.splice(i - 1, 1);
      }
    };

    return list;
  }
}


