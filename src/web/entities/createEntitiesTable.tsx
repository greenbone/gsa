/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Model from 'gmp/models/model';
import EntitiesTable, {
  type EntitiesTableComponentProps,
  type EntitiesTableProps,
  type FooterComponentProps,
  type HeaderComponentProps,
  type PaginationComponentProps,
  type RowComponentProps,
} from 'web/entities/EntitiesTable';

interface ToString {
  toString(): string;
}

interface CreateEntitiesTableOptions<
  TEntity,
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
  emptyTitle?: ToString;
}

type CreateEntitiesTableProps<
  TEntity,
  TFooterProps extends FooterComponentProps<TEntity>,
  THeaderProps extends HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps,
> = EntitiesTableProps<
  TEntity,
  TFooterProps,
  THeaderProps,
  TRowProps,
  TPaginationProps
> &
  Omit<TFooterProps, keyof FooterComponentProps<TEntity>> &
  Omit<THeaderProps, keyof HeaderComponentProps> &
  Omit<
    TRowProps,
    keyof RowComponentProps<TEntity> &
      Omit<TPaginationProps, keyof PaginationComponentProps>
  >;

function createEntitiesTable<
  TEntity extends Model,
  TFooterProps extends
    FooterComponentProps<TEntity> = FooterComponentProps<TEntity>,
  THeaderProps extends HeaderComponentProps = HeaderComponentProps,
  TRowProps extends RowComponentProps<TEntity> = RowComponentProps<TEntity>,
  TPaginationProps extends PaginationComponentProps = PaginationComponentProps,
>({
  body,
  emptyTitle,
  footer,
  header,
  pagination,
  row,
  rowDetails,
}: CreateEntitiesTableOptions<
  TEntity,
  TFooterProps,
  THeaderProps,
  TRowProps,
  TPaginationProps
>) {
  return (
    props: CreateEntitiesTableProps<
      TEntity,
      TFooterProps,
      THeaderProps,
      TRowProps,
      TPaginationProps
    >,
  ) => (
    <EntitiesTable<
      TEntity,
      TFooterProps,
      THeaderProps,
      TRowProps,
      TPaginationProps
    >
      body={body}
      emptyTitle={String(emptyTitle)}
      footer={footer}
      header={header}
      pagination={pagination}
      row={row}
      rowDetails={rowDetails}
      {...(props as EntitiesTableProps<
        TEntity,
        TFooterProps,
        THeaderProps,
        TRowProps,
        TPaginationProps
      >)}
    />
  );
}

export default createEntitiesTable;
