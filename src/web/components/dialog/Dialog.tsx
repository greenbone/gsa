/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {ScrollArea} from '@mantine/core';
import {Modal} from '@greenbone/ui-lib';
import styled from 'styled-components';
import {isDefined, isFunction} from 'gmp/utils/identity';

interface DialogTitleButtonProps {
  $isDragging: boolean;
}

interface StyledModalProps {
  position: {x: number; y: number};
  height: string;
  width: string;
}

interface DialogRenderProps {
  close: () => void;
}

interface DialogProps {
  children?: React.ReactNode | ((props: DialogRenderProps) => React.ReactNode);
  title?: string;
  footer?: React.ReactNode;
  onClose?: () => void;
  height?: string;
  width?: string;
  testId?: string;
}

const INITIAL_POSITION_X = 0;
const INITIAL_POSITION_Y = 70;
const MODAL_Z_INDEX = 201;
const MODAL_HEIGHT = '250px';
const MODAL_WIDTH = '40vw';

const DialogTitleButton = styled.button<DialogTitleButtonProps>`
  background: none;
  border: none;
  padding: 0;
  outline: none;
  cursor: ${({$isDragging}) => ($isDragging ? 'grabbing' : 'grab')};
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledModal = styled(Modal)<StyledModalProps>`
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
}: DialogProps) => {
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

  useLayoutEffect(() => {
    const applyStyles = () => {
      const modalRoots = document.querySelectorAll(
        '[data-portal="true"] > div > .mantine-Modal-root',
      );
      modalRoots.forEach((modalRoot, index) => {
        const overlay = modalRoot.querySelector<HTMLElement>(
          '.mantine-Modal-overlay',
        );
        if (overlay) {
          const isTopmostModal = index === modalRoots.length - 1;
          overlay.style.backgroundColor = isTopmostModal
            ? 'rgba(0, 0, 0, 0.6)'
            : 'transparent';
        }
      });
    };

    applyStyles();

    const observer = new MutationObserver(() => {
      const portals = document.querySelectorAll('[data-portal="true"]');
      if (portals.length > 0) {
        applyStyles();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => observer.disconnect();
  }, []);

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

export default Dialog;
