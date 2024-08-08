/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import useCapabilities from 'web/hooks/useCapabilities';

import CreateNamedFilterGroup from './createnamedfiltergroup';
import FilterStringGroup from './filterstringgroup';
import FirstResultGroup from './firstresultgroup';
import ResultsPerPageGroup from './resultsperpagegroup';
import SortByGroup from './sortbygroup';

import DefaultFilterDialogPropTypes from './dialogproptypes';

export const DefaultFilterDialog = ({
  filter,
  filterName,
  filterstring,
  saveNamedFilter,
  sortFields,
  onFilterStringChange,
  onFilterValueChange,
  onSortByChange,
  onSortOrderChange,
  onValueChange,
}) => {
  const capabilities = useCapabilities();
  return (
    <>
      <FilterStringGroup
        filter={filterstring}
        onChange={onFilterStringChange}
      />
      <FirstResultGroup filter={filter} onChange={onFilterValueChange} />
      <ResultsPerPageGroup filter={filter} onChange={onFilterValueChange} />
      <SortByGroup
        fields={sortFields}
        filter={filter}
        onSortByChange={onSortByChange}
        onSortOrderChange={onSortOrderChange}
      />
      {capabilities.mayCreate('filter') && (
        <CreateNamedFilterGroup
          filter={filter}
          filterName={filterName}
          saveNamedFilter={saveNamedFilter}
          onValueChange={onValueChange}
        />
      )}
    </>
  );
};

DefaultFilterDialog.propTypes = DefaultFilterDialogPropTypes;

export const createFilterDialog = options =>
  withFilterDialog(options)(DefaultFilterDialog);

export {DefaultFilterDialogPropTypes};

export default DefaultFilterDialog;

// vim: set ts=2 sw=2 tw=80:
