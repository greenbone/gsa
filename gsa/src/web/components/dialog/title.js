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
import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Layout from 'web/components/layout/layout';

import DialogCloseButton from './closebutton';

const DialogTitleBar = styled(Layout)`
  padding: 5px 5px 5px 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  border: 1px solid ${Theme.darkGreen};
  color: ${Theme.white};
  font-weight: bold;
  background: ${Theme.green};
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  cursor: move;
`;

const DialogTitle = ({
  showClose = true,
  title,
  onCloseClick,
  onMouseDown,
}) => {
  return (
    <DialogTitleBar
      align={['space-between', 'center']}
      onMouseDown={onMouseDown}
    >
      <span>{title}</span>
      {showClose &&
        <DialogCloseButton
          title={_('Close')}
          onClick={onCloseClick}
        />
      }
    </DialogTitleBar>
  );
};

DialogTitle.propTypes = {
  showClose: PropTypes.bool,
  title: PropTypes.string,
  onCloseClick: PropTypes.func,
  onMouseDown: PropTypes.func,
};

export default DialogTitle;

// vim: set ts=2 sw=2 tw=80:
