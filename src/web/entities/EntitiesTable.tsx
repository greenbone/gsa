/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useId, useState} from 'react';
import styled from 'styled-components';
import type CollectionCounts from 'gmp/collection/collection-counts';
import {type FilterType} from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {FoldState} from 'web/components/folding/Folding';
import FootNote from 'web/components/footnote/Footnote';
import FoldStateIcon from 'web/components/icon/FoldStateIcon';
import Layout from 'web/components/layout/Layout';
import updatingStyle from 'web/components/layout/updating-style';
import Pagination from 'web/components/pagination/Pagination';
import StripedTable from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import useTranslation from 'web/hooks/useTranslation';
import {type SortDirectionType} from 'web/utils/sort-direction';

export interface FooterComponentProps<TEntity> {
  entities?: TEntity[];
  entitiesCounts?: CollectionCounts;
  filter?: FilterType;
}

export interface HeaderComponentProps {
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

export interface PaginationComponentProps {
  counts?: CollectionCounts;
  onFirstClick: () => void;
  onLastClick: () => void;
  onNextClick: () => void;
  onPreviousClick: () => void;
}

export interface RowPreview {
  expanded: boolean;
  id?: string;
  toggle: () => void;
}

export interface RowComponentProps<TEntity> {
  entity: TEntity;
  links?: boolean;
  preview?: RowPreview;
}

interface RowDetailsComponentProps<TEntity> {
  detailsExpanded?: boolean;
  detailsId?: string;
  entity: TEntity;
  links?: boolean;
  onPreviewExited?: (id: string) => void;
}

interface BodyComponentProps {
  children: React.ReactNode;
}

export interface EntitiesTableComponentProps<
  TEntity,
  TFooterProps extends FooterComponentProps<TEntity>,
  THeaderProps extends HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps,
> {
  body?: React.ComponentType<BodyComponentProps> | false;
  footer?: React.ComponentType<TFooterProps> | false;
  header?: React.ComponentType<THeaderProps> | false;
  pagination?: React.ComponentType<TPaginationProps> | false;
  row?: React.ComponentType<TRowProps>;
  rowDetails?: React.ComponentType<RowDetailsComponentProps<TEntity>>;
}

export interface EntitiesTableProps<
  TEntity = Model,
  TFooterProps extends FooterComponentProps<TEntity> =
    FooterComponentProps<TEntity>,
  THeaderProps extends HeaderComponentProps = HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity> = RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps = PaginationComponentProps,
> extends EntitiesTableComponentProps<
  TEntity,
  TFooterProps,
  THeaderProps,
  TRowProps,
  TPaginationProps
> {
  'aria-label'?: string;
  'data-testid'?: string;
  doubleRow?: boolean;
  emptyTitle?: string;
  entities?: TEntity[];
  entitiesCounts?: CollectionCounts;
  filter?: FilterType;
  footnote?: boolean;
  isUpdating?: boolean;
  links?: boolean;
  sortBy?: string;
  sortDir?: SortDirectionType;
  toggleDetailsIcon?: boolean;
  onFirstClick?: () => void;
  onLastClick?: () => void;
  onNextClick?: () => void;
  onPreviousClick?: () => void;
  onSortChange?: (sortBy: string) => void;
}

const UpdatingStripedTable = styled(StripedTable)<{$isUpdating?: boolean}>`
  ${updatingStyle}
`;

const DetailsIcon = styled(FoldStateIcon)`
  margin-top: 2px;
  margin-left: 2px;
`;

const TableBox = styled(Layout)`
  margin-top: 10px;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const EmptyTitle = styled(Layout)`
  margin-top: 10px;
  margin-bottom: 20px;
`;

function EntitiesTable<
  TEntity extends Model = Model,
  TFooterProps extends FooterComponentProps<TEntity> =
    FooterComponentProps<TEntity>,
  THeaderProps extends HeaderComponentProps = HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity> = RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps = PaginationComponentProps,
>({
  'aria-label': ariaLabel,
  'data-testid': dataTestId = 'entities-table',
  body: BodyComponent = TableBody,
  doubleRow = false,
  emptyTitle,
  entities,
  entitiesCounts,
  filter,
  footer: FooterComponent,
  footnote = true,
  header: HeaderComponent,
  isUpdating = false,
  links,
  onFirstClick,
  onLastClick,
  onNextClick,
  onPreviousClick,
  pagination: PaginationComponent = Pagination,
  row: RowComponent,
  rowDetails: RowDetailsComponent,
  sortBy: currentSortBy,
  sortDir: currentSortDir,
  toggleDetailsIcon = isDefined(RowDetailsComponent),
  onSortChange,
  ...props
}: EntitiesTableProps<
  TEntity,
  TFooterProps,
  THeaderProps,
  TRowProps,
  TPaginationProps
>) {
  const [previews, setPreviews] = useState<Record<string, 'open' | 'closing'>>(
    {},
  );
  const tableId = useId();
  const allToggled = Boolean(
    entities?.length &&
    entities.every(({id}) => isDefined(id) && previews[id] === 'open'),
  );
  const [_] = useTranslation();

  // Rows that leave the table cannot finish their closing transition.
  const closingIds = Object.keys(previews).filter(
    id => previews[id] === 'closing',
  );
  if (closingIds.length) {
    const visibleIds = new Set(entities?.map(({id}) => id));
    const staleIds = closingIds.filter(id => !visibleIds.has(id));
    if (staleIds.length) {
      const next = {...previews};
      staleIds.forEach(id => delete next[id]);
      setPreviews(next);
    }
  }

  const togglePreview = (id: string) => {
    setPreviews(current => ({
      ...current,
      [id]: current[id] === 'open' ? 'closing' : 'open',
    }));
  };

  const removeClosedPreview = useCallback((id: string) => {
    setPreviews(current => {
      if (current[id] !== 'closing') {
        return current;
      }
      const next = {...current};
      delete next[id];
      return next;
    });
  }, []);

  const handleToggleAllDetails = () => {
    setPreviews(current => {
      const next = {...current};
      if (allToggled) {
        for (const {id} of entities ?? []) {
          if (isDefined(id) && current[id] === 'open') {
            next[id] = 'closing';
          }
        }
      } else {
        for (const {id} of entities ?? []) {
          if (isDefined(id)) {
            next[id] = 'open';
          }
        }
      }
      return next;
    });
  };

  const changePage = (onPageChange?: () => void) => {
    onPageChange?.();
    setPreviews({});
  };

  if (!isDefined(entities)) {
    return null;
  }

  const filterString = isDefined(filter) ? filter.toFilterString() : '';

  if (entities.length === 0) {
    return (
      <>
        <EmptyTitle>{emptyTitle}</EmptyTitle>
        {footnote && (
          <Layout align="space-between">
            <FootNote>
              {_('(Applied filter: {{- filter}})', {filter: filterString})}
            </FootNote>
          </Layout>
        )}
      </>
    );
  }
  const rows: React.ReactElement[] = [];
  if (isDefined(RowComponent)) {
    forEach(entities, entity => {
      const id = entity.id;
      const state = isDefined(id) ? previews[id] : undefined;
      const detailsId = state ? `${tableId}-details-${id}` : undefined;
      const expanded = state === 'open';
      const preview =
        RowDetailsComponent && isDefined(id)
          ? {expanded, id: detailsId, toggle: () => togglePreview(id)}
          : undefined;
      rows.push(
        <RowComponent
          {...(props as unknown as TRowProps)}
          key={id}
          entity={entity}
          links={links}
          preview={preview}
        />,
      );
      if (RowDetailsComponent && isDefined(id) && state) {
        const key = `details-${id}`;
        const detailsRow = (
          <RowDetailsComponent
            key={key}
            detailsExpanded={expanded}
            detailsId={detailsId}
            entity={entity}
            links={links}
            onPreviewExited={removeClosedPreview}
          />
        );
        rows.push(
          doubleRow ? (
            <TableBody key={key}>{detailsRow}</TableBody>
          ) : (
            detailsRow
          ),
        );
      }
    });
  }
  const pagination =
    PaginationComponent === false ? undefined : (
      <PaginationComponent
        {...(props as unknown as TPaginationProps)}
        counts={entitiesCounts}
        onFirstClick={() => changePage(onFirstClick)}
        onLastClick={() => changePage(onLastClick)}
        onNextClick={() => changePage(onNextClick)}
        onPreviousClick={() => changePage(onPreviousClick)}
      />
    );

  const header =
    !isDefined(HeaderComponent) || HeaderComponent === false ? undefined : (
      <HeaderComponent
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        onSortChange={onSortChange}
        {...(props as unknown as THeaderProps)}
      />
    );

  const footer =
    !isDefined(FooterComponent) || FooterComponent === false ? undefined : (
      <FooterComponent
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        {...(props as unknown as TFooterProps)}
      />
    );

  const body =
    BodyComponent === false ? rows : <BodyComponent>{rows}</BodyComponent>;

  return (
    <TableBox
      className="entities-table"
      data-testid={dataTestId}
      flex="column"
      grow="1"
    >
      <Layout
        align="space-between"
        data-testid={toggleDetailsIcon ? 'entities-table-header' : undefined}
        grow="1"
      >
        <Layout align={['start', 'center']}>
          {toggleDetailsIcon && (
            <DetailsIcon
              foldState={allToggled ? FoldState.UNFOLDED : FoldState.FOLDED}
              title={
                allToggled ? _('Fold all details') : _('Unfold all details')
              }
              onClick={handleToggleAllDetails}
            />
          )}
        </Layout>
        <Layout align={['end', 'center']}>{pagination}</Layout>
      </Layout>
      <TableWrapper>
        <UpdatingStripedTable
          $isUpdating={isUpdating}
          aria-label={ariaLabel}
          footer={footer}
          header={header}
        >
          {body}
        </UpdatingStripedTable>
      </TableWrapper>
      {footnote ? (
        <Layout align="space-between" data-testid="entities-table-footer">
          <FootNote>
            {_('(Applied filter: {{- filter}})', {filter: filterString})}
          </FootNote>
          {pagination}
        </Layout>
      ) : (
        pagination
      )}
    </TableBox>
  );
}

export default EntitiesTable;
