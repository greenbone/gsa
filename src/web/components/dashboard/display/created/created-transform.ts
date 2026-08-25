/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import {parseInt, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {type LineData} from 'web/components/chart/LineChart';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

export interface CreatedDataGroup {
  value: string;
  count: string;
  c_count: string;
}

export interface CreatedData {
  groups?: CreatedDataGroup[];
}

export interface CreatedDataPoint extends LineData {
  x: Date;
}

const transformCreated = (data: CreatedData = {}): CreatedDataPoint[] => {
  const {groups = []} = data;
  return groups
    .map(group => {
      const {value, count, c_count} = group;
      const createdDate = parseDate(value);
      return {
        label: formattedUserSettingShortDate(createdDate) as string,
        x: createdDate,
        y: parseInt(count),
        y2: parseInt(c_count),
      };
    })
    .filter(
      ({x, y, y2}) => isDefined(x) && isDefined(y) && isDefined(y2),
    ) as CreatedDataPoint[];
};

export default transformCreated;
