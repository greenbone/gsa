/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import styled from 'styled-components';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Model from 'gmp/models/model';
import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {FoldState} from 'web/components/folding/Folding';
import FootNote from 'web/components/footnote/Footnote';
import FoldStateIcon from 'web/components/icon/FoldStateIcon';
import Layout from 'web/components/layout/Layout';
import Pagination from 'web/components/pagination/Pagination';
import StripedTable from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import useTranslation from 'web/hooks/useTranslation';
import {SortDirectionType} from 'web/utils/SortDirection';

export interface FooterComponentProps<TEntity> {
  entities?: TEntity[];
  entitiesCounts?: CollectionCounts;
  filter?: Filter;
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

export interface RowComponentProps<TEntity> {
  entity: TEntity;
  onToggleDetailsClick?: (entity: TEntity, id: string) => void;
}

interface RowDetailsComponentProps<TEntity> {
  entity: TEntity;
  links?: boolean;
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
  TFooterProps extends
    FooterComponentProps<TEntity> = FooterComponentProps<TEntity>,
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
  'data-testid'?: string;
  doubleRow?: boolean;
  emptyTitle?: string;
  entities?: TEntity[];
  entitiesCounts?: CollectionCounts;
  filter?: Filter;
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

const UpdatingStripedTable = styled(StripedTable)<{$isUpdating: boolean}>`
  opacity: ${props => (props.$isUpdating ? '0.2' : '1.0')};
`;

const DetailsIcon = styled(FoldStateIcon)`
  margin-top: 2px;
  margin-left: 2px;
`;

const TableBox = styled(Layout)`
  margin-top: 10px;
`;

const EmptyTitle = styled(Layout)`
  margin-top: 10px;
  margin-bottom: 20px;
`;

function EntitiesTable<
  TEntity extends Model = Model,
  TFooterProps extends
    FooterComponentProps<TEntity> = FooterComponentProps<TEntity>,
  THeaderProps extends HeaderComponentProps = HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity> = RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps = PaginationComponentProps,
>({
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
  const [details, setDetails] = useState<Record<string, boolean>>({});
  const [allToggled, setAllToggled] = useState<boolean>(false);
  const [_] = useTranslation();

  const handleToggleShowDetails = (entity: TEntity, entityId: string) => {
    const rowId = entity.id ?? entityId;
    setDetails(details => ({...details, [rowId]: !details[rowId]}));
  };

  const handleToggleAllDetails = (unToggle: boolean = false) => {
    const currentEntities = entities || [];
    const newToggled = unToggle ? false : !allToggled;
    setDetails(oldDetails => {
      return currentEntities.reduce(
        (details, entity) => {
          details[entity.id as string] = newToggled;
          return details;
        },
        {...oldDetails},
      );
    });
    setAllToggled(newToggled);
  };

  const handleFirst = () => {
    if (isDefined(onFirstClick)) {
      onFirstClick();
    }
    handleToggleAllDetails(true);
  };

  const handleLast = () => {
    if (isDefined(onLastClick)) {
      onLastClick();
    }
    handleToggleAllDetails(true);
  };

  const handleNext = () => {
    if (isDefined(onNextClick)) {
      onNextClick();
    }
    handleToggleAllDetails(true);
  };

  const handlePrevious = () => {
    if (isDefined(onPreviousClick)) {
      onPreviousClick();
    }
    handleToggleAllDetails(true);
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
      rows.push(
        <RowComponent
          {...(props as unknown as TRowProps)}
          key={entity.id}
          entity={entity}
          onToggleDetailsClick={handleToggleShowDetails}
        />,
      );
      if (isDefined(RowDetailsComponent) && details[entity.id as string]) {
        if (doubleRow) {
          rows.push(
            <TableBody key={`details-${entity.id}`}>
              <RowDetailsComponent entity={entity} links={links} />
            </TableBody>,
          );
        } else {
          rows.push(
            <RowDetailsComponent
              key={'details-' + entity.id}
              entity={entity}
              links={links}
            />,
          );
        }
      }
    });
  }
  const pagination =
    PaginationComponent === false ? undefined : (
      <PaginationComponent
        {...(props as unknown as TPaginationProps)}
        counts={entitiesCounts}
        onFirstClick={handleFirst}
        onLastClick={handleLast}
        onNextClick={handleNext}
        onPreviousClick={handlePrevious}
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
      {toggleDetailsIcon ? (
        <Layout align="space-between" grow="1">
          <DetailsIcon
            // @ts-expect-error
            foldState={allToggled ? FoldState.UNFOLDED : FoldState.FOLDED}
            title={allToggled ? _('Fold all details') : _('Unfold all details')}
            onClick={handleToggleAllDetails}
          />
          {pagination}
        </Layout>
      ) : (
        pagination
      )}
      <UpdatingStripedTable
        $isUpdating={isUpdating}
        footer={footer}
        header={header}
      >
        {body}
      </UpdatingStripedTable>
      {footnote ? (
        <Layout align="space-between">
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
