/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from 'gmp/locale';

import Theme from '../../../utils/theme';
import PropTypes from '../../../utils/proptypes';

import CloseButton from '../../dialog/closebutton';

export const DISPLAY_HEADER_HEIGHT = 20;

/*
 * Position the Menu relative to this element
 *
 * This allows to not consider the padding and border of the Header
 */
const HeaderContainer = glamorous.div('display-header-container', {
  position: 'relative',
  zIndex: Theme.Layers.higher,
  height: DISPLAY_HEADER_HEIGHT + 'px',
  display: 'flex',
  flexShrink: 0,
});

const Header = glamorous.div('display-header', {
  display: 'flex',
  flexGrow: 1,
  flexShrink: 1,
  backgroundColor: Theme.green,
  border: '1px solid ' + Theme.darkGreen,
  color: 'white',
  textOverflow: 'ellipsis',
  padding: '0px 5px',
  fontWeight: 'bold',
  userSelect: 'none',
  overflow: 'hidden',
});

const HeaderContent = glamorous.div('display-header-content', {
  display: 'flex',
  padding: '1px 0',
  flexGrow: 1,
  flexShrink: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
  overflow: 'hidden',
});

const DisplayView = glamorous.div('display-view', {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  backgroundColor: Theme.dialogGray,
  overflow: 'hidden',
});

const DisplayContent = glamorous.div('display-content', {
  display: 'flex',
  flexGrow: 1,
  flexShrink: 1,
});

const DisplayTitle = glamorous.div('display-title', {
  display: 'block',
  flexGrow: 1,
  flexShrink: 1,
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  textAlign: 'center',
});

const Display = ({
  children,
  dragHandleProps,
  menu,
  title,
  onRemoveClick,
}) => {
  return (
    <DisplayView>
      <HeaderContainer {...dragHandleProps}>
        <Header>
          {menu}
          <HeaderContent>
            <DisplayTitle>
              {title}
            </DisplayTitle>
            <CloseButton
              size="small"
              title={_('Remove')}
              onClick={onRemoveClick}
            />
          </HeaderContent>
        </Header>
      </HeaderContainer>
      <DisplayContent>
        {children}
      </DisplayContent>
    </DisplayView>
  );
};

Display.propTypes = {
  dragHandleProps: PropTypes.object,
  menu: PropTypes.element,
  title: PropTypes.string,
  onRemoveClick: PropTypes.func.isRequired,
};

export default Display;

// vim: set ts=2 sw=2 tw=80:
