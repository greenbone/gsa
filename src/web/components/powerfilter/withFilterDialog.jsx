/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import FilterDialog from 'web/components/powerfilter/FilterDialog';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';
import {updateDisplayName} from 'web/utils/displayName';
import PropTypes from 'web/utils/PropTypes';

const FilterDialogWithHandlers = ({
  children,
  createFilterType,
  filter: initialFilter,
  onCloseClick,
  onClose = onCloseClick,
  onFilterCreated,
  onFilterChanged,
  ...props
}) => {
  const filterDialogProps = useFilterDialog(initialFilter);
  const [handleSave] = useFilterDialogSave(
    createFilterType,
    {
      onFilterChanged,
      onFilterCreated,
      onClose,
    },
    filterDialogProps,
  );
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      {() =>
        children({
          ...props,
          ...filterDialogProps,
        })
      }
    </FilterDialog>
  );
};

FilterDialogWithHandlers.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  createFilterType: PropTypes.string.isRequired,
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
};

const withFilterDialog =
  ({createFilterType, ...options} = {}) =>
  FilterDialogComponent => {
    const FilterDialogWrapper = (
      {createFilterType: createFilterTypeProp = createFilterType, ...props}, // eslint-disable-line react/prop-types
    ) => (
      <FilterDialogWithHandlers
        {...props}
        createFilterType={createFilterTypeProp}
      >
        {dialogProps => <FilterDialogComponent {...options} {...dialogProps} />}
      </FilterDialogWithHandlers>
    );
    return updateDisplayName(
      FilterDialogWrapper,
      FilterDialogComponent,
      'withFilterDialog',
    );
  };

export default withFilterDialog;
