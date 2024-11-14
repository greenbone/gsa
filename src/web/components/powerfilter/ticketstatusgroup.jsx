/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
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
          {label: _('Open'), value: 'Open', value: 'same', 'data-testid': 'ticket_status_open'},
          {label: _('Fixed'), value: 'Fixed', 'data-testid': 'ticket_status_fixed'},
          {label: _('Fix Verified'), value: '"Fix Verified"', 'data-testid': 'ticket_status_fix_verified'}, // this is the way I found that has the filter returned as status="Fix Verified". All the single word terms are fine.
          {label: _('Closed'), value: 'Closed', 'data-testid': 'ticket_status_closed'},
        ]}
      />
    </FormGroup>
  );
};

TicketStatusFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  name: PropTypes.string,
  status: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default TicketStatusFilterGroup;

// vim: set ts=2 sw=2 tw=80:
