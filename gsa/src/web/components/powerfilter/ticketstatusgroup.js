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

import PropTypes from '../../utils/proptypes.js';

import Checkbox from '../form/checkbox.js';
import FormGroup from '../form/formgroup.js';

import IconDivider from '../layout/icondivider.js';

import TicketStatusLabels from 'web/components/label/ticketstatus';

class TicketStatusFilterGroup extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  handleStatusChange(value, stat) {
    const {filter, onChange} = this.props;
    let status = filter.get('status');

    if (!status) {
      status = '';
    }

    if (value && !status.includes(stat)) {
      status += stat;
      onChange(status, 'status');
    } else if (!value && status.includes(stat)) {
      status = status.replace(stat, '');
      onChange(status, 'status');
    }
  }

  render() {
    const {filter} = this.props;

    let status = filter.get('status');

    if (!isDefined(status)) {
      status = '';
    }
    return (
      <FormGroup title={_('Ticket Status')}>
        <IconDivider>
          <Checkbox
            checked={status.includes('open')}
            name="open"
            onChange={this.handleLevelChange}
          >
            <TicketStatusLabels.Open />
          </Checkbox>
          <Checkbox
            checked={status.includes('fixed')}
            name="fixed"
            onChange={this.handleLevelChange}
          >
            <TicketStatusLabels.Fixed />
          </Checkbox>
          <Checkbox
            checked={status.includes('verified')}
            name="verified"
            onChange={this.handleLevelChange}
          >
            <TicketStatusLabels.FixVerified />
          </Checkbox>
          <Checkbox
            checked={status.includes('closed')}
            name="closed"
            onChange={this.handleLevelChange}
          >
            <TicketStatusLabels.Closed />
          </Checkbox>
        </IconDivider>
      </FormGroup>
    );
  }
}

TicketStatusFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TicketStatusFilterGroup;

// vim: set ts=2 sw=2 tw=80:
