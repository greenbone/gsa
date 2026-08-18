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
  font-weight: bold;
  padding: 3px;
  background: ${Theme.darkGray};
  color: ${Theme.white};
  border-radius: 2px;
  line-height: 1;
`;

ToolTipText.displayName = 'ToolTipText';

const ToolTipArrow = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  line-height: 1;
  font-size: 10px;
  color: ${Theme.darkGray};
`;

ToolTipArrow.displayName = 'ToolTipArrow';

const ToolTipContainer = styled.div`
  position: absolute;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  z-index: ${Theme.Layers.onTop};
`;

ToolTipContainer.displayName = 'ToolTipContainer';

const ToolTipDisplay = React.forwardRef(
  ({children, ...props}: ToolTipDisplayProps, ref: React.Ref<HTMLElement>) => (
    <ToolTipContainer ref={ref as React.RefObject<HTMLDivElement>} {...props}>
      <ToolTipText>{children}</ToolTipText>
      <ToolTipArrow>▼</ToolTipArrow>
    </ToolTipContainer>
  ),
);

const ToolTip = ({children, content}: ToolTipProps) => {
  const [visible, setVisible] = useState(false);
  const target = useRef<ToolTipTargetElement | null>(null);
  const tooltip = useRef<HTMLElement | null>(null);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

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
    const left =
      rect.left +
      (rect.width - tooltipElement.offsetWidth) / 2 +
      window.scrollX;

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
      {children({show, hide, targetRef: target})}
    </>
  );
};

export default ToolTip;
