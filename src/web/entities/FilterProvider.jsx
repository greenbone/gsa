/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Loading from 'web/components/loading/Loading';
import usePageFilter from 'web/hooks/usePageFilter';
import PropTypes from 'web/utils/PropTypes';

const FilterProvider = ({
  children,
  fallbackFilter,
  gmpname,
  pageName = gmpname,
}) => {
  const [returnedFilter, isLoadingFilter] = usePageFilter(pageName, gmpname, {
    fallbackFilter,
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
  pageName: PropTypes.string,
};

export default FilterProvider;
