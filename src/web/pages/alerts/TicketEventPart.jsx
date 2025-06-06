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
import Radio from 'web/components/form/Radio';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const TicketEventPart = ({event, onEventChange}) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Radio
        checked={event === EVENT_TYPE_TICKET_RECEIVED}
        name="event"
        title={_('Ticket Received')}
        value={EVENT_TYPE_TICKET_RECEIVED}
        onChange={onEventChange}
      />
      <Radio
        checked={event === EVENT_TYPE_ASSIGNED_TICKET_CHANGED}
        name="event"
        title={_('Assigned Ticket Changed')}
        value={EVENT_TYPE_ASSIGNED_TICKET_CHANGED}
        onChange={onEventChange}
      />
      <Radio
        checked={event === EVENT_TYPE_OWNED_TICKET_CHANGED}
        name="event"
        title={_('Owned Ticket Changed')}
        value={EVENT_TYPE_OWNED_TICKET_CHANGED}
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
