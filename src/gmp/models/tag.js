/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model from 'gmp/model';
import {parseInt} from 'gmp/parser';
import {normalizeType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

class Tag extends Model {
  static entityType = 'tag';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(element.resources)) {
      ret.resourceType = normalizeType(element.resources.type);
      ret.resourceCount = parseInt(element.resources.count.total);
    } else {
      ret.resourceCount = 0;
    }
    ret.value = isEmpty(element.value) ? undefined : element.value;

    return ret;
  }
}

export default Tag;

// vim: set ts=2 sw=2 tw=80:
