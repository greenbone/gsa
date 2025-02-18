/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Modal} from '@greenbone/opensight-ui-components-mantinev7';
import {ScrollArea} from '@mantine/core';
import {isDefined, isFunction} from 'gmp/utils/identity';
import {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/PropTypes';

const INITIAL_POSITION_X = 0;
const INITIAL_POSITION_Y = 70;
const MODAL_Z_INDEX = 201;
const MODAL_HEIGHT = '250px';
const MODAL_WIDTH = '40vw';

const DialogTitleButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  outline: none;
  cursor: ${({$isDragging}) => ($isDragging ? 'grabbing' : 'grab')};
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledModal = styled(Modal)`
  position: relative;
  left: ${({position}) => `${position.x}px`};
  z-index: ${MODAL_Z_INDEX};

  .mantine-Modal-content {
    display: flex;
    flex-direction: column;
    position: relative;
    resize: both;
    max-height: 90vh;
    min-width: 500px;
    min-height: ${({height}) => height};
    width: ${({width}) => width};
  }

  .mantine-Modal-title {
    flex: 1;
  }
  .mantine-Modal-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .mantine-Modal-close {
    width: 2rem;
    height: 2rem;
  }
`;

const StyledScrollArea = styled(ScrollArea)`
  flex: 1;
  overflow-y: auto;
  padding-right: 18px;
`;

const Dialog = ({
  children,
  title,
  footer,
  onClose,
  height = MODAL_HEIGHT,
  width = MODAL_WIDTH,
  testId = 'dialog-test-id',
}) => {
  const [isResizing, setIsResizing] = useState(false);

  const handleClose = useCallback(() => {
    if (isDefined(onClose)) {
      onClose();
    }
  }, [onClose]);

  const [position, setPosition] = useState({
    x: INITIAL_POSITION_X,
    y: INITIAL_POSITION_Y,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({x: 0, y: 0});

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isDragging]);

  const handleDragMouseDown = e => {
    if (
      e.target.closest('button') &&
      !e.target.closest('.dialog-title-button')
    ) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = e => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
    }
    if (isDragging) {
      setIsDragging(false);
    }
  };

  return (
    <StyledModal
      centered={false}
      data-testid={testId}
      height={height}
      opened={true}
      position={position}
      size="auto"
      title={
        <DialogTitleButton
          $isDragging={isDragging}
          className="dialog-title-button"
          type="button"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDragMouseDown(e);
            }
          }}
          onMouseDown={handleDragMouseDown}
        >
          {title}
        </DialogTitleButton>
      }
      width={width}
      yOffset={position.y}
      onClose={handleClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <StyledScrollArea>
        {isFunction(children)
          ? children({
              close: handleClose,
            })
          : children}
      </StyledScrollArea>
      {footer}
    </StyledModal>
  );
};

Dialog.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  testId: PropTypes.string,
  footer: PropTypes.node,
  title: PropTypes.string,
  width: PropTypes.string,
  onClose: PropTypes.func,
  height: PropTypes.string,
};

export default Dialog;
