/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

export const filter_string = filter =>
  isDefined(filter) && isDefined(filter.toFilterString)
    ? filter.toFilterString()
    : '' + filter;
