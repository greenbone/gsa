/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as Filter, type FilterSortOrder} from 'gmp/models/filter';
import CreateNamedFilterGroup from 'web/components/powerfilter/CreateNamedFilterGroup';
import DefaultFilterDialogPropTypes from 'web/components/powerfilter/DialogPropTypes';
import FilterStringGroup from 'web/components/powerfilter/FilterStringGroup';
import FirstResultGroup from 'web/components/powerfilter/FirstResultGroup';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';
import SortByGroup, {
  type SortByField,
} from 'web/components/powerfilter/SortByGroup';
import useCapabilities from 'web/hooks/useCapabilities';

interface DefaultFilterDialogProps {
  filter?: Filter;
  filterName?: string;
  filterString: string;
  saveNamedFilter?: boolean;
  sortFields?: SortByField[];
  onFilterStringChange?: (value: string) => void;
  onFilterValueChange?: (value: string | number, name: string) => void;
  onSortByChange?: (value: string) => void;
  onSortOrderChange?: (value: FilterSortOrder) => void;
  onValueChange?: (value: string | boolean, name: string) => void;
}

const DefaultFilterDialog = ({
  filter,
  filterName,
  filterString,
  saveNamedFilter,
  sortFields,
  onFilterStringChange,
  onFilterValueChange,
  onSortByChange,
  onSortOrderChange,
  onValueChange,
}: DefaultFilterDialogProps) => {
  const capabilities = useCapabilities();
  return (
    <>
      <FilterStringGroup
        filter={filterString}
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
          filterName={filterName}
          saveNamedFilter={saveNamedFilter}
          onValueChange={onValueChange}
        />
      )}
    </>
  );
};

export {DefaultFilterDialogPropTypes};

export default DefaultFilterDialog;
