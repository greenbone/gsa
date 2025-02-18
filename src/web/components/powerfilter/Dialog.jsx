/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useCapabilities from 'web/hooks/useCapabilities';

import CreateNamedFilterGroup from './CreateNamedFilterGroup';
import DefaultFilterDialogPropTypes from './DialogPropTypes';
import FilterStringGroup from './FilterStringGroup';
import FirstResultGroup from './FirstResultGroup';
import ResultsPerPageGroup from './ResultsPerPageGroup';
import SortByGroup from './SortByGroup';

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
