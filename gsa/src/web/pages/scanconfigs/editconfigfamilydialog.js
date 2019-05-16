/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import SeverityBar from 'web/components/bar/severitybar';

import SaveDialog from 'web/components/dialog/savedialog';

import Checkbox from 'web/components/form/checkbox';

import EditIcon from 'web/components/icon/editicon';

import Layout from 'web/components/layout/layout';

import Section from 'web/components/section/section';

import SortBy from 'web/components/sortby/sortby';

import SimpleTable from 'web/components/table/simpletable';
import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import {makeCompareSeverity, makeCompareString} from 'web/utils/sort';

class Nvt extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      this.props.selected !== nextProps.selected ||
      this.props.nvt !== nextProps.nvt
    );
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

    const {name, oid, severity, timeout, default_timeout} = nvt;
    return (
      <TableRow>
        <TableData>{name}</TableData>
        <TableData>{oid}</TableData>
        <TableData>
          <SeverityBar severity={severity} />
        </TableData>
        <TableData>
          {isEmpty(timeout) ? _('default') : timeout}
          {isEmpty(default_timeout) ? '' : ' (' + default_timeout + ')'}
        </TableData>
        <TableData>{pref_count}</TableData>
        <TableData align="center">
          {/* wrap in span to allow centering */}
          <div>
            <Checkbox
              checked={selected === YES_VALUE}
              name={oid}
              checkedValue={YES_VALUE}
              unCheckedValue={NO_VALUE}
              onChange={onSelectedChange}
            />
          </div>
        </TableData>
        <TableData align={['center', 'center']}>
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

const sortFunctions = {
  name: makeCompareString('name'),
  oid: makeCompareString('oid'),
  severity: makeCompareSeverity(),
  timeout: makeCompareString('timeout'),
};

const sortNvts = ({nvts = [], sortBy, sortReverse, selected}) => {
  if (sortBy === 'selected') {
    return [...nvts].sort((a, b) => {
      if (selected[a.oid] && !selected[b.oid]) {
        return sortReverse ? 1 : -1;
      }
      if (selected[b.oid] && !selected[a.oid]) {
        return sortReverse ? -1 : 1;
      }

      let {name: aname = ''} = a;
      let {name: bname = ''} = b;
      aname = aname.toLowerCase();
      bname = bname.toLowerCase();

      if (aname > bname) {
        return sortReverse ? -1 : 1;
      }
      if (bname > aname) {
        return sortReverse ? 1 : -1;
      }
      return 0;
    });
  }

  const compareFunc = sortFunctions[sortBy];

  if (!isDefined(compareFunc)) {
    return nvts;
  }

  const compare = compareFunc(sortReverse);
  return [...nvts].sort(compare);
};

class EditDialogComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      sortBy: 'name',
      sortReverse: false,
      selected: {...this.props.selected},
    };

    this.handleSelectedChange = this.handleSelectedChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  handleSelectedChange(value, name) {
    const {selected} = this.props;

    selected[name] = value;

    this.setState({selected});
  }

  handleSortChange(sortBy) {
    this.setState(({sortBy: prevSortBy, sortReverse: prevSortReverse}) => ({
      sortBy,
      sortReverse: prevSortBy === sortBy ? !prevSortReverse : false,
    }));
  }

  render() {
    const {sortBy, sortReverse, selected} = this.state;
    const {
      config,
      config_name,
      family_name,
      id,
      title,
      onClose,
      onEditNvtDetailsClick,
      onSave,
    } = this.props;

    const data = {
      config,
      config_name,
      family_name,
      id,
      selected,
    };

    const sortDir = sortReverse ? SortBy.DESC : SortBy.ASC;

    const nvts = sortNvts({
      nvts: this.props.nvts,
      sortBy,
      sortReverse,
      selected,
    });

    return (
      <SaveDialog title={title} onClose={onClose} onSave={onSave} values={data}>
        {() => (
          <Layout flex="column">
            <SimpleTable>
              <TableBody>
                <TableRow>
                  <TableData>{_('Config')}</TableData>
                  <TableData>{config_name}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Family')}</TableData>
                  <TableData>{family_name}</TableData>
                </TableRow>
              </TableBody>
            </SimpleTable>

            <Section title={_('Edit Network Vulnerability Tests')}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="name"
                      onSortChange={this.handleSortChange}
                      title={_('Name')}
                    />
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="oid"
                      onSortChange={this.handleSortChange}
                      title={_('OID')}
                    />
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="severity"
                      onSortChange={this.handleSortChange}
                      title={_('Severity')}
                    />
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="timeout"
                      onSortChange={this.handleSortChange}
                      title={_('Timeout')}
                    />
                    <TableHead>{_('Prefs')}</TableHead>
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="selected"
                      onSortChange={this.handleSortChange}
                      align="center"
                      title={_('Selected')}
                    />
                    <TableHead align="center">{_('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nvts.map(nvt => {
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
                  })}
                </TableBody>
              </Table>
            </Section>
          </Layout>
        )}
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
  onClose: PropTypes.func.isRequired,
  onEditNvtDetailsClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default EditDialogComponent;

// vim: set ts=2 sw=2 tw=80:
