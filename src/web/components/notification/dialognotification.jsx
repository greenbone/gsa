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
import React from 'react';

import {hasValue} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

import Dialog from 'web/components/dialog/dialog';
import DialogFooter from 'web/components/dialog/footer';

const DialogNotification = ({
  title,
  message,
  onCloseClick,
  onClose = onCloseClick,
}) => {
  const [_] = useTranslation();

  if (!hasValue(message)) {
    return null;
  }
  return (
    <Dialog opened={true} size="400px" title={title} onClose={onClose}>
      {message}
      <DialogFooter
        title={_('Close')}
        onClick={onCloseClick}
        data-testid="dialog-notification-footer"
      />
    </Dialog>
  );
};

DialogNotification.propTypes = {
  message: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func,
};

export default DialogNotification;
