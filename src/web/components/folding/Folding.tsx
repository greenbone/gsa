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

interface FoldToggleProps {
  initialFoldState?: FoldStateType;
}

export interface FoldToggleComponentProps {
  foldState: FoldStateType;
  onFoldStepEnd: () => void;
  onFoldToggle: () => void;
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

/**
 * HOC to add fold parent functionality to a component.
 */

export const withFoldToggle = <TProps extends FoldToggleComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  type PublicProps = Omit<TProps, keyof FoldToggleComponentProps> &
    FoldToggleProps;

  class FoldToggleWrapper extends React.Component<
    PublicProps,
    {foldState: FoldStateType}
  > {
    constructor(props: PublicProps) {
      super(props);

      const {initialFoldState = FoldState.UNFOLDED} = props;

      this.state = {
        foldState: initialFoldState,
      };

      this.handleFoldStepEnd = this.handleFoldStepEnd.bind(this);
      this.handleFoldToggle = this.handleFoldToggle.bind(this);
    }

    handleFoldToggle() {
      this.setState(({foldState}) => {
        let newFoldState: FoldStateType;

        switch (foldState) {
          case FoldState.FOLDED:
            newFoldState = FoldState.UNFOLDING_START;
            break;
          case FoldState.UNFOLDED:
            newFoldState = FoldState.FOLDING_START;
            break;
          case FoldState.UNFOLDING_START:
            newFoldState = FoldState.FOLDED;
            break;
          case FoldState.FOLDING_START:
            newFoldState = FoldState.UNFOLDED;
            break;
          case FoldState.UNFOLDING:
            newFoldState = FoldState.FOLDING;
            break;
          case FoldState.FOLDING:
            newFoldState = FoldState.UNFOLDING;
            break;
          default:
            newFoldState = FoldState.UNFOLDED;
        }
        return {foldState: newFoldState};
      });
    }

    handleFoldStepEnd() {
      this.setState(({foldState}) => {
        let newFoldState: FoldStateType;

        switch (foldState) {
          case FoldState.FOLDED:
            newFoldState = FoldState.FOLDED;
            break;
          case FoldState.UNFOLDED:
            newFoldState = FoldState.UNFOLDED;
            break;
          case FoldState.UNFOLDING_START:
            newFoldState = FoldState.UNFOLDING;
            break;
          case FoldState.FOLDING_START:
            newFoldState = FoldState.FOLDING;
            break;
          case FoldState.UNFOLDING:
            newFoldState = FoldState.UNFOLDED;
            break;
          case FoldState.FOLDING:
            newFoldState = FoldState.FOLDED;
            break;
          default:
            newFoldState = FoldState.UNFOLDED;
        }
        return {foldState: newFoldState};
      });
    }

    render() {
      const {...other} = this.props;
      const {foldState} = this.state;
      const componentProps = {
        ...(other as Omit<TProps, keyof FoldToggleComponentProps>),
        foldState,
        onFoldStepEnd: this.handleFoldStepEnd,
        onFoldToggle: this.handleFoldToggle,
      } as TProps;

      return <Component {...componentProps} />;
    }
  }

  return FoldToggleWrapper;
};
