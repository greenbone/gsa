/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SaveDialog from 'web/components/dialog/savedialog';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

const FilterDialog = ({children, onClose, onSave}) => {
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

FilterDialog.propTypes = {
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};

export default FilterDialog;

// vim: set ts=2 sw=2 tw=80:
