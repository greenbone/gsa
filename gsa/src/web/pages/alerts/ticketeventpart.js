/* Copyright (C) 2019 Greenbone Networks GmbH
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
import React from 'react';

import {_} from 'gmp/locale/lang';

import {
  EVENT_TYPE_TICKET_RECEIVED,
  EVENT_TYPE_OWNED_TICKET_CHANGED,
  EVENT_TYPE_ASSIGNED_TICKET_CHANGED,
} from 'gmp/models/alert';

import Radio from 'web/components/form/radio';

import PropTypes from 'web/utils/proptypes';
import Divider from 'web/components/layout/divider';

const TicketEventPart = ({event, onEventChange}) => (
  <Divider>
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
  </Divider>
);

TicketEventPart.propTypes = {
  event: PropTypes.string.isRequired,
  onEventChange: PropTypes.func.isRequired,
};

export default TicketEventPart;

// vim: set ts=2 sw=2 tw=80:
