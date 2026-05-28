/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {CircleOffIcon as CircleXSvgIcon} from 'web/components/icon';
import {type ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {type SelectionTypeType} from 'web/utils/SelectionType';

interface DisableUpdateToLatestIconProps<
  TValue = string,
> extends ExtendedDynamicIconProps<TValue> {
  active?: boolean;
  selectionType?: SelectionTypeType;
  title?: string;
}

const DisableUpdateToLatestIcon = <TValue = string,>({
  active = true,
  'data-testid': dataTestId = 'disable-update-to-latest-icon',
  selectionType,
  title,
  ...other
}: DisableUpdateToLatestIconProps<TValue>) => {
  const [_] = useTranslation();

  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _(
        'Disable automatic update to latest for all items on this page',
      );
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Disable automatic update to latest for selected items');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Disable automatic update to latest for all filtered items');
    }
  }

  return (
    <CircleXSvgIcon
      {...other}
      active={active}
      data-testid={dataTestId}
      title={title}
    />
  );
};

export default DisableUpdateToLatestIcon;
