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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import withDialog from '../../components/dialog/withDialog.js';

import Radio from '../../components/form/radio.js';
import Text from '../../components/form/text.js';
import TextField from '../../components/form/textfield.js';

import Layout from '../../components/layout/layout.js';

import LegacyLink from '../../components/link/legacylink.js';

import SimpleTable from '../../components/table/simpletable.js';
import Table from '../../components/table/table.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import NvtPreference from './nvtpreference.js';

class EditDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.onPreferenceChange = this.onPreferenceChange.bind(this);
  }

  onPreferenceChange(value, name) {
    let {preference_values, onValueChange} = this.props;
    preference_values[name] = value;

    onValueChange(preference_values, 'preference_values');
  }

  render() {
    const {
      config,
      nvt,
      timeout,
      manual_timeout,
      preference_values,
      onValueChange,
    } = this.props;
    return (
      <Layout flex="column">
        <SimpleTable>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Name')}
              </TableData>
              <TableData>
                <LegacyLink
                  target="_blank"
                  cmd="get_config_nvt"
                  config_id={config.id}
                  name={config.name}
                  family={nvt.family}
                  oid={nvt.oid}
                >
                  {nvt.name}
                </LegacyLink>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Config')}
              </TableData>
              <TableData>
                {config.name}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Family')}
              </TableData>
              <TableData>
                {nvt.family}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('OID')}
              </TableData>
              <TableData>
                {nvt.oid}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Version')}
              </TableData>
              <TableData>
                {nvt.version}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Notes')}
              </TableData>
              <TableData>
                {nvt.notes_counts.length}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Overrides')}
              </TableData>
              <TableData>
                {nvt.overrides_counts.length}
              </TableData>
            </TableRow>
          </TableBody>
        </SimpleTable>

        {is_defined(nvt.tags.summary) &&
          <div>
            <h1>{_('Summary')}</h1>
            <p>
              {nvt.tags.summary}
            </p>
          </div>
        }

        {is_defined(nvt.tags.affected) &&
          <div>
            <h1>{_('Affected Software/OS')}</h1>
            <p>
              {nvt.tags.affected}
            </p>
          </div>
        }

        <div>
          <h1>{_('Vulnerability Scoring')}</h1>
          <SimpleTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('CVSS base')}
                </TableData>
                <TableData>
                  <SeverityBar severity={nvt.severity}/>
                </TableData>
              </TableRow>
              {is_defined(nvt.tags.cvss_base_vector) &&
                <TableRow>
                  <TableData>
                    {_('CVSS base vector')}
                  </TableData>
                  <TableData>
                    <LegacyLink
                      target="_blank"
                      cmd="cvss_calculator"
                      cvss_vector={nvt.tags.cvss_base_vector}
                    >
                      {nvt.tags.cvss_base_vector}
                    </LegacyLink>
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </SimpleTable>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Name')}
              </TableHead>
              <TableHead>
                {_('New Value')}
              </TableHead>
              <TableHead>
                {_('Default Value')}
              </TableHead>
              <TableHead>
                {_('Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Timeout')}
              </TableData>
              <TableData flex="column">
                <Layout flex box>
                  <Radio
                    value="0"
                    name="timeout"
                    checked={timeout === '0'}
                    onChange={onValueChange}
                  />
                  <Text>
                    {_('Apply default timeout')}
                    {
                      is_defined (nvt.default_timeout) ?
                          ' (' + nvt.default_timeout + ')' :
                          ''
                    }
                  </Text>
                </Layout>
                <Layout flex box>
                  <Radio
                    value="1"
                    name="timeout"
                    checked={timeout !== '0'}
                    onChange={onValueChange}
                  />
                  <TextField
                    disabled={timeout === '0'}
                    name="manual_timeout"
                    value={manual_timeout}
                    onChange={onValueChange}
                    maxLength="400"
                  />
                </Layout>
              </TableData>
              <TableData>
                {
                  is_defined (nvt.default_timeout) ?
                      nvt.default_timeout :
                      ''
                }
              </TableData>
              <TableData>
              </TableData>
            </TableRow>
            {
              nvt.preferences.map(pref => {
                const value = is_defined(preference_values[pref.name]) ?
                  preference_values[pref.name].value : undefined;
                return (
                  <NvtPreference
                    key={pref.name}
                    preference={pref}
                    value={value}
                    onChange={this.onPreferenceChange}
                  />
                );
              })
            }
          </TableBody>
        </Table>
      </Layout>
    );
  }
}

EditDialog.propTypes = {
  config: PropTypes.model.isRequired,
  nvt: PropTypes.object.isRequired,
  timeout: PropTypes.string.isRequired,
  manual_timeout: PropTypes.string.isRequired,
  preference_values: PropTypes.object.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default withDialog({
  footer: _('Save'),
  defaultState: {
    manual_timeout: '',
  },
})(EditDialog);

// vim: set ts=2 sw=2 tw=80:
