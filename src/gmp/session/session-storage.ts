/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

interface SessionStorage {
  setItem(name: string, value: string): void;
  getItem(name: string): string | null;
  removeItem(name: string): void;
}

export const setSessionValue = (
  storage: SessionStorage,
  name: string,
  value: string | undefined,
) => {
  if (isDefined(value)) {
    storage.setItem(name, value);
  } else {
    storage.removeItem(name);
  }
};

export default SessionStorage;
