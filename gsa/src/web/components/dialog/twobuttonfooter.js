/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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
