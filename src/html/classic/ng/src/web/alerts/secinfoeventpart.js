/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {translate as _} from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';

import Select2 from '../form/select2.js';
import Radio from '../form/radio.js';
import RadioSelectFormPart from '../form/radioselectformpart.js';

const VALUE = 'New SecInfo arrived';

export class SecinfoEventPart extends RadioSelectFormPart {

  constructor(props) {
    super(props, 'event_data');
  }

  defaultState() {
    let {data = {}} = this.props;

    return {
      feed_event: is_defined(data.feed_event) ? data.feed_event : 'new',
      secinfo_type: is_defined(data.secinfo_type) ? data.secinfo_type : 'nvt',
    };
  }

  render() {
    let {feed_event, secinfo_type} = this.state;
    let {value} = this.props;
    return (
      <Layout flex box>
        <Radio
          name="event"
          value={VALUE}
          checked={value === VALUE}
          onChange={this.onCheckedChange}>
        </Radio>
        <Select2
          value={feed_event}
          name="feed_event"
          onChange={this.onValueChange}>
          <option value="new">{_('New')}</option>
          <option value="updated">{_('Updated')}</option>
        </Select2>
        <Select2
          value={secinfo_type}
          name="secinfo_type"
          onChange={this.onValueChange}>
          <option value="nvt">{_('NVTs')}</option>
          <option value="cve">{_('CVEs')}</option>
          <option value="cpe">{_('CPEs')}</option>
          <option value="cert_bund_adv">
            {_('CERT-Bund Advisories')}
          </option>
          <option value="dfn_cert_adv">
            {_('DFN-CERT Advisories')}
          </option>
          <option value="ovaldef">{_('OVAL Definition')}</option>
        </Select2>
      </Layout>
    );
  }
}

export default SecinfoEventPart;

// vim: set ts=2 sw=2 tw=80:
