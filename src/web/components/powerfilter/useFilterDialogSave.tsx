/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import Filter from 'gmp/models/filter';
import {apiType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

export type OnFilterCreatedFunc = (filter: Filter) => void;
export type OnFilterChangedFunc = (filter: Filter) => void;

interface UseFilterDialogSaveProps {
  onClose?: () => void;
  onFilterChanged?: OnFilterChangedFunc;
  onFilterCreated?: OnFilterCreatedFunc;
}

export interface UseFilterDialogStateProps {
  filterName?: string;
  saveNamedFilter?: boolean;
  filter: Filter;
  filterString: string;
  originalFilter: Filter;
}

interface UseFilterDialogReturn {
  handleSave: () => Promise<void>;
}

export type UseFilterDialogSave = [() => Promise<void>] & UseFilterDialogReturn;

const useFilterDialogSave = (
  createFilterType: string,
  {onClose, onFilterChanged, onFilterCreated}: UseFilterDialogSaveProps,
  {
    filterName,
    filter,
    filterString,
    originalFilter,
    saveNamedFilter,
  }: UseFilterDialogStateProps,
): UseFilterDialogSave => {
  const [_] = useTranslation();
  const gmp = useGmp();

  const createFilter = useCallback(
    (newFilter: Filter) => {
      // @ts-expect-error
      return gmp.filter
        .create({
          term: newFilter.toFilterString(),
          type: apiType(createFilterType),
          name: filterName,
        })
        .then(response => {
          const {data} = response;
          // load new filter
          // @ts-expect-error
          return gmp.filter.get(data);
        })
        .then(response => {
          const {data: f} = response;

          if (isDefined(onFilterCreated)) {
            onFilterCreated(f);
          }
        });
    },
    [gmp, createFilterType, filterName, onFilterCreated],
  );

  const handleSave: () => Promise<void> = useCallback(() => {
    const newFilter = filter
      .copy()
      .mergeKeywords(Filter.fromString(filterString));

    if (saveNamedFilter) {
      if (isDefined(filterName) && filterName.trim().length > 0) {
        return createFilter(newFilter).then(onClose);
      }
      return Promise.reject(
        new Error(_('Please insert a name for the new filter')),
      );
    }

    if (isDefined(onFilterChanged) && !newFilter.equals(originalFilter)) {
      onFilterChanged(newFilter);
    }

    if (isDefined(onClose)) {
      onClose();
    }
    return Promise.resolve();
  }, [
    onClose,
    onFilterChanged,
    createFilter,
    filter,
    filterString,
    filterName,
    originalFilter,
    saveNamedFilter,
    _,
  ]);

  const ret: UseFilterDialogSave = [handleSave] as UseFilterDialogSave;
  ret.handleSave = handleSave;
  return ret;
};

export default useFilterDialogSave;
