/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';

import Filter from 'gmp/models/filter';

import {apiType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

import useTranslation from 'web/hooks/useTranslation';
import useGmp from 'web/hooks/useGmp';

const useFilterDialogSave = (
  createFilterType,
  {onClose, onFilterChanged, onFilterCreated},
  {filterName, filter, filterString, originalFilter, saveNamedFilter},
) => {
  const [_] = useTranslation();
  const gmp = useGmp();

  const createFilter = useCallback(
    newFilter => {
      return gmp.filter
        .create({
          term: newFilter.toFilterString(),
          type: apiType(createFilterType),
          name: filterName,
        })
        .then(response => {
          const {data} = response;
          // load new filter
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

  const handleSave = useCallback(() => {
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

  const ret = [handleSave];
  ret.handleSave = handleSave;
  return ret;
};

export default useFilterDialogSave;
