/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {ListSvgIcon} from 'web/components/icon';
import {ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import Link from 'web/components/link/Link';

interface ListIconProps<TValue = string>
  extends ExtendedDynamicIconProps<TValue> {
  'data-testid'?: string;
  page?: string;
  filter?: string | Filter;
}

const ListIcon = <TValue = string,>({
  page,
  filter,
  'data-testid': dataTestId = 'list-link-icon',
  ...props
}: ListIconProps<TValue>) => {
  return (
    <Link data-testid={dataTestId} filter={filter} to={page}>
      <ListSvgIcon {...props} data-testid="list-icon" />
    </Link>
  );
};

export default ListIcon;
