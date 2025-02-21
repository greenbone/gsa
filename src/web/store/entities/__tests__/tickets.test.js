/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as tickets from 'web/store/entities/tickets';
import {testAll} from 'web/store/entities/utils/testing';

testAll('ticket', tickets);
