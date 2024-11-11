/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import {DialogFooterLayout} from 'web/components/dialog/footer';

import Button from 'web/components/form/button';

import useTranslation from 'web/hooks/useTranslation';

export const DELETE_ACTION = 'delete';

const DialogTwoButtonFooter = ({
  leftButtonTitle,
  rightButtonTitle,
  onLeftButtonClick,
  onRightButtonClick,
  loading = false,
  isLoading = loading,
  rightButtonAction,
}) => {
  const [_] = useTranslation();
  leftButtonTitle = leftButtonTitle || _('Cancel');
  const isRightButtonAction = DELETE_ACTION === rightButtonAction;
  return (
    <DialogFooterLayout align={['space-between', 'center']} shrink="0">
      <Button
        data-testid="dialog-close-button"
        disabled={isLoading}
        variant={isRightButtonAction ? 'default' : 'outline'}
        onClick={onLeftButtonClick}
      >
        {leftButtonTitle}
      </Button>
      <Button
        data-testid="dialog-save-button"
        onClick={onRightButtonClick}
        isLoading={isLoading}
        variant={isRightButtonAction ? 'danger' : 'filled'}
      >
        {rightButtonTitle}
      </Button>
    </DialogFooterLayout>
  );
};

DialogTwoButtonFooter.propTypes = {
  isLoading: PropTypes.bool,
  leftButtonTitle: PropTypes.string,
  loading: PropTypes.bool,
  rightButtonTitle: PropTypes.string.isRequired,
  onLeftButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
  rightButtonAction: PropTypes.oneOf([undefined, DELETE_ACTION]),
};

export default DialogTwoButtonFooter;

// vim: set ts=2 sw=2 tw=80:
