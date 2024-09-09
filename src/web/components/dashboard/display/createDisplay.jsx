/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withFilterSelection from './withFilterSelection';

const createDisplay = ({
  chartComponent: Chart,
  displayComponent: Display,
  displayId,
  displayName,
  filtersFilter,
  filterTerm,
  loaderComponent: Loader,
  ...other
}) => {
  const DisplayComponent = ({filter, ...props}) => (
    <Loader filter={filter}>
      {loaderProps => (
        <Display
          {...other}
          {...loaderProps}
          {...props}
          filter={filter}
          filterTerm={filterTerm}
        >
          {isDefined(Chart)
            ? displayProps => <Chart {...displayProps} />
            : undefined}
        </Display>
      )}
    </Loader>
  );

  DisplayComponent.propTypes = {
    filter: PropTypes.filter,
  };

  DisplayComponent.displayName = displayName;

  DisplayComponent.displayId = displayId;

  return withFilterSelection({
    filtersFilter,
  })(DisplayComponent);
};

export default createDisplay;

// vim: set ts=2 sw=2 tw=80:
