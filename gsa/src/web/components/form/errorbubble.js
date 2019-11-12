/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import React, {useEffect, useRef} from 'react';

import styled from 'styled-components';

import {hasValue} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Portal from 'web/components/portal/portal';

const BubbleText = styled.div`
  width: 200px;
  border-radius: 15px;
  background: ${Theme.green};
  color: #fff;
  padding: 8px;
  text-align: center;
  font-weight: 900;
  position: relative;
  ::before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-left: 15px solid transparent;
    border-right: 15px solid ${Theme.green};
    border-top: 15px solid ${Theme.green};
    border-bottom: 15px solid transparent;
    left: -16px;
    top: 0px;
  }
`;

BubbleText.displayName = 'BubbleText';

const BubbleContainer = styled.div`
  position: absolute;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  z-index: ${Theme.Layers.menu};
`;

BubbleContainer.displayName = 'BubbleContainer';

const BubbleDisplay = React.forwardRef(({children, ...props}, ref) => (
  <BubbleContainer ref={ref} {...props}>
    <BubbleText>{children}</BubbleText>
  </BubbleContainer>
));

const ErrorBubble = ({visible, ...props}) => {
  const target = useRef();
  const bubble = useRef();

  function setPosition() {
    const targetRef = target.current;
    const bubbleRef = bubble.current;

    if (!hasValue(targetRef) || !hasValue(bubbleRef)) {
      // ensure both refs have been set to not crash
      return;
    }

    const rect = targetRef.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const left = rect.left + 16 + rect.width + window.scrollX;

    bubbleRef.style.top = `${top}px`;
    bubbleRef.style.left = `${left}px`;
  }

  useEffect(() => {
    setPosition();
  }, [visible, props]);

  const {children, content} = props;

  return (
    <React.Fragment>
      {content && visible && (
        <Portal>
          <BubbleDisplay data-testid="error-bubble" ref={bubble}>
            {content}
          </BubbleDisplay>
        </Portal>
      )}
      {children({
        targetRef: target,
      })}
    </React.Fragment>
  );
};

ErrorBubble.propTypes = {
  children: PropTypes.func.isRequired,
  content: PropTypes.elementOrString,
  visible: PropTypes.bool,
};

export default ErrorBubble;
