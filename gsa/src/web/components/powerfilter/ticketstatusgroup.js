/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import 'core-js/fn/string/includes';

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes.js';

import FormGroup from 'web/components/form/formgroup.js';

import Select from 'web/components/form/select';

const TicketStatusFilterGroup = ({
  status,
  filter,
  name = 'status',
  onChange,
}) => {
  if (isDefined(filter)) {
    status = filter.get('status');
  }

  return (
    <FormGroup title={_('Ticket Status')}>
      <Select
        name={name}
        value={status}
        onChange={onChange}
        items={[
          {label: _('Open'), value: '0'},
          {label: _('Fixed'), value: '1'},
          {label: _('Fix Verified'), value: '2'},
          {label: _('Closed'), value: '3'},
        ]}
      />
    </FormGroup>
  );
};

TicketStatusFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  name: PropTypes.string,
  status: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default TicketStatusFilterGroup;

// vim: set ts=2 sw=2 tw=80:
