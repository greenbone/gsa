/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled, {keyframes, css} from 'styled-components';
import PropTypes from 'web/utils/PropTypes';

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
};

const foldDelay = keyframes`
  0% {
    min-width: 0px;
  }
  100% {
    min-width: 1px;
  }
`;

const FoldableDiv = styled.div`
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

const FoldStatePropType = PropTypes.oneOf([
  FoldState.UNFOLDED,
  FoldState.FOLDED,
  FoldState.FOLDING_START,
  FoldState.UNFOLDING_START,
  FoldState.FOLDING,
  FoldState.UNFOLDING,
]);

/**
 * HOC for making a container content component foldable
 */

export const withFolding = Component => {
  const FoldingWrapper = ({foldState, onFoldStepEnd, ...props}) => (
    <FoldableDiv
      $foldState={foldState}
      onAnimationEnd={onFoldStepEnd}
      onTransitionEnd={onFoldStepEnd}
    >
      <Component {...props} />
    </FoldableDiv>
  );

  FoldingWrapper.propTypes = {
    foldState: FoldStatePropType,
    style: PropTypes.object,
    onFoldStepEnd: PropTypes.func,
    onFoldToggle: PropTypes.func,
  };

  return FoldingWrapper;
};

/**
 * HOC to add fold parent functionality to a component.
 */

export const withFoldToggle = Component => {
  class FoldToggleWrapper extends React.Component {
    constructor(...args) {
      super(...args);

      const {initialFoldState = FoldState.UNFOLDED} = this.props;

      this.state = {
        foldState: initialFoldState,
      };

      this.handleFoldStepEnd = this.handleFoldStepEnd.bind(this);
      this.handleFoldToggle = this.handleFoldToggle.bind(this);
    }

    handleFoldToggle() {
      this.setState(({foldState}) => {
        let newFoldState;

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
        let newFoldState;

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

      return (
        <Component
          foldState={foldState}
          onFoldStepEnd={this.handleFoldStepEnd}
          onFoldToggle={this.handleFoldToggle}
          {...other}
        />
      );
    }
  }

  FoldToggleWrapper.propTypes = {
    initialFoldState: FoldStatePropType,
  };

  return FoldToggleWrapper;
};
