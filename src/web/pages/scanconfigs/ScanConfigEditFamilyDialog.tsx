/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useEffect} from 'react';
import {
  type ScanConfigNvtsSelected,
  type ScanConfigFamilyNvt,
} from 'gmp/commands/scan-config';
import {YES_VALUE, NO_VALUE, type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Checkbox from 'web/components/form/Checkbox';
import {EditIcon} from 'web/components/icon';
import Loading from 'web/components/loading/Loading';
import Section from 'web/components/section/Section';
import Table from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {makeCompareSeverity, makeCompareString} from 'web/utils/Sort';
import SortDirection, {type SortDirectionType} from 'web/utils/sort-direction';

interface NvtDisplayProps {
  nvt: ScanConfigFamilyNvt;
  selected?: YesNo;
  onSelectedChange?: (value: YesNo, name?: string) => void;
  onEditNvtDetailsClick?: (nvtOid: string) => void;
}

interface ScanConfigEditFamilyDialogProps {
  configId: string;
  configName: string;
  configNameLabel: string;
  familyName: string;
  isLoadingFamily?: boolean;
  nvts?: ScanConfigFamilyNvt[];
  selected: ScanConfigNvtsSelected;
  title: string;
  onClose: () => void;
  onEditNvtDetailsClick?: (nvtOid: string) => void;
  onSave: (data: ScanConfigEditFamilyDialogData) => void;
}

interface TableHeaderColumn {
  sortBy?: string;
  title: string;
  align?: 'start' | 'center';
}

interface ScanConfigEditFamilyDialogData {
  familyName: string;
  configId: string;
  selected: ScanConfigNvtsSelected;
}

const EDIT_CONFIG_COLUMNS_SORT = {
  name: 'name',
  oid: 'oid',
  severity: 'severity',
  timeout: 'timeout',
  selected: 'selected',
};

const shouldNvtDisplayComponentUpdate = (
  props: NvtDisplayProps,
  nextProps: NvtDisplayProps,
) => nextProps.nvt !== props.nvt || nextProps.selected !== props.selected;

const NvtDisplay = React.memo(
  ({
    nvt,
    selected,
    onSelectedChange,
    onEditNvtDetailsClick,
  }: NvtDisplayProps) => {
    const [_] = useTranslation();
    const {name, oid, severity, timeout, defaultTimeout, preferenceCount} = nvt;
    return (
      <TableRow>
        <TableData>{name}</TableData>
        <TableData>{oid}</TableData>
        <TableData>
          <SeverityBar severity={severity} />
        </TableData>
        <TableData>
          {timeout ?? _('default')}
          {isDefined(defaultTimeout) ? ` (${defaultTimeout})` : ''}
        </TableData>
        <TableData>{preferenceCount ?? ''}</TableData>
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
  shouldNvtDisplayComponentUpdate,
);

const sortFunctions = {
  name: makeCompareString(EDIT_CONFIG_COLUMNS_SORT.name),
  oid: makeCompareString(EDIT_CONFIG_COLUMNS_SORT.oid),
  severity: makeCompareSeverity(),
  timeout: makeCompareString(EDIT_CONFIG_COLUMNS_SORT.timeout),
};

const sortNvts = (
  sortBy: string,
  sortReverse: boolean,
  selected: Record<string, YesNo> = {},
  nvts: ScanConfigFamilyNvt[] = [],
) => {
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

const renderTableHead = (
  sortBy: string,
  sortDir: SortDirectionType,
  handleSortChange?: (newSortBy: string) => void,
  columns: TableHeaderColumn[] = [],
) => {
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

const ScanConfigEditFamilyDialog = ({
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
}: ScanConfigEditFamilyDialogProps) => {
  const [_] = useTranslation();
  const [sortBy, setSortBy] = useState(EDIT_CONFIG_COLUMNS_SORT.name);
  const [sortReverse, setSortReverse] = useState(false);
  const [selectedNvts, setSelectedNvts] = useState(selected);

  const handleSortChange = (newSortBy: string) => {
    setSortReverse(sortBy === newSortBy ? !sortReverse : false);
    setSortBy(newSortBy);
  };

  const handleSelectedChange = (value: YesNo, name: string) => {
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

  const sortDir = sortReverse ? SortDirection.DESC : SortDirection.ASC;

  const sortedNvts = sortNvts(sortBy, sortReverse, selectedNvts, nvts);

  if (isLoadingFamily || !isDefined(selectedNvts)) {
    return <Loading />;
  }

  const tableHeaders: TableHeaderColumn[] = [
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
    <SaveDialog<ScanConfigEditFamilyDialogData>
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
                <NvtDisplay
                  key={oid}
                  nvt={nvt}
                  selected={selectedNvts[oid as string]}
                  onEditNvtDetailsClick={onEditNvtDetailsClick}
                  onSelectedChange={
                    handleSelectedChange as (
                      value: YesNo,
                      name?: string,
                    ) => void
                  }
                />
              );
            })}
          </TableBody>
        </Table>
      </Section>
    </SaveDialog>
  );
};

ScanConfigEditFamilyDialog.propTypes = {
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

export default ScanConfigEditFamilyDialog;
