/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesFooter, {EntitiesFooterProps} from 'web/entities/EntitiesFooter';
import withEntitiesFooter from 'web/entities/withEntitiesFooter';

function createEntitiesFooter<TEntity>(
  options: Partial<EntitiesFooterProps<TEntity>> = {},
) {
  return withEntitiesFooter<TEntity, EntitiesFooterProps<TEntity>>(options)(
    EntitiesFooter,
  );
}

export default createEntitiesFooter;
