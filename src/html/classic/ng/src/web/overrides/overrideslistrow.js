/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';
import {shorten, is_defined} from '../../utils.js';

import Layout from '../layout.js';
import LegacyLink from '../legacylink.js';
import {result_cvss_risk_factor} from '../render.js';
import SeverityBar from '../severitybar.js';

import EntityListRow from '../entities/listrow.js';

import OverrideDialog from './dialog.js';

export class OverridesListRow extends EntityListRow {

  constructor(props) {
    super('override', props);

    this.state = {
      override: this.props.override,
    };
  }

  renderEditDialog() {
    let override = this.getEntity();
    return (
      <OverrideDialog override={override}
        ref={ref => this.edit_dialog = ref}
        title={_('Edit override {{override}}',
          {override: shorten(override.text)})}
        onSave={this.onSave}/>
    );
  }

  renderSeverity(severity) {
    if (is_defined(severity)) {
      if (severity <= 0) {
        return _(result_cvss_risk_factor(severity));
      }
      return '> ' + (severity - 0.1).toFixed(1);
    }
    return _('Any');
  }

  render() {
    let override = this.getEntity();
    return (
      <tr>
        <td>
          <LegacyLink cmd="get_override" override_id={override.id}
            title={override.text}>
            {shorten(override.text)}
          </LegacyLink>
        </td>
        <td>
          {override.nvt ? override.nvt.name : ""}
        </td>
        <td title={override.hosts}>
          {shorten(override.hosts)}
        </td>
        <td title={override.port}>
          {shorten(override.port)}
        </td>
        <td>
          {this.renderSeverity(override.severity)}
        </td>
        <td>
          <Layout flex align={['center', 'center']}>
            <SeverityBar severity={override.new_severity}/>
          </Layout>
        </td>
        <td>
          {override.isActive() ? _('yes') : _('no')}
        </td>
        {this.renderTableActions()}
      </tr>
    );
  }
}

OverridesListRow.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

OverridesListRow.propTypes = {
  override: React.PropTypes.object.isRequired,
};

export default OverridesListRow;

// vim: set ts=2 sw=2 tw=80:
