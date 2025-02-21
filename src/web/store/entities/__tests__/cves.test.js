/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as cve from 'web/store/entities/cves';
import {testAll} from 'web/store/entities/utils/testing';

testAll('cve', cve);
