/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useEffect} from 'react';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import SeverityBar from 'web/components/bar/SeverityBar';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Checkbox from 'web/components/form/Checkbox';
import {EditIcon} from 'web/components/icon';
import Loading from 'web/components/loading/Loading';
import Section from 'web/components/section/Section';
import SortBy from 'web/components/sortby/SortBy';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import Table from 'web/components/table/StripedTable';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {makeCompareSeverity, makeCompareString} from 'web/utils/Sort';
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
            checkedValue={YES_VALUE}
            name={oid}
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

const renderTableHead = (sortBy, sortDir, handleSortChange, columns) => {
  return columns.map(({sortBy: columnSortBy, title, align}) => (
    <TableHead
      key={columnSortBy || title}
      align={align}
      currentSortBy={sortBy}
      currentSortDir={sortDir}
      sortBy={columnSortBy}
      title={title}
      onSortChange={handleSortChange}
    />
  ));
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
    {
      sortBy: EDIT_CONFIG_COLUMNS_SORT.selected,
      title: _('Selected'),
      align: 'center',
    },
    {title: _('Actions'), align: 'center'},
  ];

  return (
    <SaveDialog
      title={title}
      values={data}
      width="auto"
      onClose={onClose}
      onSave={onSave}
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
              {renderTableHead(sortBy, sortDir, handleSortChange, tableHeaders)}
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
                  onEditNvtDetailsClick={onEditNvtDetailsClick}
                  onSelectedChange={handleSelectedChange}
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
