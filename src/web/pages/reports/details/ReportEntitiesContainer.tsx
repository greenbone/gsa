/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useState} from 'react';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import type Filter from 'gmp/models/filter';
import type Result from 'gmp/models/result';
import {isDefined} from 'gmp/utils/identity';
import Loading from 'web/components/loading/Loading';
import SortDirection, {type SortDirectionType} from 'web/utils/SortDirection';

type ResultCompareFunc = (
  sortReverse?: boolean,
) => (a: Result, b: Result) => number;

type SortFunctions = {
  [key: string]: ResultCompareFunc;
};

export interface ReportEntitiesContainerRenderProps {
  entities: Result[];
  entitiesCounts: CollectionCounts;
  sortBy: string;
  sortDir: SortDirectionType;
  onFirstClick: () => void;
  onLastClick: () => void;
  onNextClick: () => void;
  onPreviousClick: () => void;
}

interface ReportEntitiesContainerProps {
  children: (props: ReportEntitiesContainerRenderProps) => React.JSX.Element;
  filter?: Filter;
  counts?: CollectionCounts;
  entities?: Result[];
  sortField: string;
  sortFunctions?: SortFunctions;
  sortReverse: boolean;
}

interface SortEntitiesProps {
  entities: Result[];
  sortFunctions?: SortFunctions;
  sortField: string;
  sortReverse: boolean;
}

const sortEntities = ({
  entities,
  sortFunctions = {},
  sortField,
  sortReverse,
}: SortEntitiesProps) => {
  const compareFunc = sortFunctions[sortField];

  if (!isDefined(compareFunc)) {
    return entities;
  }

  const compare = compareFunc(sortReverse);
  return [...entities].sort(compare);
};

const getRows = (filter?: Filter, counts?: CollectionCounts) => {
  let rows = isDefined(filter) ? (filter.get('rows') as number) : undefined;

  if (!isDefined(rows)) {
    rows = counts?.rows;
  }
  return rows;
};

const ReportEntitiesContainer = ({
  children,
  counts,
  entities,
  filter,
  sortField,
  sortFunctions,
  sortReverse,
}: ReportEntitiesContainerProps) => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    const rows = getRows(filter, counts);
    const filtered = counts?.filtered || 1;

    if (
      !isDefined(rows) ||
      !isDefined(filtered) ||
      rows <= 0 ||
      filtered <= 0
    ) {
      return;
    }

    const last = Math.floor(filtered / rows);
    if (page > last) {
      setPage(last);
    }
  }, [counts, filter, page]);

  const handleFirst = () => {
    setPage(0);
  };

  const handleLast = () => {
    const rows = getRows(filter, counts);
    const filtered = counts?.filtered;

    if (
      !isDefined(rows) ||
      !isDefined(filtered) ||
      rows <= 0 ||
      filtered <= 0
    ) {
      return;
    }

    const last = Math.floor((filtered - 1) / rows);
    setPage(last);
  };

  const handleNext = () => {
    setPage(page => page + 1);
  };

  const handlePrevious = () => {
    setPage(page => page - 1);
  };

  if (!isDefined(children) || !isDefined(entities)) {
    return <Loading />;
  }

  const sortedEntities = sortEntities({
    entities,
    sortFunctions,
    sortReverse,
    sortField,
  });

  const rows = getRows(filter, counts) || 1;
  const entitiesIndex = page * rows;
  const pagedEntities = sortedEntities.slice(
    entitiesIndex,
    entitiesIndex + rows,
  );

  const pagedCounts = isDefined(counts)
    ? counts.clone({
        first: entitiesIndex + 1,
        length: pagedEntities.length,
        rows,
      })
    : new CollectionCounts({
        first: 1,
        length: 0,
        rows,
      });

  return children({
    entities: pagedEntities,
    entitiesCounts: pagedCounts,
    sortBy: sortField,
    sortDir: sortReverse ? SortDirection.DESC : SortDirection.ASC,
    onFirstClick: handleFirst,
    onLastClick: handleLast,
    onNextClick: handleNext,
    onPreviousClick: handlePrevious,
  });
};

export default ReportEntitiesContainer;
