/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled, {css, keyframes} from 'styled-components';
import Theme from 'web/utils/theme';

interface HaloDotProps {
  $animated?: boolean;
  $color?: string;
  $size?: string;
}

const pulse = keyframes`
  0% {
    opacity: 0.85;
    transform: scale(0.82);
    box-shadow: 0 0 0 0 ${Theme.green};
  }

  55% {
    opacity: 1;
    transform: scale(1.08);
    box-shadow: 0 0 0 7px transparent;
  }

  100% {
    opacity: 0.85;
    transform: scale(0.82);
    box-shadow: 0 0 0 9px transparent;
  }
`;

const HaloDot = styled.span<HaloDotProps>`
  display: inline-flex;
  width: ${({$size: size = '12px'}) => size};
  height: ${({$size: size = '12px'}) => size};
  border-radius: 50%;
  background: ${({$color: color = Theme.green}) => color};
  animation: ${({$animated: animated = true}) =>
    animated ? css`${pulse} 2.2s ease-out infinite` : 'none'};
  will-change: transform, box-shadow, opacity;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default HaloDot;
