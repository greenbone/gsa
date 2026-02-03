/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type ReactNode,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import {HelpIcon} from 'web/components/icon';
import Theme from 'web/utils/Theme';

export type ToggletipPosition = 'top' | 'bottom' | 'left' | 'right';

interface ToggletipProps {
  ariaLabel?: string;
  children: ReactNode;
  dataTestId?: string;
  id?: string;
  position?: ToggletipPosition;
  /** Refs to elements that should not close the toggletip when clicked */
  relatedRefs?: RefObject<HTMLElement>[];
}

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const HelpButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: ${Theme.mediumGray};
  margin-left: 6px;

  &:hover {
    color: ${Theme.blue};
  }
`;

const Backdrop = styled.div<{$isOpen: boolean}>`
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${Theme.Layers.onTop - 1};
  background: transparent;
  pointer-events: none;
`;

const positionStyles: Record<ToggletipPosition, string> = {
  top: `
    bottom: 100%;
    left: 0;
    margin-bottom: 8px;
  `,
  bottom: `
    top: 100%;
    left: 0;
    margin-top: 8px;
  `,
  left: `
    right: 100%;
    top: 0;
    margin-right: 8px;
  `,
  right: `
    left: 100%;
    top: 0;
    margin-left: 8px;
  `,
};

const Content = styled.output<{$isOpen: boolean; $position: ToggletipPosition}>`
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  position: absolute;
  padding: 12px;
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 4px;
  background: ${Theme.white};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 400px;
  max-width: 500px;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 12px;
  z-index: ${Theme.Layers.onTop};
  color: ${Theme.darkGray};

  ${props => positionStyles[props.$position]}

  &:focus {
    outline: none;
  }
`;

/**
 * Toggletip component - an accessible alternative to tooltips for touch devices
 * Displays information when a help button is clicked, dismissible via Escape or outside click
 */
const Toggletip = ({
  ariaLabel = 'More information',
  children,
  dataTestId,
  id = 'toggletip',
  position = 'top',
  relatedRefs = [],
}: ToggletipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLOutputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => setIsOpen(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't close if clicking on the toggletip itself
      if (containerRef.current?.contains(target)) {
        return;
      }

      // Don't close if clicking on a related element
      const isRelatedClick = relatedRefs.some(ref =>
        ref.current?.contains(target),
      );

      if (!isRelatedClick) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, relatedRefs]);

  return (
    <>
      <Backdrop $isOpen={isOpen} data-testid="toggletip-backdrop" />
      <Container
        ref={containerRef}
        data-testid={dataTestId}
        onKeyDown={handleKeyDown}
      >
        <HelpButton
          aria-controls={id}
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <HelpIcon aria-hidden />
        </HelpButton>

        <Content
          ref={contentRef}
          $isOpen={isOpen}
          $position={position}
          aria-live="polite"
          id={id}
          tabIndex={-1}
        >
          {children}
        </Content>
      </Container>
    </>
  );
};

export default Toggletip;
