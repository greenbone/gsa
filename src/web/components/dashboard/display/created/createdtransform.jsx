/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {formattedUserSettingShortDate} from 'web/utils/userSettingTimeDateFormatters';

import {parseInt, parseDate} from 'gmp/parser';

const transformCreated = (data = {}) => {
  const {groups = []} = data;
  return groups.map(group => {
    const {value, count, c_count} = group;
    const createdDate = parseDate(value);
    return {
      x: createdDate,
      label: formattedUserSettingShortDate(createdDate),
      y: parseInt(count),
      y2: parseInt(c_count),
    };
  });
};

export default transformCreated;

// vim: set ts=2 sw=2 tw=80:
