/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Loading from 'web/components/loading/loading';

import PropTypes from 'web/utils/proptypes';
import usePageFilter from 'web/hooks/usePageFilter';

const FilterProvider = ({
  children,
  fallbackFilter,
  gmpname,
  pageName = gmpname,
  locationQuery = {},
}) => {
  const [returnedFilter, isLoadingFilter] = usePageFilter(pageName, {
    fallbackFilter,
    locationQueryFilterString: locationQuery?.filter,
  });

  return (
    <React.Fragment>
      {isLoadingFilter ? <Loading /> : children({filter: returnedFilter})}
    </React.Fragment>
  );
};

FilterProvider.propTypes = {
  fallbackFilter: PropTypes.filter,
  gmpname: PropTypes.string,
  locationQuery: PropTypes.shape({
    filter: PropTypes.string,
  }),
  pageName: PropTypes.string,
};

export default FilterProvider;
