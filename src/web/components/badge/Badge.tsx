/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useRef, useState, useEffect, ReactNode} from 'react';
import styled from 'styled-components';
import {isDefined, hasValue} from 'gmp/utils/identity';
import Theme from 'web/utils/Theme';

interface BadgeContainerProps {
  $margin?: number;
}

interface BadgeIconProps {
  $backgroundColor?: string;
  $color?: string;
  $margin?: number;
  $position?: 'top' | 'bottom';
}

interface BadgeProps {
  backgroundColor?: string;
  children?: ReactNode;
  color?: string;
  content?: string | number;
  dynamic?: boolean;
  position?: 'top' | 'bottom';
}

const BadgeContainer = styled.div<BadgeContainerProps>`
  position: relative;
  display: inline-flex;
  margin-right: ${props => props.$margin}px;
`;

BadgeContainer.displayName = 'BadgeContainer';

const BadgeIcon = styled.span<BadgeIconProps>`
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

const Badge = ({
  backgroundColor,
  children,
  color,
  content,
  dynamic = true,
  position,
}: BadgeProps) => {
  const badgeIconRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    calcMargin();
  }, [content]);

  const [margin, setMargin] = useState<number | undefined>(undefined);

  const calcMargin = () => {
    if (hasValue(badgeIconRef.current)) {
      const {width} = badgeIconRef.current.getBoundingClientRect();
      setMargin(width / 2);
    }
  };

  return (
    <BadgeContainer $margin={dynamic ? margin : undefined}>
      {children}

      {isDefined(content) && (
        <BadgeIcon
          ref={badgeIconRef}
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

export default Badge;
