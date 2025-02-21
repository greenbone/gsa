/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as audits from 'web/store/entities/audits';
import {testAll} from 'web/store/entities/utils/testing';

testAll('audit', audits);
