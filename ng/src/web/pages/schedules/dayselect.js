/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import PropTyes from 'web/utils/proptypes';

import Select from 'web/components/form/select';

const DAY_SELECT_ITEMS = [{
  label: _('Monday'),
  value: 'monday',
}, {
  label: _('Tuesday'),
  value: 'tuesday',
}, {
  label: _('Wednesday'),
  value: 'wednesday',
}, {
  label: _('Thursday'),
  value: 'thursday',
}, {
  label: _('Friday'),
  value: 'friday',
}, {
  label: _('Saturday'),
  value: 'saturday',
}, {
  label: _('Sunday'),
  value: 'sunday',
}];

const DaySelect = ({
  value,
  ...props
}) => (
  <Select
    {...props}
    value={value}
    items={DAY_SELECT_ITEMS}
  />
);

DaySelect.propTypes = {
  value: PropTyes.oneOf([
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
