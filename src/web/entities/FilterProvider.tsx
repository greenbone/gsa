/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {type FilterType} from 'gmp/models/filter';
import Loading from 'web/components/loading/Loading';
import usePageFilter from 'web/hooks/usePageFilter';

interface FilterProviderRenderProps {
  filter: FilterType;
}

interface FilterProviderProps {
  fallbackFilter?: FilterType;
  gmpName: string;
  pageName?: string;
  children: (props: FilterProviderRenderProps) => React.ReactNode;
}

const FilterProvider = ({
  children,
  fallbackFilter,
  gmpName,
  pageName = gmpName,
}: FilterProviderProps) => {
  const [returnedFilter, isLoadingFilter] = usePageFilter(pageName, gmpName, {
    fallbackFilter,
  });
  return (
    <>{isLoadingFilter ? <Loading /> : children({filter: returnedFilter})}</>
  );
};

export default FilterProvider;
