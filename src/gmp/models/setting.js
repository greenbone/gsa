/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isEmpty} from 'gmp/utils/string';

class Setting {
  constructor(element) {
    this.id = element._id;
    this.comment = element.comment === '(null)' ? undefined : element.comment;
    this.name = element.name;
    this.value =
      !isEmpty(element.value) && element.value !== '0'
        ? element.value
        : undefined;
  }

  static fromElement(element) {
    return new Setting(element);
  }
}

export default Setting;
