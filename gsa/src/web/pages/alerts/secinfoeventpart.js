/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import Divider from '../../components/layout/divider.js';

import PropTypes from '../../utils/proptypes.js';
import withPrefix from '../../utils/withPrefix.js';

import Select from '../../components/form/select.js';
import Radio from '../../components/form/radio.js';

const VALUE = 'New SecInfo arrived';

const SecinfoEventPart = ({
    event,
    feedEvent,
    prefix,
    secinfoType,
    onChange,
    onEventChange,
  }) => {
  return (
    <Divider>
      <Radio
        name="event"
        value={VALUE}
        checked={event === VALUE}
        onChange={onEventChange}
      >
      </Radio>
      <Select
        items={[{
          value: 'new',
          label: _('New'),
        }, {
          value: 'updated',
          label: _('Updated'),
        }]}
        value={feedEvent}
        name={prefix + 'feed_event'}
        onChange={onChange}
      />
      <Select
        items={[{
          value: 'nvt',
          label: _('NVTs'),
        }, {
          value: 'cve',
          label: _('CVEs'),
        }, {
          value: 'cpe',
          label: _('CPEs'),
        }, {
          value: 'cert_bund_adv',
          label: _('CERT-Bund Advisories'),
        }, {
          value: 'dfn_cert_adv',
          label: _('DFN-CERT Advisories'),
        }, {
          value: 'ovaldef',
          label: _('OVAL Definition'),
        }]}
        value={secinfoType}
        name={prefix + 'secinfo_type'}
        onChange={onChange}
      />
    </Divider>
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
