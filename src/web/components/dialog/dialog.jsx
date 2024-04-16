/* Copyright (C) 2016-2022 Greenbone AG
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

import {Modal} from '@greenbone/opensight-ui-components';

import {isDefined, isFunction} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

const DEFAULT_DIALOG_WIDTH = '800px';

const Dialog = ({children, title, width = DEFAULT_DIALOG_WIDTH, onClose}) => {
  const handleClose = useCallback(() => {
    if (isDefined(onClose)) {
      onClose();
    }
  }, [onClose]);

  return (
    <Modal opened={true} size={width} title={title} onClose={handleClose}>
      {isFunction(children)
        ? children({
            close: handleClose,
          })
        : children}
    </Modal>
  );
};

Dialog.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  title: PropTypes.string,
  width: PropTypes.string,
  onClose: PropTypes.func,
};

export default Dialog;
