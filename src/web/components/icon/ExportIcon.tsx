/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {FileOutput as Icon} from 'lucide-react';
import {DynamicIcon, DynamicIconProps} from 'web/components/icon/DynamicIcon';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType from 'web/utils/SelectionType';

export interface ExportIconProps<TValue = string>
  extends Omit<DynamicIconProps<TValue>, 'icon'> {
  selectionType?: keyof typeof SelectionType;
  title?: string;
}

function ExportIcon<TValue = string>({
  selectionType,
  title,
  ...props
}: Readonly<ExportIconProps<TValue>>): React.ReactNode {
  const [_] = useTranslation();
  let downloadTitle = title;
  if (!isDefined(downloadTitle)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      downloadTitle = _('Export page contents');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      downloadTitle = _('Export selection');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      downloadTitle = _('Export all filtered');
    }
  }
  return (
    <DynamicIcon<TValue>
      dataTestId="export-icon"
      icon={Icon}
      title={downloadTitle}
      {...props}
    />
  );
}

export default ExportIcon;
