/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {TICKET_STATUS, TicketStatus} from 'gmp/models/ticket';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';

interface TicketStatusFilterGroupProps {
  status?: TicketStatus;
  filter?: Filter;
  name?: string;
  onChange: (value: TicketStatus, name: string) => void;
}

const TicketStatusFilterGroup = ({
  status,
  filter,
  name = 'status',
  onChange,
}: TicketStatusFilterGroupProps) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    status = filter.get('status') as TicketStatus | undefined;
  }

  return (
    <FormGroup title={_('Ticket Status')}>
      <Select
        data-testid="filter-status"
        items={[
          {label: _('Open'), value: TICKET_STATUS.open},
          {label: _('Fixed'), value: TICKET_STATUS.fixed},
          {label: _('Fix Verified'), value: `"${TICKET_STATUS.verified}"`},
          {label: _('Closed'), value: TICKET_STATUS.closed},
        ]}
        name={name}
        value={status}
        onChange={
          onChange as ((value: string, name?: string) => void) | undefined
        }
      />
    </FormGroup>
  );
};

export default TicketStatusFilterGroup;
