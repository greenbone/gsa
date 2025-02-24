/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as schedule from 'web/store/entities/schedules';
import {testAll} from 'web/store/entities/utils/testing';

testAll('schedule', schedule);
