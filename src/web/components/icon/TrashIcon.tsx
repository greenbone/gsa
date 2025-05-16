/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {TrashcanIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType from 'web/utils/SelectionType';

export interface TrashIconProps {
  selectionType?: keyof typeof SelectionType;
  title?: string;
  loading?: boolean;
  [key: string]: unknown;
}

function TrashIcon({
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
      data-testid="trash-icon"
      {...other}
      loading={loading}
      title={title}
    />
  );
}

export default TrashIcon;
