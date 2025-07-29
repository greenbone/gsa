/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesFooter, {EntitiesFooterProps} from 'web/entities/EntitiesFooter';
import withEntitiesFooter from 'web/entities/withEntitiesFooter';

function createEntitiesFooter<
  TOptions extends EntitiesFooterProps = EntitiesFooterProps,
>(options: TOptions) {
  return withEntitiesFooter<EntitiesFooterProps, EntitiesFooterProps>(options)(
    EntitiesFooter,
  );
}

export default createEntitiesFooter;
