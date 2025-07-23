/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter from 'gmp/models/filter';
import Loading from 'web/components/loading/Loading';
import usePageFilter from 'web/hooks/usePageFilter';

interface FilterProviderRenderProps {
  filter: Filter;
}

interface FilterProviderProps {
  fallbackFilter?: Filter;
  gmpname: string;
  pageName?: string;
  children: (props: FilterProviderRenderProps) => React.ReactNode;
}

const FilterProvider = ({
  children,
  fallbackFilter,
  gmpname,
  pageName = gmpname,
}: FilterProviderProps) => {
  const [returnedFilter, isLoadingFilter] = usePageFilter(pageName, gmpname, {
    fallbackFilter,
  });
  return (
    <>{isLoadingFilter ? <Loading /> : children({filter: returnedFilter})}</>
  );
};

export default FilterProvider;
