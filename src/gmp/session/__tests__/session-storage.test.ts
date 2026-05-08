/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {setSessionValue} from 'gmp/session/session-storage';
import {createStorage} from 'gmp/testing';

describe('setSessionValue tests', () => {
  test('should set value if it is defined', () => {
    const storage = createStorage();
    setSessionValue(storage, 'testKey', 'testValue');

    expect(storage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  test('should remove value if it is undefined', () => {
    const storage = createStorage({testKey: 'testValue'});
    setSessionValue(storage, 'testKey', undefined);

    expect(storage.removeItem).toHaveBeenCalledWith('testKey');
    expect(storage.setItem).not.toHaveBeenCalledWith('testKey', 'testValue');
    expect(storage.getItem('testKey')).toBeNull();
  });
});
