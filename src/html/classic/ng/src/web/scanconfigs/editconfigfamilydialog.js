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
import {map, is_empty} from '../../utils.js';

import PropTypes from '../proptypes.js';
import Section from '../section.js';
import SeverityBar from '../severitybar.js';

import {withDialog} from '../components/dialog/dialog.js';

import Checkbox from '../components/form/checkbox.js';

import EditIcon from '../components/icon/editicon.js';

import Layout from '../components/layout/layout.js';

import SimpleTable from '../table/simple.js';
import Table from '../table/table.js';
import TableBody from '../table/body.js';
import TableData from '../table/data.js';
import TableHeader from '../table/header.js';
import TableHead from '../table/head.js';
import TableRow from '../table/row.js';

class Nvt extends React.Component {

  shouldComponentUpdate(nextProps) {
    return this.props.selected !== nextProps.selected ||
      this.props.nvt !== nextProps.nvt;
  }

  render() {
    const {
      config,
      nvt,
      selected,
      onSelectedChange,
      onEditNvtDetailsClick,
    } = this.props;

    let pref_count = nvt.preference_count;
    if (pref_count === '0') {
      pref_count = '';
    }

    const {
      name,
      oid,
      severity,
      timeout,
    } = nvt;
    return (
      <TableRow>
        <TableData>
          {name}
        </TableData>
        <TableData>
          {oid}
        </TableData>
        <TableData>
          <SeverityBar
            severity={severity}
          />
        </TableData>
        <TableData>
          {is_empty(timeout) ?
              _('default') :
              timeout
          }
        </TableData>
        <TableData>
          {pref_count}
        </TableData>
        <TableData flex align="center">
          <Checkbox
            checked={selected === '1'}
            name={oid}
            checkedValue="1"
            unCheckedValue="0"
            onChange={onSelectedChange}
          />
        </TableData>
        <TableData flex align="center">
          <EditIcon
            title={_('Select and edit NVT details')}
            value={{config, nvt}}
            onClick={onEditNvtDetailsClick}
          />
        </TableData>
      </TableRow>
    );
  }
}

Nvt.propTypes = {
  config: PropTypes.model.isRequired,
  nvt: PropTypes.object.isRequired,
  selected: PropTypes.yesno.isRequired,
  onEditNvtDetailsClick: PropTypes.func,
  onSelectedChange: PropTypes.func,
};

class EditDialogComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSelectedChange = this.handleSelectedChange.bind(this);
  }

  handleSelectedChange(value, name) {
    const {selected, onValueChange} = this.props;

    selected[name] = value;

    onValueChange(selected, 'selected');
  }

  render() {
    const {
      config,
      nvts,
      selected,
      onEditNvtDetailsClick,
    } = this.props;
    return (
      <Layout flex="column">
        <SimpleTable>
          <TableBody>
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
                {config.family}
              </TableData>
            </TableRow>
          </TableBody>
        </SimpleTable>

        <Section title={_('Edit Network Vulnerability Tests')}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Name')}
                </TableHead>
                <TableHead>
                  {_('OID')}
                </TableHead>
                <TableHead>
                  {_('Severity')}
                </TableHead>
                <TableHead>
                  {_('Timeout')}
                </TableHead>
                <TableHead>
                  {_('Prefs')}
                </TableHead>
                <TableHead>
                  {_('Selected')}
                </TableHead>
                <TableHead>
                  {_('Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                map(nvts, nvt => {
                  let {oid} = nvt;
                  return (
                    <Nvt
                      key={oid}
                      nvt={nvt}
                      config={config}
                      selected={selected[oid]}
                      onSelectedChange={this.handleSelectedChange}
                      onEditNvtDetailsClick={onEditNvtDetailsClick}
                    />
                  );
                })
              }
            </TableBody>
          </Table>
        </Section>
      </Layout>
    );
  }
}

EditDialogComponent.propTypes = {
  config: PropTypes.model.isRequired,
  nvts: PropTypes.arrayLike.isRequired,
  selected: PropTypes.object.isRequired,
  onEditNvtDetailsClick: PropTypes.func,
  onValueChange: PropTypes.func,
};

export default withDialog(EditDialogComponent, {
  footer: _('Save'),
  defaultState: {
  },
});

// vim: set ts=2 sw=2 tw=80:
