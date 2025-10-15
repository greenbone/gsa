/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {CircleMinusIcon as CircleMinusSvgIcon} from 'web/components/icon';
import {type ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {type SelectionTypeType} from 'web/utils/SelectionType';

interface RevokeIconProps<TValue = string>
  extends ExtendedDynamicIconProps<TValue> {
  active?: boolean;
  selectionType?: SelectionTypeType;
  title?: string;
}

const RevokeIcon = <TValue = string,>({
  active = true,
  'data-testid': dataTestId = 'circle-minus-icon',
  selectionType,
  title,
  ...other
}: RevokeIconProps<TValue>) => {
  const [_] = useTranslation();

  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Revoke all items on this page');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Revoke selected items');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Revoke all filtered items');
    }
  }

  return (
    <CircleMinusSvgIcon
      {...other}
      active={active}
      data-testid={dataTestId}
      title={title}
    />
  );
};

export default RevokeIcon;
