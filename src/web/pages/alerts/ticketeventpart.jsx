/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {
  EVENT_TYPE_TICKET_RECEIVED,
  EVENT_TYPE_OWNED_TICKET_CHANGED,
  EVENT_TYPE_ASSIGNED_TICKET_CHANGED,
} from 'gmp/models/alert';

import Radio from 'web/components/form/radio';

import Row from 'web/components/layout/row';

import PropTypes from 'web/utils/proptypes';
import useTranslation from 'web/hooks/useTranslation';

const TicketEventPart = ({event, onEventChange}) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Radio
        title={_('Ticket Received')}
        name="event"
        value={EVENT_TYPE_TICKET_RECEIVED}
        checked={event === EVENT_TYPE_TICKET_RECEIVED}
        onChange={onEventChange}
      />
      <Radio
        title={_('Assigned Ticket Changed')}
        name="event"
        value={EVENT_TYPE_ASSIGNED_TICKET_CHANGED}
        checked={event === EVENT_TYPE_ASSIGNED_TICKET_CHANGED}
        onChange={onEventChange}
      />
      <Radio
        title={_('Owned Ticket Changed')}
        name="event"
        value={EVENT_TYPE_OWNED_TICKET_CHANGED}
        checked={event === EVENT_TYPE_OWNED_TICKET_CHANGED}
        onChange={onEventChange}
      />
    </Row>
  );
};

TicketEventPart.propTypes = {
  event: PropTypes.string.isRequired,
  onEventChange: PropTypes.func.isRequired,
};

export default TicketEventPart;

// vim: set ts=2 sw=2 tw=80:
