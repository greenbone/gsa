/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import {DialogFooterLayout} from 'web/components/dialog/footer';

import Button from './button';

const StyledLayout = styled(DialogFooterLayout)`
  justify-content: space-between;
`;

const DialogTwoButtonFooter = ({
  leftButtonTitle = _('Cancel'),
  rightButtonTitle,
  onLeftButtonClick,
  onRightButtonClick,
  loading = false,
}) => (
  <StyledLayout align={['end', 'center']} shrink="0">
    <Button
      data-testid="dialog-close-button"
      disabled={loading}
      onClick={onLeftButtonClick}
      title={leftButtonTitle}
    >
      {leftButtonTitle}
    </Button>
    <Button
      data-testid="dialog-save-button"
      onClick={onRightButtonClick}
      title={rightButtonTitle}
      loading={loading}
    >
      {rightButtonTitle}
    </Button>
  </StyledLayout>
);

DialogTwoButtonFooter.propTypes = {
  leftButtonTitle: PropTypes.string,
  loading: PropTypes.bool,
  rightButtonTitle: PropTypes.string.isRequired,
  onLeftButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
};

export default DialogTwoButtonFooter;

// vim: set ts=2 sw=2 tw=80:
