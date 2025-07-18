/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isEmpty} from 'gmp/utils/string';

export interface SettingElement {
  _id: string;
  comment?: string;
  name: string;
  value?: string | number;
}

class Setting {
  readonly id: string;
  readonly comment?: string;
  readonly name: string;
  readonly value?: string | number;

  constructor(element: SettingElement) {
    this.id = element._id;
    this.comment = element.comment === '(null)' ? undefined : element.comment;
    this.name = element.name;
    this.value =
      !isEmpty(element.value) && element.value !== '0'
        ? element.value
        : undefined;
  }

  static fromElement(element: SettingElement): Setting {
    return new Setting(element);
  }
}

export default Setting;
