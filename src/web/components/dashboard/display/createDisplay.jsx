/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import PropTypes from 'web/utils/PropTypes';

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
