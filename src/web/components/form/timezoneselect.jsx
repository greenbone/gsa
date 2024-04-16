/* Copyright (C) 2016-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useMemo} from 'react';

import {map} from 'gmp/utils/array';

import timezones from 'gmp/timezones';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

import Select from './select';

const TimeZoneSelectComponent = ({value = 'UTC', ...props}) => {
  const [_] = useTranslation();
  const timezoneItems = useMemo(
    () => [
      {
        label: _('Coordinated Universal Time/UTC'),
        value: 'UTC',
      },
      ...map(timezones, ({name}) => ({
        label: name,
        value: name,
      })),
    ],
    [_],
  );

  return <Select {...props} items={timezoneItems} value={value} />;
};

TimeZoneSelectComponent.propTypes = {
  value: PropTypes.string,
};

export default TimeZoneSelectComponent;

// vim: set ts=2 sw=2 tw=80:
