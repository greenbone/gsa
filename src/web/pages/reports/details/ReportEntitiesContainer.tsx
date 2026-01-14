/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useState} from 'react';
import CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import Loading from 'web/components/loading/Loading';
import SortDirection, {type SortDirectionType} from 'web/utils/sort-direction';

type EntityCompareFunc<TEntity> = (
  sortReverse?: boolean,
) => (a: TEntity, b: TEntity) => number;

type SortFunctions<TEntity> = {
  [key: string]: EntityCompareFunc<TEntity>;
};

export interface ReportEntitiesContainerRenderProps<TEntity> {
  entities: TEntity[];
  entitiesCounts: CollectionCounts;
  sortBy: string;
  sortDir: SortDirectionType;
  onFirstClick: () => void;
  onLastClick: () => void;
  onNextClick: () => void;
  onPreviousClick: () => void;
}

interface ReportEntitiesContainerProps<TEntity> {
  children: (
    props: ReportEntitiesContainerRenderProps<TEntity>,
  ) => React.JSX.Element;
  filter?: Filter;
  counts?: CollectionCounts;
  entities?: TEntity[];
  sortField: string;
  sortFunctions?: SortFunctions<TEntity>;
  sortReverse: boolean;
}

interface SortEntitiesProps<TEntity> {
  entities: TEntity[];
  sortFunctions?: SortFunctions<TEntity>;
  sortField: string;
  sortReverse: boolean;
}

const sortEntities = <TEntity,>({
  entities,
  sortFunctions = {},
  sortField,
  sortReverse,
}: SortEntitiesProps<TEntity>) => {
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

const ReportEntitiesContainer = <TEntity,>({
  children,
  counts,
  entities,
  filter,
  sortField,
  sortFunctions,
  sortReverse,
}: ReportEntitiesContainerProps<TEntity>) => {
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

  const sortedEntities = sortEntities<TEntity>({
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
