/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import CreateNamedFilterGroup from 'web/components/powerfilter/CreateNamedFilterGroup';
import DefaultFilterDialogPropTypes from 'web/components/powerfilter/DialogPropTypes';
import FilterStringGroup from 'web/components/powerfilter/FilterStringGroup';
import FirstResultGroup from 'web/components/powerfilter/FirstResultGroup';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';
import SortByGroup from 'web/components/powerfilter/SortByGroup';
import useCapabilities from 'web/hooks/useCapabilities';

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
