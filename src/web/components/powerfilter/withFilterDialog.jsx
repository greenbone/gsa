/* Copyright (C) 2017-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import PropTypes from 'web/utils/proptypes';

import FilterDialog from './filterdialog';

import useFilterDialog from './useFilterDialog';
import useFilterDialogSave from './useFilterDialogSave';

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
  FilterDialogComponent =>
  (
    {createFilterType: createFilterTypeProp = createFilterType, ...props}, // eslint-disable-line react/prop-types
  ) => (
    <FilterDialogWithHandlers
      {...props}
      createFilterType={createFilterTypeProp}
    >
      {dialogProps => <FilterDialogComponent {...options} {...dialogProps} />}
    </FilterDialogWithHandlers>
  );

export default withFilterDialog;

// vim: set ts=2 sw=2 tw=80:
