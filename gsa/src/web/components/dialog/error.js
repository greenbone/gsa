/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import Layout from 'web/components/layout/layout';

import CloseButton from './closebutton';

const StyledLayout = styled(Layout)`
  padding: 15px;
  margin: 0px 15px 20px 15px;
  border: 1px solid ${Theme.mediumLightRed};
  border-radius: 2px;
  color: ${Theme.darkRed};
  background-color: ${Theme.lightRed};
`;

const DialogCloseButton = styled(CloseButton)`
  border: 1px solid ${Theme.lightRed};
  background: 0;
  color: ${Theme.darkRed};

  :hover {
    border: 1px solid ${Theme.darkRed};
    background: 0;
    color: ${Theme.black};
    opacity: 0.5;
  }
`;

const DialogError = ({error, onCloseClick}) => {
  if (!isDefined(error)) {
    return null;
  }
  return (
    <StyledLayout align={['space-between', 'center']}>
      <span>{error}</span>
      <DialogCloseButton onClick={onCloseClick} title={_('Close')} />
    </StyledLayout>
  );
};

DialogError.propTypes = {
  error: PropTypes.string,
  onCloseClick: PropTypes.func,
};

export default DialogError;

// vim: set ts=2 sw=2 tw=80:
