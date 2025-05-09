/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

class Settings {
  private readonly _settings: Record<string, unknown>;

  constructor() {
    this._settings = {};
  }

  has(name: string) {
    return name in this._settings;
  }

  set(name: string, value: unknown) {
    this._settings[name] = value;
  }

  get(name: string) {
    const setting = this._settings[name];
    if (isDefined(setting)) {
      return setting;
    }
    return {};
  }

  getEntries() {
    return Object.entries(this._settings);
  }
}

export default Settings;
