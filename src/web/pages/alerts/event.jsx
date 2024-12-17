/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EVENT_TYPE_UPDATED_SECINFO,
  EVENT_TYPE_NEW_SECINFO,
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  EVENT_TYPE_TICKET_RECEIVED,
  EVENT_TYPE_ASSIGNED_TICKET_CHANGED,
  EVENT_TYPE_OWNED_TICKET_CHANGED,
} from 'gmp/models/alert';
import {secInfoTypeName} from 'gmp/models/secinfo';
import {isDefined} from 'gmp/utils/identity';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

const Event = ({event = {}}) => {
  const [_] = useTranslation();
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

Event.propTypes = {
  event: PropTypes.object,
};

export default Event;

// vim: set ts=2 sw=2 tw=80:
