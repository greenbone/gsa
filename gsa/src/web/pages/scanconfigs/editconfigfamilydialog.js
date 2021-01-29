/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useState, useEffect} from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import SeverityBar from 'web/components/bar/severitybar';

import SaveDialog from 'web/components/dialog/savedialog';

import Checkbox from 'web/components/form/checkbox';

import EditIcon from 'web/components/icon/editicon';

import Loading from 'web/components/loading/loading';

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

import PropTypes from 'web/utils/proptypes';
import {makeCompareSeverity, makeCompareString} from 'web/utils/sort';

class Nvt extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      this.props.selected !== nextProps.selected ||
      this.props.nvt !== nextProps.nvt
    );
  }

  render() {
    const {nvt, selected, onSelectedChange, onEditNvtDetailsClick} = this.props;

    let pref_count = nvt.preference_count;
    if (pref_count === '0') {
      pref_count = '';
    }

    const {name, oid, severity, timeout, defaultTimeout} = nvt;
    return (
      <TableRow>
        <TableData>{name}</TableData>
        <TableData>{oid}</TableData>
        <TableData>
          <SeverityBar severity={severity} />
        </TableData>
        <TableData>
          {isEmpty(timeout) ? _('default') : timeout}
          {isEmpty(defaultTimeout) ? '' : ' (' + defaultTimeout + ')'}
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
            value={nvt.oid}
            onClick={onEditNvtDetailsClick}
          />
        </TableData>
      </TableRow>
    );
  }
}

Nvt.propTypes = {
  nvt: PropTypes.object.isRequired,
  selected: PropTypes.yesno,
  onEditNvtDetailsClick: PropTypes.func,
  onSelectedChange: PropTypes.func,
};

const sortFunctions = {
  name: makeCompareString('name'),
  oid: makeCompareString('oid'),
  severity: makeCompareSeverity(),
  timeout: makeCompareString('timeout'),
};

const sortNvts = (nvts = [], sortBy, sortReverse, selected = {}) => {
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

const EditScanConfigFamilyDialog = ({
  configId,
  configName,
  configNameLabel,
  familyName,
  isLoadingFamily = true,
  nvts,
  selected,
  title,
  onClose,
  onEditNvtDetailsClick,
  onSave,
}) => {
  const [sortBy, setSortby] = useState('name');
  const [sortReverse, setSortReverse] = useState(false);
  const [selectedNvts, setSelectedNvts] = useState(selected);

  const handleSortChange = newSortBy => {
    setSortReverse(sortBy === newSortBy ? !sortReverse : false);
    setSortby(newSortBy);
  };

  const handleSelectedChange = (value, name) => {
    setSelectedNvts(prevSelectedNvts => ({
      ...prevSelectedNvts,
      [name]: value,
    }));
  };

  useEffect(() => {
    setSelectedNvts(selected);
  }, [selected]);

  const data = {
    familyName,
    configId,
    selected: selectedNvts,
  };

  const sortDir = sortReverse ? SortBy.DESC : SortBy.ASC;

  const sortedNvts = sortNvts(nvts, sortBy, sortReverse, selectedNvts);

  return (
    <SaveDialog title={title} onClose={onClose} onSave={onSave} values={data}>
      {() =>
        isLoadingFamily || !isDefined(selectedNvts) ? (
          <Loading />
        ) : (
          <Layout flex="column">
            <SimpleTable>
              <TableBody>
                <TableRow>
                  <TableData>{configNameLabel}</TableData>
                  <TableData>{configName}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Family')}</TableData>
                  <TableData>{familyName}</TableData>
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
                      onSortChange={handleSortChange}
                      title={_('Name')}
                    />
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="oid"
                      onSortChange={handleSortChange}
                      title={_('OID')}
                    />
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="severity"
                      onSortChange={handleSortChange}
                      title={_('Severity')}
                    />
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="timeout"
                      onSortChange={handleSortChange}
                      title={_('Timeout')}
                    />
                    <TableHead>{_('Prefs')}</TableHead>
                    <TableHead
                      currentSortBy={sortBy}
                      currentSortDir={sortDir}
                      sortBy="selected"
                      onSortChange={handleSortChange}
                      align="center"
                      title={_('Selected')}
                    />
                    <TableHead align="center">{_('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNvts.map(nvt => {
                    const {oid} = nvt;
                    return (
                      <Nvt
                        key={oid}
                        nvt={nvt}
                        selected={selectedNvts[oid]}
                        onSelectedChange={handleSelectedChange}
                        onEditNvtDetailsClick={onEditNvtDetailsClick}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </Section>
          </Layout>
        )
      }
    </SaveDialog>
  );
};

EditScanConfigFamilyDialog.propTypes = {
  configId: PropTypes.id,
  configName: PropTypes.string,
  configNameLabel: PropTypes.string.isRequired,
  familyName: PropTypes.string,
  isLoadingFamily: PropTypes.bool,
  nvts: PropTypes.array,
  selected: PropTypes.object,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onEditNvtDetailsClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default EditScanConfigFamilyDialog;

// vim: set ts=2 sw=2 tw=80:
