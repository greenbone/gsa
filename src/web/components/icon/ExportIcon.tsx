/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {FileOutput as Icon} from 'lucide-react';
import React from 'react';
import {DynamicIcon, DynamicIconProps} from 'web/components/icon/DynamicIcon';
import SelectionType from 'web/utils/SelectionType';

interface DeleteIconProps extends Omit<DynamicIconProps, 'icon'> {
  selectionType?: keyof typeof SelectionType;
  title?: string;
}

const ExportIcon: React.FC<DeleteIconProps> = ({
  selectionType,
  title,
  ...props
}) => {
  let downloadTitle = title;
  if (!downloadTitle) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      downloadTitle = _('Export page contents');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      downloadTitle = _('Export selection');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      downloadTitle = _('Export all filtered');
    }
  }
  return (
    <DynamicIcon
      dataTestId="export-icon"
      icon={Icon}
      title={downloadTitle}
      {...props}
    />
  );
};

export default ExportIcon;
