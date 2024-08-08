/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';

import {testIcon} from 'web/components/icon/testing';

import TaskIcon from '../starticon';

describe('TaskIcon component tests', () => {
  testIcon(TaskIcon);
});

// vim: set ts=2 sw=2 tw=80:
