/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {RefreshIcon as RefreshSvgIcon} from 'web/components/icon';
import {type ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {type SelectionTypeType} from 'web/utils/SelectionType';

interface EnableUpdateToLatestIconProps<
  TValue = string,
> extends ExtendedDynamicIconProps<TValue> {
  active?: boolean;
  selectionType?: SelectionTypeType;
  title?: string;
}

const EnableUpdateToLatestIcon = <TValue = string,>({
  active = true,
  'data-testid': dataTestId = 'enable-update-to-latest-icon',
  selectionType,
  title,
  ...other
}: EnableUpdateToLatestIconProps<TValue>) => {
  const [_] = useTranslation();

  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Enable automatic update to latest for all items on this page');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Enable automatic update to latest for selected items');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Enable automatic update to latest for all filtered items');
    }
  }

  return (
    <RefreshSvgIcon
      {...other}
      active={active}
      data-testid={dataTestId}
      title={title}
    />
  );
};

export default EnableUpdateToLatestIcon;
