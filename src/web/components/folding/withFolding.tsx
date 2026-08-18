/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import styled, {keyframes, css} from 'styled-components';
import {FoldState, type FoldStateType} from 'web/components/folding/Folding';
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
const withFolding = <TProps extends object>(
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

  return hoistStatics(
    updateDisplayName(FoldingWrapper, Component, 'withFolding'),
    Component,
  );
};

export default withFolding;
