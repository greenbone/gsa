/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';

export const filterString = (filter?: Filter | number | string) =>
  isDefined(filter) && filter instanceof Filter
    ? filter.toFilterString()
    : '' + filter;
