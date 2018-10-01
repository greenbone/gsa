/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
  color: ${props => props.loading ? 'rgba(0, 0, 0, 0.0)' : Theme.darkGray};
  background: ${props => props.loading ?
    Theme.lightGray + ' url(/img/loading.gif) center center no-repeat' :
    Theme.lightGray
  };

  /* when hovering these settings have to be overwritten explicitly */
  :hover {
    color: ${props => props.loading ? 'rgba(0, 0, 0, 0.0)' : Theme.white};
    background: ${props => props.loading ?
      Theme.lightGreen + ' url(/img/loading.gif) center center no-repeat' :
      Theme.green
    };
  };
`;

export default DialogButton;

// vim: set ts=2 sw=2 tw=80:
