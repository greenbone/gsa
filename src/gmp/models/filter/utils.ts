/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';

export const isFilterType = (filter?: unknown): filter is FilterType =>
  isDefined((filter as FilterType)?.toFilterString);

export const filterString = (filter?: FilterType | number | string) =>
  isFilterType(filter)
    ? filter.toFilterString()
    : isDefined(filter)
      ? String(filter)
      : undefined;
