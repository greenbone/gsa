/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {HelpIcon} from 'web/components/icon';
import {type ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import ManualLink, {type ManualLinkProps} from 'web/components/link/ManualLink';

interface ManualIconProps<TValue = string>
  extends Pick<ManualLinkProps, 'anchor' | 'page' | 'searchTerm'>,
    ExtendedDynamicIconProps<TValue> {}

const ManualIcon = ({anchor, page, searchTerm, ...props}: ManualIconProps) => {
  return (
    <ManualLink anchor={anchor} page={page} searchTerm={searchTerm}>
      <HelpIcon {...props} />
    </ManualLink>
  );
};

export default ManualIcon;
