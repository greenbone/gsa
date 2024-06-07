/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import FilterDialog from './filterdialog';

const withFilterDialog =
  ({createFilterType, ...options} = {}) =>
  FilterDialogComponent =>
  (
    {createFilterType: createFilterTypeProp = createFilterType, ...props}, // eslint-disable-line react/prop-types
  ) => (
    <FilterDialog {...props} createFilterType={createFilterTypeProp}>
      {dialogProps => <FilterDialogComponent {...options} {...dialogProps} />}
    </FilterDialog>
  );

export default withFilterDialog;

// vim: set ts=2 sw=2 tw=80:
