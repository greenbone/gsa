/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import ScrollableContent from 'web/components/dialog/scrollablecontent';
import DialogTitle from 'web/components/dialog/title';
import DialogFooter from 'web/components/dialog/footer';

import PropTypes from 'web/utils/proptypes';

const DEFAULT_DIALOG_WIDTH = '400px';

const ErrorDialogContent = ({moveprops, text, title, buttonTitle, close}) => {
  return (
    <DialogContent>
      <DialogTitle title={title} onCloseClick={close} {...moveprops} />
      <ScrollableContent data-testid="errordialog-content">
        {text}
      </ScrollableContent>
      <DialogFooter title={buttonTitle} onClick={close} />
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
  buttonTitle = _('OK'),
  onClose,
}) => {
  return (
    <Dialog width={width} onClose={onClose} resizable={false}>
      {({close, moveProps}) => (
        <ErrorDialogContent
          close={close}
          moveprops={moveProps}
          text={text}
          title={title}
          buttonTitle={buttonTitle}
        />
      )}
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
