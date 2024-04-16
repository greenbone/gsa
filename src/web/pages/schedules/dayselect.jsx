/* Copyright (C) 2018-2022 Greenbone AG
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
import React from 'react';

import PropTypes from 'web/utils/proptypes';

import Select from 'web/components/form/select';

import useTranslation from 'web/hooks/useTranslation';

const DaySelect = ({value, ...props}) => {
  const [_] = useTranslation();

  const DAY_SELECT_ITEMS = [
    {
      label: _('Monday'),
      value: 'monday',
    },
    {
      label: _('Tuesday'),
      value: 'tuesday',
    },
    {
      label: _('Wednesday'),
      value: 'wednesday',
    },
    {
      label: _('Thursday'),
      value: 'thursday',
    },
    {
      label: _('Friday'),
      value: 'friday',
    },
    {
      label: _('Saturday'),
      value: 'saturday',
    },
    {
      label: _('Sunday'),
      value: 'sunday',
    },
  ];
  return <Select {...props} value={value} items={DAY_SELECT_ITEMS} />;
};

DaySelect.propTypes = {
  value: PropTypes.oneOf([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
};

export default DaySelect;

// vim: set ts=2 sw=2 tw=80:
