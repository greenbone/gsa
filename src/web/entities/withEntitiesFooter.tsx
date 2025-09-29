/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';

interface EntitiesFooterWrapperProps<TEntity> {
  entities?: TEntity[];
  entitiesCounts?: CollectionCounts;
  filter?: Filter;
  onDeleteBulk?: () => void;
  onAuthorizeBulk?: () => void;
  onRevokeBulk?: () => void;
  onDownloadBulk?: () => void;
  onTagsBulk?: () => void;
  onTrashBulk?: () => void;
}

/**
 * Props for the component passed to withEntitiesFooter gets provided.
 */
export interface WithEntitiesFooterComponentProps<TEntity> {
  entities?: TEntity[];
  entitiesCounts?: CollectionCounts;
  filter?: Filter;
  onDeleteClick?: () => void;
  onAuthorizeClick?: () => void;
  onRevokeClick?: () => void;
  onDownloadClick?: (filename: string) => void;
  onTagsClick?: () => void;
  onTrashClick?: () => void;
}

/**
 * Props for the wrapper component created by withEntitiesFooter.
 */
export type WithEntitiesFooterProps<
  TEntity,
  TProps = {},
> = EntitiesFooterWrapperProps<TEntity> &
  Omit<
    TProps,
    | keyof EntitiesFooterWrapperProps<TEntity>
    | keyof WithEntitiesFooterComponentProps<TEntity>
  >;

export function withEntitiesFooter<
  TEntity,
  TProps extends
    WithEntitiesFooterComponentProps<TEntity> = WithEntitiesFooterComponentProps<TEntity>,
>(options: Partial<TProps> = {}) {
  return (Component: React.ComponentType<TProps>) => {
    const EntitiesFooterWrapper = ({
      entities,
      entitiesCounts,
      filter,
      onDownloadBulk,
      onDeleteBulk,
      onTagsBulk,
      onAuthorizeBulk,
      onRevokeBulk,
      ...props
    }: WithEntitiesFooterProps<TEntity, TProps>) => {
      return (
        <Component
          {...options}
          {...(props as TProps)}
          entities={entities}
          entitiesCounts={entitiesCounts}
          filter={filter}
          onAuthorizeClick={onAuthorizeBulk}
          onDeleteClick={onDeleteBulk}
          onDownloadClick={onDownloadBulk}
          onRevokeClick={onRevokeBulk}
          onTagsClick={onTagsBulk}
          onTrashClick={onDeleteBulk}
        />
      );
    };

    return EntitiesFooterWrapper;
  };
}

export default withEntitiesFooter;
