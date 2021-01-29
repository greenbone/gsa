/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {secInfoTypeName} from 'gmp/models/secinfo';
import {
  EVENT_TYPE_UPDATED_SECINFO,
  EVENT_TYPE_NEW_SECINFO,
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  EVENT_TYPE_TICKET_RECEIVED,
  EVENT_TYPE_ASSIGNED_TICKET_CHANGED,
  EVENT_TYPE_OWNED_TICKET_CHANGED,
} from 'gmp/models/alert';

const Event = ({event = {}}) => {
  if (!isDefined(event.type) || !isDefined(event.data)) {
    return null;
  }

  let type = _('undefined');

  if (event.type === EVENT_TYPE_NEW_SECINFO) {
    if (isDefined(event.data.secinfo_type)) {
      type = secInfoTypeName(event.data.secinfo_type.value, _('SecInfo'));
    }
    return _('New {{secinfo_type}} arrived', {secinfo_type: type});
  }

  if (event.type === EVENT_TYPE_UPDATED_SECINFO) {
    if (isDefined(event.data.secinfo_type)) {
      type = secInfoTypeName(event.data.secinfo_type.value, _('SecInfo'));
    }
    return _('Updated {{secinfo_type}} arrived', {secinfo_type: type});
  }

  if (
    event.type === EVENT_TYPE_TASK_RUN_STATUS_CHANGED &&
    isDefined(event.data.status)
  ) {
    return _('Task run status changed to {{status}}', {
      status: event.data.status.value,
    });
  }
  if (event.type === EVENT_TYPE_TICKET_RECEIVED) {
    return _('Ticket received');
  }
  if (event.type === EVENT_TYPE_ASSIGNED_TICKET_CHANGED) {
    return _('Assigned Ticket changed');
  }
  if (event.type === EVENT_TYPE_OWNED_TICKET_CHANGED) {
    return _('Owned Ticket changed');
  }
  return event.type;
};

export default Event;

// vim: set ts=2 sw=2 tw=80:
