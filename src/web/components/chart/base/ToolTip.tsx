/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {hasValue} from 'gmp/utils/identity';
import Portal from 'web/components/portal/Portal';
import Theme from 'web/utils/theme';

type ToolTipDisplayProps = React.HTMLAttributes<HTMLDivElement>;
type ToolTipTargetElement = HTMLElement | SVGElement;
export type ToolTipRef = React.Ref<ToolTipTargetElement>;

interface ToolTipRenderProps {
  show: () => void;
  hide: () => void;
  targetRef?: ToolTipRef;
}

interface ToolTipProps {
  content?: React.ReactNode;
  children: (args: ToolTipRenderProps) => React.ReactNode;
}

const ToolTipText = styled.div`
  box-sizing: border-box;
  max-width: min(320px, calc(100vw - 24px));
  padding: 8px 11px;
  background: ${Theme.white};
  border: 1px solid ${Theme.mediumDarkGray};
  border-left: 3px solid ${Theme.darkGreen};
  border-radius: 4px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 18%);
  color: ${Theme.black};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

ToolTipText.displayName = 'ToolTipText';

const ToolTipContainer = styled.div`
  position: absolute;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 24px);
  z-index: ${Theme.Layers.onTop};
`;

ToolTipContainer.displayName = 'ToolTipContainer';

const ToolTipDisplay = React.forwardRef(
  ({children, ...props}: ToolTipDisplayProps, ref: React.Ref<HTMLElement>) => (
    <ToolTipContainer ref={ref as React.RefObject<HTMLDivElement>} {...props}>
      <ToolTipText>{children}</ToolTipText>
    </ToolTipContainer>
  ),
);

const ToolTip = ({children, content}: ToolTipProps) => {
  const [visible, setVisible] = useState(false);
  const target = useRef<ToolTipTargetElement | null>(null);
  const tooltip = useRef<HTMLElement | null>(null);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  const setTarget = (element: ToolTipTargetElement | null) => {
    target.current = element;
    if (element) {
      element.style.cursor = 'pointer';
    }
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    const targetElement = target.current;
    const tooltipElement = tooltip.current;
    if (!hasValue(targetElement) || !hasValue(tooltipElement)) {
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const top = rect.top - tooltipElement.offsetHeight + window.scrollY;
    const centeredLeft =
      rect.left +
      (rect.width - tooltipElement.offsetWidth) / 2 +
      window.scrollX;
    const maxLeft = window.innerWidth - tooltipElement.offsetWidth - 12;
    const left = Math.min(
      maxLeft + window.scrollX,
      Math.max(12 + window.scrollX, centeredLeft),
    );

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
  }, [visible]);

  return (
    <>
      {content && visible && (
        <Portal>
          <ToolTipDisplay ref={tooltip}>{content}</ToolTipDisplay>
        </Portal>
      )}
      {children({show, hide, targetRef: setTarget})}
    </>
  );
};

export default ToolTip;
