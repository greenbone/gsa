/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {map, is_empty} from 'gmp/utils';
import {YES_VALUE, NO_VALUE} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import Checkbox from '../../components/form/checkbox.js';

import EditIcon from '../../components/icon/editicon.js';

import Layout from '../../components/layout/layout.js';

import Section from '../../components/section/section.js';

import SimpleTable from '../../components/table/simpletable.js';
import Table from '../../components/table/table.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

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
      default_timeout,
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
          {is_empty(default_timeout) ?
            '' : ' (' + default_timeout + ')'
          }
        </TableData>
        <TableData>
          {pref_count}
        </TableData>
        <TableData flex align="center">
          <Checkbox
            checked={selected === YES_VALUE}
            name={oid}
            checkedValue={YES_VALUE}
            unCheckedValue={NO_VALUE}
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
    const {selected} = this.props;

    selected[name] = value;

    this.setState({selected});
  }

  render() {
    const {
      config,
      config_name,
      family_name,
      id,
      nvts,
      selected,
      title,
      visible = true,
      onClose,
      onEditNvtDetailsClick,
      onSave,
    } = this.props;

    const data = {
      config,
      config_name,
      family_name,
      id,
      nvts,
      selected,
    };

    return (
      <SaveDialog
        visible={visible}
        title={title}
        onClose={onClose}
        onSave={onSave}
        defaultData={data}
      >
        {({
          values: state,
          onValueChange,
        }) => {

          return (
            <Layout flex="column">
              <SimpleTable>
                <TableBody>
                  <TableRow>
                    <TableData>
                      {_('Config')}
                    </TableData>
                    <TableData>
                      {state.name}
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      {_('Family')}
                    </TableData>
                    <TableData>
                      {state.family}
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
                        const {oid} = nvt;
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
        }}
      </SaveDialog>
    );
  }
}

EditDialogComponent.propTypes = {
  config: PropTypes.model.isRequired,
  config_name: PropTypes.string,
  family_name: PropTypes.string,
  id: PropTypes.string,
  nvts: PropTypes.array.isRequired,
  selected: PropTypes.object.isRequired,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onEditNvtDetailsClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default EditDialogComponent;

// vim: set ts=2 sw=2 tw=80:
