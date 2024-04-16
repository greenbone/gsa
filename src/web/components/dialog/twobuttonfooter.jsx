/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import {DialogFooterLayout} from 'web/components/dialog/footer';

import Button from 'web/components/form/button';

const DialogTwoButtonFooter = ({
  leftButtonTitle = _('Cancel'),
  rightButtonTitle,
  onLeftButtonClick,
  onRightButtonClick,
  loading = false,
  isLoading = loading,
}) => (
  <DialogFooterLayout align={['end', 'center']} shrink="0" gap="10px">
    <Button
      data-testid="dialog-close-button"
      disabled={isLoading}
      variant="outline"
      onClick={onLeftButtonClick}
    >
      {leftButtonTitle}
    </Button>
    <Button
      data-testid="dialog-save-button"
      onClick={onRightButtonClick}
      isLoading={isLoading}
    >
      {rightButtonTitle}
    </Button>
  </DialogFooterLayout>
);

DialogTwoButtonFooter.propTypes = {
  isLoading: PropTypes.bool,
  leftButtonTitle: PropTypes.string,
  loading: PropTypes.bool,
  rightButtonTitle: PropTypes.string.isRequired,
  onLeftButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
};

export default DialogTwoButtonFooter;

// vim: set ts=2 sw=2 tw=80:
