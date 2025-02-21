/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as tasks from 'web/store/entities/tasks';
import {testAll} from 'web/store/entities/utils/testing';

testAll('task', tasks);
