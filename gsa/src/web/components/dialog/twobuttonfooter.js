/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {DialogFooterLayout} from 'web/components/dialog/footer';

import PropTypes from 'web/utils/proptypes';

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
