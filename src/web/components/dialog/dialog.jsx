/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';

import {Modal} from '@greenbone/opensight-ui-components-mantinev7';

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
    <Modal
      data-testid="dialog-title-bar"
      opened={true}
      size={width}
      title={title}
      onClose={handleClose}
    >
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
