/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';

// @ts-expect-error
class Info extends Model {
  static entityType = 'info';

  static parseElement(elem, infoType) {
    const info_elem = elem[infoType];

    if (isDefined(info_elem)) {
      // elem is an info element content is in its child
      elem = {
        ...elem,
        ...info_elem,
      };

      delete elem[infoType];
    }

    return super.parseElement(elem);
  }
}

export default Info;
