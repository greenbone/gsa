/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useCapabilities from 'web/hooks/useCapabilities';

import CreateNamedFilterGroup from './createnamedfiltergroup';
import DefaultFilterDialogPropTypes from './dialogproptypes';
import FilterStringGroup from './filterstringgroup';
import FirstResultGroup from './firstresultgroup';
import ResultsPerPageGroup from './resultsperpagegroup';
import SortByGroup from './sortbygroup';

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

export {DefaultFilterDialogPropTypes};

export default DefaultFilterDialog;
