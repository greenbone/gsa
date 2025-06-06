/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useRef, useState, useEffect} from 'react';
import styled from 'styled-components';
import {isDefined, hasValue} from 'gmp/utils/identity';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const BadgeContainer = styled.div`
  position: relative;
  display: inline-flex;
  margin-right: ${props => props.$margin}px;
`;

BadgeContainer.displayName = 'BadgeContainer';

const BadgeIcon = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  font-size: 0.75em;
  font-weight: bold;
  border-radius: 50%;
  min-width: 10px;
  padding: 0.25em 0.5em;
  z-index: ${Theme.Layers.higher};
  background-color: ${({$backgroundColor = Theme.green}) => $backgroundColor};
  color: ${({$color = Theme.white}) => $color};
  top: ${({$position}) => ($position === 'top' ? '0' : 'auto')};
  bottom: ${({$position}) => ($position === 'bottom' ? '0' : 'auto')};
  right: 0;
  transform: translate(80%, -50%);
`;

BadgeIcon.displayName = 'BadgeIcon';

const Badge = props => {
  const icon = useRef();

  useEffect(() => {
    calcMargin();
  }, [props.content]);

  const [margin, setMargin] = useState(undefined);

  const calcMargin = () => {
    if (hasValue(icon.current)) {
      const {width} = icon.current.getBoundingClientRect();
      setMargin(width / 2);
    }
  };

  const {
    backgroundColor,
    children,
    color,
    content,
    dynamic = true,
    position,
  } = props;

  return (
    <BadgeContainer $margin={dynamic ? margin : undefined}>
      {children}

      {isDefined(content) && (
        <BadgeIcon
          ref={icon}
          $backgroundColor={backgroundColor}
          $color={color}
          $margin={dynamic ? margin : undefined}
          $position={position}
          data-testid="badge-icon"
        >
          {content}
        </BadgeIcon>
      )}
    </BadgeContainer>
  );
};

Badge.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.node,
  color: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dynamic: PropTypes.bool,
  position: PropTypes.oneOf(['bottom', 'top']),
};

export default Badge;
