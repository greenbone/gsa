/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled, {keyframes, css} from 'styled-components';
import {updateDisplayName} from 'web/utils/display-name';

interface FoldStatefulProps {
  foldState?: FoldStateType;
  onFoldStepEnd?: () => void;
  onFoldToggle?: () => void;
  style?: React.CSSProperties;
}

interface FoldableDivProps {
  $foldState: FoldStateType;
}

export type FoldStateType = (typeof FoldState)[keyof typeof FoldState];

/**
 * State used in foldable components
 */
export const FoldState = {
  UNFOLDED: 'UNFOLDED',
  FOLDED: 'FOLDED',
  FOLDING_START: 'FOLDING_START',
  UNFOLDING_START: 'UNFOLDING_START',
  FOLDING: 'FOLDING',
  UNFOLDING: 'UNFOLDING',
} as const;

const foldDelay = keyframes`
  0% {
    min-width: 0px;
  }
  100% {
    min-width: 1px;
  }
`;

const FoldableDiv = styled.div<FoldableDivProps>`
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

/**
 * HOC for making a container content component foldable
 */
export const withFolding = <TProps extends {}>(
  Component: React.ComponentType<TProps>,
) => {
  const FoldingWrapper = ({
    foldState = FoldState.UNFOLDED,
    onFoldStepEnd,
    ...props
  }: TProps & FoldStatefulProps) => (
    <FoldableDiv
      $foldState={foldState}
      onAnimationEnd={onFoldStepEnd}
      onTransitionEnd={onFoldStepEnd}
    >
      <Component {...(props as TProps)} />
    </FoldableDiv>
  );

  return updateDisplayName(FoldingWrapper, Component, 'withFolding');
};
