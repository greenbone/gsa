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
  type AlertData,
} from 'gmp/models/alert';
import {isDefined} from 'gmp/utils/identity';
import useTranslation, {type TranslateFunc} from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

interface EventProps {
  event?: AlertData;
}

const secInfoTypeName = (
  type: string | undefined,
  _: TranslateFunc,
  unknown: string,
) => {
  if (!isDefined(type)) {
    return unknown;
  }
  switch (type) {
    case 'cve':
      return _('CVE');
    case 'cpe':
      return _('CPE');
    case 'nvt':
      return _('NVT');
    case 'cert_bund_adv':
      return _('CERT-Bund Advisory');
    case 'dfn_cert_adv':
      return _('DFN-CERT Advisory');
    default:
      return type;
  }
};

const Event = ({event = {}}: EventProps) => {
  const [_] = useTranslation();
  if (!isDefined(event.type) || !isDefined(event.data)) {
    return null;
  }

  if (event.type === EVENT_TYPE_NEW_SECINFO) {
    const type = secInfoTypeName(
      event.data?.secinfo_type?.value as string | undefined,
      _,
      _('SecInfo'),
    );
    return _('New {{secinfo_type}} arrived', {secinfo_type: type});
  }

  if (event.type === EVENT_TYPE_UPDATED_SECINFO) {
    const type = secInfoTypeName(
      event.data?.secinfo_type?.value as string | undefined,
      _,
      _('SecInfo'),
    );
    return _('Updated {{secinfo_type}} arrived', {secinfo_type: type});
  }

  if (event.type === EVENT_TYPE_TASK_RUN_STATUS_CHANGED) {
    return isDefined(event.data.status)
      ? _('Task run status changed to {{status}}', {
          status: event.data.status.value as string,
        })
      : _('Task run status changed');
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
