/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {EVENT_TYPE_NEW_SECINFO, isSecinfoEvent} from 'gmp/models/alert';

import Row from 'web/components/layout/row';

import Select from 'web/components/form/select';
import Radio from 'web/components/form/radio';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import useTranslation from 'web/hooks/useTranslation';

const SecinfoEventPart = ({
  event,
  feedEvent,
  prefix,
  secinfoType,
  onChange,
  onEventChange,
}) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Radio
        name="event"
        value={EVENT_TYPE_NEW_SECINFO}
        checked={event === EVENT_TYPE_NEW_SECINFO}
        onChange={onEventChange}
      />
      <Select
        grow="1"
        disabled={!isSecinfoEvent(event)}
        items={[
          {
            value: 'new',
            label: _('New'),
          },
          {
            value: 'updated',
            label: _('Updated'),
          },
        ]}
        value={feedEvent}
        name={prefix + 'feed_event'}
        onChange={onChange}
      />
      <Select
        grow="1"
        disabled={!isSecinfoEvent(event)}
        items={[
          {
            value: 'nvt',
            label: _('NVTs'),
          },
          {
            value: 'cve',
            label: _('CVEs'),
          },
          {
            value: 'cpe',
            label: _('CPEs'),
          },
          {
            value: 'cert_bund_adv',
            label: _('CERT-Bund Advisories'),
          },
          {
            value: 'dfn_cert_adv',
            label: _('DFN-CERT Advisories'),
          },
        ]}
        value={secinfoType}
        name={prefix + 'secinfo_type'}
        onChange={onChange}
      />
    </Row>
  );
};

SecinfoEventPart.propTypes = {
  event: PropTypes.string.isRequired,
  feedEvent: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  secinfoType: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onEventChange: PropTypes.func,
};

export default withPrefix(SecinfoEventPart);

// vim: set ts=2 sw=2 tw=80:
