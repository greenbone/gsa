/* Copyright (C) 2017-2022 Greenbone AG
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
import React, {useCallback} from 'react';

import PropTypes from 'web/utils/proptypes';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogTwoButtonFooter from 'web/components/dialog/twobuttonfooter';

import useTranslation from 'web/hooks/useTranslation';

const DEFAULT_DIALOG_WIDTH = '400px';

const ConfirmationDialogContent = ({
  content,
  close,
  rightButtonTitle,
  onResumeClick,
}) => {
  const handleResume = useCallback(() => {
    if (onResumeClick) {
      onResumeClick();
    }
  }, [onResumeClick]);

  return (
    <DialogContent>
      {content}
      <DialogTwoButtonFooter
        rightButtonTitle={rightButtonTitle}
        onLeftButtonClick={close}
        onRightButtonClick={handleResume}
      />
    </DialogContent>
  );
};

ConfirmationDialogContent.propTypes = {
  close: PropTypes.func.isRequired,
  content: PropTypes.elementOrString,
  rightButtonTitle: PropTypes.string,
  onResumeClick: PropTypes.func.isRequired,
};

const ConfirmationDialog = ({
  width = DEFAULT_DIALOG_WIDTH,
  content,
  title,
  rightButtonTitle,
  onClose,
  onResumeClick,
}) => {
  const [_] = useTranslation();

  rightButtonTitle = rightButtonTitle || _('OK');
  return (
    <Dialog width={width} onClose={onClose} title={title}>
      {({close}) => (
        <ConfirmationDialogContent
          close={close}
          content={content}
          rightButtonTitle={rightButtonTitle}
          onResumeClick={onResumeClick}
        />
      )}
    </Dialog>
  );
};

ConfirmationDialog.propTypes = {
  content: PropTypes.elementOrString,
  rightButtonTitle: PropTypes.string,
  title: PropTypes.string.isRequired,
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onResumeClick: PropTypes.func.isRequired,
};

export default ConfirmationDialog;
