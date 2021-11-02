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

import Theme from 'web/utils/theme';
import PropTypes from 'web/utils/proptypes';

import CloseButton from 'web/components/dialog/closebutton';

import ErrorBoundary from 'web/components/error/errorboundary';

export const DISPLAY_HEADER_HEIGHT = 20;
export const DISPLAY_BORDER_WIDTH = 2;

/*
 * Position the Menu relative to this element
 *
 * This allows to not consider the padding and border of the Header
 */
const HeaderContainer = styled.div`
  position: relative;
  z-index: ${Theme.Layers.higher};
  height: ${DISPLAY_HEADER_HEIGHT}px;
  display: flex;
  flex-shrink: 0;
`;

const Header = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  background-color: ${Theme.green};
  border: 1px solid ${Theme.mediumGray};
  color: ${Theme.white};
  text-overflow: ellipsis;
  padding: 0px 5px;
  font-weight: bold;
  user-select: none;
  overflow: hidden;
`;

const HeaderContent = styled.div`
  display: flex;
  padding: 1px 0;
  flex-grow: 1;
  flex-shrink: 1;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
`;

const DisplayView = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  background-color: ${Theme.white};
  box-shadow: 5px 5px 10px ${Theme.lightGray};
`;

const DisplayContent = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  border-left: 1px solid ${Theme.lightGray};
  border-right: 1px solid ${Theme.lightGray};
  border-bottom: 1px solid ${Theme.lightGray};
  overflow: hidden;
`;

const DisplayTitle = styled.div`
  display: block;
  flex-grow: 1;
  flex-shrink: 1;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
`;

const Display = ({children, dragHandleProps, title, onRemoveClick}) => {
  return (
    <DisplayView>
      <HeaderContainer {...dragHandleProps}>
        <Header>
          <HeaderContent>
            <DisplayTitle>{title}</DisplayTitle>
            <CloseButton
              size="small"
              title={_('Remove')}
              onClick={onRemoveClick}
            />
          </HeaderContent>
        </Header>
      </HeaderContainer>
      <DisplayContent>
        <ErrorBoundary message={_('An error occurred in this chart.')}>
          {children}
        </ErrorBoundary>
      </DisplayContent>
    </DisplayView>
  );
};

Display.propTypes = {
  dragHandleProps: PropTypes.object,
  title: PropTypes.string,
  onRemoveClick: PropTypes.func.isRequired,
};

export default Display;

// vim: set ts=2 sw=2 tw=80:
