/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {describe, test, expect} from '@gsa/testing';

import {RELEASE_VERSION} from '../version';

describe('Version tests', () => {
  test('release version should only contain major.minor', () => {
    expect(RELEASE_VERSION.split('.').length).toEqual(2);
  });
});
