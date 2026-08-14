/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import {parseInt, parseDate, type NumberReturn} from 'gmp/parser';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

interface CreatedDataGroup {
  value: string;
  count: string;
  c_count: string;
}

interface CreatedData {
  groups?: CreatedDataGroup[];
}

interface CreatedDataPoint {
  label: string;
  x: Date;
  y: NumberReturn;
  y2: NumberReturn;
}

const transformCreated = (data: CreatedData = {}): CreatedDataPoint[] => {
  const {groups = []} = data;
  return groups.map(group => {
    const {value, count, c_count} = group;
    const createdDate = parseDate(value) as Date;
    return {
      label: formattedUserSettingShortDate(createdDate) as string,
      x: createdDate,
      y: parseInt(count),
      y2: parseInt(c_count),
    };
  });
};

export default transformCreated;
