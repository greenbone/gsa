/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled, {css, keyframes} from 'styled-components';
import {FoldState, type FoldStateType} from 'web/components/folding/Folding';

interface FoldableStyleProps {
  $foldState: FoldStateType;
}

export interface FoldableProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onAnimationEnd' | 'onTransitionEnd'
> {
  children?: React.ReactNode;
  foldState?: FoldStateType;
  onFoldStepEnd?: () => void;
}

const foldDelay = keyframes`
  0% {
    min-width: 0px;
  }
  100% {
    min-width: 1px;
  }
`;

const FoldableDiv = styled.div<FoldableStyleProps>`
  overflow: hidden;
  transition: height 0.4s;

  display: ${({$foldState}) =>
    $foldState === FoldState.FOLDED ? 'none' : 'block'};

  height: ${({$foldState}) => {
    switch ($foldState) {
      case FoldState.FOLDED:
      case FoldState.FOLDING:
        return '0px';
      case FoldState.FOLDING_START:
      case FoldState.UNFOLDING:
        return `${Math.ceil(window.innerHeight * 1.2)}px`;
      case FoldState.UNFOLDING_START:
        return '1px';
      default:
        return 'auto';
    }
  }};

  animation: ${({$foldState}) =>
    $foldState === FoldState.UNFOLDING_START ||
    $foldState === FoldState.FOLDING_START
      ? css`
          ${foldDelay} 0.01s
        `
      : 'none'};
`;

const Foldable = ({
  children,
  foldState = FoldState.UNFOLDED,
  onFoldStepEnd,
  ...props
}: FoldableProps) => (
  <FoldableDiv
    {...props}
    $foldState={foldState}
    onAnimationEnd={onFoldStepEnd}
    onTransitionEnd={onFoldStepEnd}
  >
    {children}
  </FoldableDiv>
);

export default Foldable;
