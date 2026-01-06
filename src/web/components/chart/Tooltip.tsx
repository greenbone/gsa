/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {hasValue} from 'gmp/utils/identity';
import Portal from 'web/components/portal/Portal';
import Theme from 'web/utils/Theme';

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

interface ToolTipState {
  visible: boolean;
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

class ToolTip extends React.Component<ToolTipProps, ToolTipState> {
  target: React.RefObject<ToolTipTargetElement>;
  tooltip: React.RefObject<HTMLElement>;

  constructor(props: ToolTipProps) {
    super(props);

    this.state = {
      visible: false,
    };

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);

    this.target = React.createRef();
    this.tooltip = React.createRef();
  }

  show() {
    this.setState({visible: true});
  }

  hide() {
    this.setState({visible: false});
  }

  setPosition() {
    const target = this.target.current;
    const tooltip = this.tooltip.current;

    if (!hasValue(target) || !hasValue(tooltip)) {
      // ensure both refs have been set to not crash
      return;
    }

    const rect = target.getBoundingClientRect();
    const top = rect.top - tooltip.offsetHeight + window.scrollY;
    const left =
      rect.left + (rect.width - tooltip.offsetWidth) / 2 + window.scrollX;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  componentDidUpdate() {
    if (this.state.visible) {
      this.setPosition();
    }
  }

  render() {
    const {children, content} = this.props;
    const {visible} = this.state;
    return (
      <>
        {content && visible && (
          <Portal>
            <ToolTipDisplay ref={this.tooltip}>{content}</ToolTipDisplay>
          </Portal>
        )}
        {children({
          show: this.show,
          hide: this.hide,
          targetRef: this.target,
        })}
      </>
    );
  }
}

export default ToolTip;
