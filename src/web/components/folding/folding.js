/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import styled, {keyframes, css} from 'styled-components';

import PropTypes from 'web/utils/proptypes';

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
  0%: {
    min-width: 0px;
  }
  100%: {
    min-width: 1px;
  }
`;

const Div = styled.div`
  overflow: hidden;
  transition: 0.4s;

  display: ${({foldState}) =>
    foldState === FoldState.FOLDED ? 'none' : undefined};

  height: ${({foldState}) => {
    if (foldState === FoldState.FOLDED || foldState === FoldState.FOLDING) {
      return 0;
    }
    if (
      foldState === FoldState.FOLDING_START ||
      foldState === FoldState.UNFOLDING
    ) {
      const windowHeight = Math.ceil(window.innerHeight * 1.2) + 'px';
      return windowHeight;
    }
    if (foldState === FoldState.UNFOLDING_START) {
      return '1px';
    }
    return undefined;
  }};

  animation: ${({foldState}) =>
    foldState === FoldState.UNFOLDING_START ||
    foldState === FoldState.FOLDING_START
      ? css`
          ${foldDelay} 0.01s
        `
      : undefined};
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

export const withFolding = (Component, defaults = {}) => {
  const FoldingWrapper = ({
    foldState,
    onFoldStepEnd,
    onFoldToggle,
    ...props
  }) => (
    <Div
      foldState={foldState}
      onTransitionEnd={onFoldStepEnd}
      onAnimationEnd={onFoldStepEnd}
    >
      <Component {...props} />
    </Div>
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
          onFoldToggle={this.handleFoldToggle}
          onFoldStepEnd={this.handleFoldStepEnd}
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

// vim: set ts=2 sw=2 tw=80:
