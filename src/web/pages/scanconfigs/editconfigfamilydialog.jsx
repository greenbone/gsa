/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useEffect} from 'react';

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import {makeCompareSeverity, makeCompareString} from 'web/utils/sort';

import SeverityBar from 'web/components/bar/severitybar';

import SaveDialog from 'web/components/dialog/savedialog';

import Checkbox from 'web/components/form/checkbox';

import EditIcon from 'web/components/icon/editicon';

import Loading from 'web/components/loading/loading';

import Section from 'web/components/section/section';

import SortBy from 'web/components/sortby/sortby';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import useTranslation from 'web/hooks/useTranslation';

const EDIT_CONFIG_COLUMNS_SORT = {
  name: 'name',
  oid: 'oid',
  severity: 'severity',
  timeout: 'timeout',
  selected: 'selected',
};

const Nvt = React.memo(
  ({nvt, selected, onSelectedChange, onEditNvtDetailsClick}) => {
    const [_] = useTranslation();

    const {name, oid, severity, timeout, defaultTimeout, preference_count} =
      nvt;
    const prefCount = preference_count === '0' ? '' : preference_count;

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
        <TableData>{prefCount}</TableData>
        <TableData align={['center', 'center']}>
          <Checkbox
            checked={selected === YES_VALUE}
            name={oid}
            checkedValue={YES_VALUE}
            unCheckedValue={NO_VALUE}
            onChange={onSelectedChange}
          />
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
  },
  (prevProps, nextProps) =>
    prevProps.selected === nextProps.selected &&
    prevProps.nvt === nextProps.nvt,
);

Nvt.propTypes = {
  nvt: PropTypes.object.isRequired,
  selected: PropTypes.yesno,
  onEditNvtDetailsClick: PropTypes.func,
  onSelectedChange: PropTypes.func,
};

const sortFunctions = {
  name: makeCompareString(EDIT_CONFIG_COLUMNS_SORT.name),
  oid: makeCompareString(EDIT_CONFIG_COLUMNS_SORT.oid),
  severity: makeCompareSeverity(),
  timeout: makeCompareString(EDIT_CONFIG_COLUMNS_SORT.timeout),
};

const sortNvts = (sortBy, sortReverse, selected = {}, nvts = []) => {
  if (sortBy === EDIT_CONFIG_COLUMNS_SORT.selected) {
    return [...nvts].sort((a, b) => {
      if (selected[a.oid] && !selected[b.oid]) {
        return sortReverse ? 1 : -1;
      }
      if (selected[b.oid] && !selected[a.oid]) {
        return sortReverse ? -1 : 1;
      }

      let {name: aName = ''} = a;
      let {name: bName = ''} = b;
      aName = aName.toLowerCase();
      bName = bName.toLowerCase();

      if (aName > bName) {
        return sortReverse ? -1 : 1;
      }
      if (bName > aName) {
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
  const [_] = useTranslation();
  const [sortBy, setSortBy] = useState(EDIT_CONFIG_COLUMNS_SORT.name);
  const [sortReverse, setSortReverse] = useState(false);
  const [selectedNvts, setSelectedNvts] = useState(selected);

  const handleSortChange = newSortBy => {
    setSortReverse(sortBy === newSortBy ? !sortReverse : false);
    setSortBy(newSortBy);
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

  const sortedNvts = sortNvts(sortBy, sortReverse, selectedNvts, nvts);

  if (isLoadingFamily || !isDefined(selectedNvts)) {
    return <Loading />;
  }

  const tableHeaders = [
    {sortBy: EDIT_CONFIG_COLUMNS_SORT.name, title: _('Name')},
    {sortBy: EDIT_CONFIG_COLUMNS_SORT.oid, title: _('OID')},
    {sortBy: EDIT_CONFIG_COLUMNS_SORT.severity, title: _('Severity')},
    {sortBy: EDIT_CONFIG_COLUMNS_SORT.timeout, title: _('Timeout')},
    {title: _('Prefs')},
  ];

  return (
    <SaveDialog
      width="auto"
      title={title}
      onClose={onClose}
      onSave={onSave}
      values={data}
    >
      <div>
        <div>
          {configNameLabel}: {configName}
        </div>
        <div>
          {_('Family')}: {familyName}
        </div>
      </div>

      <Section title={_('Edit Network Vulnerability Tests')}>
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map(({sortBy, title}) => (
                <TableHead
                  key={title}
                  currentSortBy={sortBy}
                  currentSortDir={sortDir}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  title={title}
                />
              ))}
              <TableHead
                currentSortBy={sortBy}
                currentSortDir={sortDir}
                sortBy={EDIT_CONFIG_COLUMNS_SORT.selected}
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
