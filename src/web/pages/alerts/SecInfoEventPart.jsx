/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EVENT_TYPE_NEW_SECINFO, isSecinfoEvent} from 'gmp/models/alert';
import React from 'react';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import withPrefix from 'web/utils/withPrefix';

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
        checked={event === EVENT_TYPE_NEW_SECINFO}
        name="event"
        value={EVENT_TYPE_NEW_SECINFO}
        onChange={onEventChange}
      />
      <Select
        disabled={!isSecinfoEvent(event)}
        grow="1"
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
        name={prefix + 'feed_event'}
        value={feedEvent}
        onChange={onChange}
      />
      <Select
        disabled={!isSecinfoEvent(event)}
        grow="1"
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
        name={prefix + 'secinfo_type'}
        value={secinfoType}
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
