/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import DialogCloseButton from 'web/components/dialog/DialogCloseButton';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import Loading from 'web/components/loading/Loading';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

export interface DisplayProps {
  children: React.ReactNode;
  dragHandleProps?: Record<string, unknown>;
  title?: string;
  onRemoveClick: () => void;
  isLoading?: boolean;
}

export const DISPLAY_HEADER_HEIGHT = 20;
export const DISPLAY_BORDER_WIDTH = 2;

const HeaderContainer = styled.div`
  position: relative;
  z-index: ${Theme.Layers.higher};
  height: ${DISPLAY_HEADER_HEIGHT}px;
  display: flex;
  flex-shrink: 0;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
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
  position: relative;
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

const DisplayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Theme.white};
  z-index: ${Theme.Layers.aboveAll};
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

const Display = (props: DisplayProps) => {
  const {children, dragHandleProps, title, onRemoveClick, isLoading} = props;
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
      {isLoading && (
        <DisplayOverlay>
          <Loading />
        </DisplayOverlay>
      )}
    </DisplayView>
  );
};

export default Display;
