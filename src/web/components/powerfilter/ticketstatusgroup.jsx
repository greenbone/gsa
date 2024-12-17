/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

const TicketStatusFilterGroup = ({
  status,
  filter,
  name = 'status',
  onChange,
}) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    status = filter.get('status');
  }

  return (
    <FormGroup title={_('Ticket Status')}>
      <Select
        data-testid="filter-status"
        items={[
          {label: _('Open'), value: 'Open'},
          {label: _('Fixed'), value: 'Fixed'},
          {label: _('Fix Verified'), value: '"Fix Verified"'}, // this is the way I found that has the filter returned as status="Fix Verified". All the single word terms are fine.
          {label: _('Closed'), value: 'Closed'},
        ]}
        name={name}
        value={status}
        onChange={onChange}
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
