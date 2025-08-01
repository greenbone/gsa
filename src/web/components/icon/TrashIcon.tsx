/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import {TrashcanIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {SelectionTypeType} from 'web/utils/SelectionType';

export interface TrashIconProps {
  'data-testid'?: string;
  selectionType?: SelectionTypeType;
  title?: string;
  loading?: boolean;
  [key: string]: unknown;
}

function TrashIcon({
  'data-testid': dataTestId = 'trash-icon',
  selectionType,
  title,
  loading = false,
  ...other
}: Readonly<TrashIconProps>): React.ReactNode {
  const [_] = useTranslation();
  if (!isDefined(title)) {
    if (loading) {
      title = _('Moving to trashcan');
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Move page contents to trashcan');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Move selection to trashcan');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Move all filtered to trashcan');
    }
  }
  return (
    <TrashcanIcon
      data-testid={dataTestId}
      {...other}
      loading={loading}
      title={title}
    />
  );
}

export default TrashIcon;
