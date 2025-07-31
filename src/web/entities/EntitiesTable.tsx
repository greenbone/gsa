/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Model from 'gmp/models/model';
import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import {FoldState} from 'web/components/folding/Folding';
import FootNote from 'web/components/footnote/Footnote';
import FoldStateIcon from 'web/components/icon/FoldStateIcon';
import Layout from 'web/components/layout/Layout';
import Pagination from 'web/components/pagination/Pagination';
import StripedTable from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import {SortDirectionType} from 'web/utils/SortDirection';
import withTranslation, {
  WithTranslationComponentProps,
} from 'web/utils/withTranslation';

const excludeProps = [
  'data-testid',
  'key',
  'ref',
  'row',
  'header',
  'footer',
  'pagination',
  'emptyTitle',
  'children',
] as const;

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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FooterComponentProps {}

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
  onToggleDetailsClick?: (value: unknown, name: string) => void;
}

interface RowDetailsComponentProps<TEntity> {
  entity: TEntity;
  links?: boolean;
}

interface BodyComponentProps {
  children: React.ReactNode;
}

interface EntitiesTableState {
  details: Record<string, boolean>;
  allToggled: boolean;
}

export interface EntitiesTableComponentProps<
  TEntity,
  TFooterProps extends FooterComponentProps,
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
  TFooterProps extends FooterComponentProps = FooterComponentProps,
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
  entities: TEntity[];
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
}

interface EntitiesTablePropsWithTranslation<
  TEntity,
  TFooterProps extends FooterComponentProps,
  THeaderProps extends HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps,
> extends EntitiesTableProps<
      TEntity,
      TFooterProps,
      THeaderProps,
      TRowProps,
      TPaginationProps
    >,
    WithTranslationComponentProps {}

class EntitiesTable<
  TEntity extends Model = Model,
  TFooterProps extends FooterComponentProps = FooterComponentProps,
  THeaderProps extends HeaderComponentProps = HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity> = RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps = PaginationComponentProps,
> extends React.Component<
  EntitiesTablePropsWithTranslation<
    TEntity,
    TFooterProps,
    THeaderProps,
    TRowProps,
    TPaginationProps
  >,
  EntitiesTableState
> {
  constructor(
    props: EntitiesTablePropsWithTranslation<
      TEntity,
      TFooterProps,
      THeaderProps,
      TRowProps,
      TPaginationProps
    >,
  ) {
    super(props);

    this.state = {
      details: {},
      allToggled: false,
    };

    this.handleToggleAllDetails = this.handleToggleAllDetails.bind(this);
    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleToggleShowDetails = this.handleToggleShowDetails.bind(this);
  }

  handleToggleShowDetails(value: unknown, name: string) {
    const {details} = this.state;

    details[name] = !details[name];

    this.setState({details});
  }

  handleToggleAllDetails(unToggle: boolean = false) {
    const {entities} = this.props;
    let {details, allToggled} = this.state;

    allToggled = !allToggled;

    if (unToggle) {
      allToggled = false;
    }

    if (allToggled) {
      forEach(entities, entity => (details[entity.id as string] = true));
    } else {
      forEach(entities, entity => (details[entity.id as string] = false));
    }
    this.setState({details, allToggled});
  }

  handleFirst() {
    const {onFirstClick} = this.props;
    if (isDefined(onFirstClick)) {
      onFirstClick();
    }
    this.handleToggleAllDetails(true);
  }

  handleLast() {
    const {onLastClick} = this.props;
    if (isDefined(onLastClick)) {
      onLastClick();
    }
    this.handleToggleAllDetails(true);
  }

  handleNext() {
    const {onNextClick} = this.props;
    if (isDefined(onNextClick)) {
      onNextClick();
    }
    this.handleToggleAllDetails(true);
  }

  handlePrevious() {
    const {onPreviousClick} = this.props;
    if (isDefined(onPreviousClick)) {
      onPreviousClick();
    }
    this.handleToggleAllDetails(true);
  }

  renderEmpty() {
    const {_} = this.props;

    const {emptyTitle, filter, footnote = true} = this.props;
    const filterString = isDefined(filter) ? filter.toFilterString() : '';
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

  render() {
    const {_} = this.props;

    const {details, allToggled} = this.state;
    const {
      doubleRow = false,
      'data-testid': dataTestId = 'entities-table',
      entities,
      entitiesCounts,
      filter,
      footnote = true,
      toggleDetailsIcon = true,
      isUpdating = false,
      sortBy: currentSortBy,
      sortDir: currentSortDir,
      links,
      row: RowComponent,
      rowDetails: RowDetailsComponent,
      header: HeaderComponent,
      footer: FooterComponent,
      pagination: PaginationComponent = Pagination,
      body: BodyComponent = TableBody,
    } = this.props;

    if (!isDefined(entities)) {
      return null;
    }

    const other = excludeObjectProps(this.props, excludeProps);
    const filterString = isDefined(filter) ? filter.toFilterString() : '';

    if (entities.length === 0) {
      return this.renderEmpty();
    }

    const rows: React.ReactElement[] = [];
    if (isDefined(RowComponent)) {
      forEach(entities, entity => {
        rows.push(
          <RowComponent
            {...(other as TRowProps)}
            key={entity.id}
            entity={entity}
            onToggleDetailsClick={this.handleToggleShowDetails}
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
          {...(other as TPaginationProps)}
          counts={entitiesCounts}
          onFirstClick={this.handleFirst}
          onLastClick={this.handleLast}
          onNextClick={this.handleNext}
          onPreviousClick={this.handlePrevious}
        />
      );

    const header =
      !isDefined(HeaderComponent) || HeaderComponent === false ? undefined : (
        <HeaderComponent
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          {...(other as THeaderProps)}
        />
      );

    const footer =
      !isDefined(FooterComponent) || FooterComponent === false ? undefined : (
        <FooterComponent {...(other as TFooterProps)} />
      );

    const body =
      BodyComponent === false ? rows : <BodyComponent>{rows}</BodyComponent>;

    const detailsIcon = (
      <DetailsIcon
        // @ts-expect-error
        foldState={allToggled ? FoldState.UNFOLDED : FoldState.FOLDED}
        title={allToggled ? _('Fold all details') : _('Unfold all details')}
        onClick={this.handleToggleAllDetails}
      />
    );

    return (
      <TableBox
        className="entities-table"
        data-testid={dataTestId}
        flex="column"
        grow="1"
      >
        {toggleDetailsIcon ? (
          <Layout align="space-between" grow="1">
            {detailsIcon}
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
}

export default withTranslation(EntitiesTable) as <
  TEntity extends Model,
  TFooterProps extends FooterComponentProps = FooterComponentProps,
  THeaderProps extends HeaderComponentProps = HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity> = RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps = PaginationComponentProps,
>(
  props: EntitiesTableProps<
    TEntity,
    TFooterProps,
    THeaderProps,
    TRowProps,
    TPaginationProps
  >,
) => React.ReactElement;
