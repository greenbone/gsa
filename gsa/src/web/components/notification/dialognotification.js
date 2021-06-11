/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {hasValue} from 'gmp/utils/identity';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogFooter from 'web/components/dialog/footer';
import DialogTitle from 'web/components/dialog/title';
import ScrollableContent from 'web/components/dialog/scrollablecontent';

import PropTypes from 'web/utils/proptypes';

const DialogNotification = ({title, message, onCloseClick}) =>
  hasValue(message) ? (
    <Dialog width="400px" onClose={onCloseClick}>
      {({close, moveProps, heightProps}) => (
        <DialogContent>
          <DialogTitle title={title} onCloseClick={close} {...moveProps} />
          <ScrollableContent
            {...heightProps}
            data-testid="dialog-notification-message"
          >
            {message}
          </ScrollableContent>
          <DialogFooter
            title={_('Close')}
            onClick={close}
            data-testid="dialog-notification-footer"
          />
        </DialogContent>
      )}
    </Dialog>
  ) : null;

DialogNotification.propTypes = {
  message: PropTypes.string,
  title: PropTypes.string,
  onCloseClick: PropTypes.func,
};

export default DialogNotification;

// vim: set ts=2 sw=2 tw=80:
