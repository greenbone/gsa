/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import useTranslation from 'web/hooks/useTranslation';

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
        name={name}
        value={status}
        onChange={onChange}
        items={[
          {label: _('Open'), value: 'Open'},
          {label: _('Fixed'), value: 'Fixed'},
          {label: _('Fix Verified'), value: '"Fix Verified"'}, // this is the way I found that has the filter returned as status="Fix Verified". All the single word terms are fine.
          {label: _('Closed'), value: 'Closed'},
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
