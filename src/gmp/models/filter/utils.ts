/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';

export const isFilter = (filter?: Filter | string | number): filter is Filter =>
  isDefined((filter as Filter)?.toFilterString);

export const filterString = (filter?: Filter | number | string) =>
  isFilter(filter) ? filter.toFilterString() : String(filter);
