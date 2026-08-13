/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import type Filter from 'gmp/models/filter';
import type FilterType from 'gmp/models/filter/filter-type';
import {isDefined} from 'gmp/utils/identity';
import FilterSelectionDialog, {
  type FilterSelectionDialogValues,
} from 'web/components/dashboard/display/FilterSelectionDialog';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import {loadEntities, selector} from 'web/store/entities/filters';
import {UNSET_VALUE} from 'web/utils/Render';

export interface UseFilterSelectionProps {
  filterId?: string;
  filtersFilter: FilterType;
  onFilterIdChanged?: (filterId?: string) => void;
}

interface UseFilterSelectionResult {
  filter: Filter | undefined;
  selectFilter: () => void;
  filterSelectionDialog: React.ReactNode;
}

const useFilterSelection = ({
  filterId,
  filtersFilter,
  onFilterIdChanged,
}: UseFilterSelectionProps): UseFilterSelectionResult => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [showDialog, setShowDialog] = useState(false);

  const filters = useShallowEqualSelector<unknown, Filter[]>(state => {
    if (!isDefined(filtersFilter)) {
      return [];
    }
    return selector(state).getEntities(filtersFilter) ?? [];
  });

  useEffect(() => {
    // @ts-expect-error redux thunk action
    dispatch(loadEntities(gmp)(filtersFilter));
  }, [dispatch, filtersFilter, gmp]);

  const closeDialog = () => setShowDialog(false);

  const handleSaveDialog = ({
    filterId = UNSET_VALUE,
  }: FilterSelectionDialogValues) => {
    closeDialog();
    if (isDefined(onFilterIdChanged)) {
      onFilterIdChanged(filterId === UNSET_VALUE ? undefined : filterId);
    }
  };

  const filter = isDefined(filterId)
    ? filters.find(f => f.id === filterId)
    : undefined;

  const filterSelectionDialog = showDialog ? (
    <FilterSelectionDialog
      filterId={filterId}
      filters={filters}
      onClose={closeDialog}
      onSave={handleSaveDialog}
    />
  ) : null;

  return {
    filter,
    selectFilter: () => setShowDialog(true),
    filterSelectionDialog,
  };
};

export default useFilterSelection;
