/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import useTranslation from 'web/hooks/useTranslation';

interface FilterDialogProps {
  children?: React.ReactNode;
  onClose?: () => void;
  onSave?: () => void;
}

const FilterDialog = ({children, onClose, onSave}: FilterDialogProps) => {
  const [_] = useTranslation();
  return (
    <SaveDialog
      buttonTitle={_('Update')}
      title={_('Update Filter')}
      width="800px"
      onClose={onClose}
      onSave={onSave}
    >
      {children}
    </SaveDialog>
  );
};

export default FilterDialog;
