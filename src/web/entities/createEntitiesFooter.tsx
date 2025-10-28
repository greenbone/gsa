/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesFooter, {
  type EntitiesFooterProps,
} from 'web/entities/EntitiesFooter';
import withEntitiesFooter, {
  type WithEntitiesFooterProps,
} from 'web/entities/withEntitiesFooter';

export type CreateEntitiesFooterProps<TEntity> = WithEntitiesFooterProps<
  TEntity,
  EntitiesFooterProps<TEntity>
>;

function createEntitiesFooter<TEntity>(
  options: Partial<EntitiesFooterProps<TEntity>> = {},
) {
  return withEntitiesFooter<TEntity, EntitiesFooterProps<TEntity>>(options)(
    EntitiesFooter,
  );
}

export default createEntitiesFooter;
