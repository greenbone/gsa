/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {isDefined} from '../../utils/identity';

export const filter_string = filter =>
  isDefined(filter) && isDefined(filter.toFilterString)
    ? filter.toFilterString()
    : '' + filter;

// vim: set ts=2 sw=2 tw=80:
