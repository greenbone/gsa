/* Copyright (C) 2019-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import PropTypes from 'web/utils/proptypes';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogFooter from 'web/components/dialog/footer';

const DEFAULT_DIALOG_WIDTH = '400px';

const ErrorDialogContent = ({children, buttonTitle, onClose}) => {
  return (
    <DialogContent>
      {children}
      <DialogFooter title={buttonTitle} onClick={onClose} />
    </DialogContent>
  );
};

ErrorDialogContent.propTypes = {
  buttonTitle: PropTypes.string,
  close: PropTypes.func.isRequired,
  moveprops: PropTypes.object,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const ErrorDialog = ({
  width = DEFAULT_DIALOG_WIDTH,
  text,
  title,
  buttonTitle,
  onClose,
}) => {
  const [_] = useTranslation();
  buttonTitle = buttonTitle || _('OK');
  return (
    <Dialog width={width} title={title} onClose={onClose}>
      <ErrorDialogContent onClose={onClose} buttonTitle={buttonTitle}>
        {text}
      </ErrorDialogContent>
    </Dialog>
  );
};

ErrorDialog.propTypes = {
  buttonTitle: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ErrorDialog;
