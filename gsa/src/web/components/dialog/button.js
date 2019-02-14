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

import styled from 'styled-components';

import Button from 'web/components/form/button';

import Theme from 'web/utils/theme';

const DialogButton = styled(Button)`
  border: 1px solid ${Theme.mediumGray};
  color: ${props => (props.loading ? 'rgba(0, 0, 0, 0.0)' : Theme.darkGreen)};
  background: ${props =>
    props.loading
      ? Theme.lightGreen + ' url(/img/loading.gif) center center no-repeat'
      : Theme.lightGreen};

  /* when hovering these settings have to be overwritten explicitly */
  :hover {
    color: ${props => (props.loading ? 'rgba(0, 0, 0, 0.0)' : Theme.white)};
    background: ${props =>
      props.loading
        ? Theme.green + ' url(/img/loading.gif) center center no-repeat'
        : Theme.darkGreen};
  }
`;

export default DialogButton;

// vim: set ts=2 sw=2 tw=80:
