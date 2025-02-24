/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe} from '@gsa/testing';
import TaskIcon from 'web/components/icon/StartIcon';
import {testIcon} from 'web/components/icon/Testing';


describe('TaskIcon component tests', () => {
  testIcon(TaskIcon);
});
