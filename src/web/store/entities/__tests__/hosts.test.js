/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as host from 'web/store/entities/hosts';
import {testAll} from 'web/store/entities/utils/testing';

testAll('host', host);
