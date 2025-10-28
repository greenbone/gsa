/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt, parseDate} from 'gmp/parser';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

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
