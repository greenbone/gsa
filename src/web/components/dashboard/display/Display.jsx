/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import DialogCloseButton from 'web/components/dialog/DialogCloseButton';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

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
  background-color: ${Theme.lightGray};
  border: 1px solid ${Theme.lightGray};
  color: ${Theme.black};
  text-overflow: ellipsis;
  padding: 0px 5px;
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
  const [_] = useTranslation();
  return (
    <DisplayView>
      <HeaderContainer {...dragHandleProps}>
        <Header>
          <HeaderContent>
            <DisplayTitle>{title}</DisplayTitle>
            <DialogCloseButton
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
