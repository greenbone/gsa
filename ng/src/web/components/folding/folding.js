/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import React from 'react';

import {Div} from 'glamorous';

import {css} from 'glamor';

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes';

const foldDelay = css.keyframes({
  '0%': {minWidth: '0px'},
  '100%': {minWidth: '1px'},
});

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

const FoldStatePropType = PropTypes.oneOf([
  FoldState.UNFOLDED, FoldState.FOLDED, FoldState.FOLDING_START,
  FoldState.UNFOLDING_START, FoldState.FOLDING, FoldState.UNFOLDING,
]);

/**
 * HOC for making a container content component foldable
 */

export const withFolding = (Component, defaults = {}) => {
  const FoldingWrapper = ({
    foldState,
    style = {},
    onFoldStepEnd,
    onFoldToggle,
    ...props
  }) => {
    let height;
    let animation;
    let display;
    const window_height = Math.ceil(window.innerHeight * 1.2) + 'px';
    const styleProps = {...style};

    switch (foldState) {
      case FoldState.FOLDED:
        height = '0';
        display = 'none';
        break;
      case FoldState.UNFOLDED:
        height = '';
        break;
      case FoldState.UNFOLDING_START:
        height = '1px';
        animation = `${foldDelay} 0.01s`;
        break;
      case FoldState.FOLDING_START:
        height = window_height;
        animation = `${foldDelay} 0.01s`;
        break;
      case FoldState.UNFOLDING:
        height = window_height;
        break;
      case FoldState.FOLDING:
        height = '0';
        break;
      default:
        break;
    }

    if (is_defined(height)) {
      styleProps.maxHeight = height;
    }
    if (is_defined(animation)) {
      styleProps.animation = animation;
    }
    if (!is_defined(styleProps.overflow)) {
      styleProps.overflow = 'hidden';
    }
    if (!is_defined(styleProps.transition)) {
      styleProps.transition = '0.4s';
    }
    if (is_defined(display)) {
      styleProps.display = display;
    }

    return (
      <Div
        {...styleProps}
        onTransitionEnd={onFoldStepEnd}
        onAnimationEnd={onFoldStepEnd}
      >
        <Component
          {...props}
        />
      </Div>
    );
  };

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
      let newFoldState;

      switch (this.state.foldState) {
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

      this.setState({foldState: newFoldState});
    }

    handleFoldStepEnd() {
      let newFoldState;

      switch (this.state.foldState) {
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

      this.setState({foldState: newFoldState});
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
    };
  };

  FoldToggleWrapper.propTypes = {
    initialFoldState: FoldStatePropType,
  };

  return FoldToggleWrapper;
};

// vim: set ts=2 sw=2 tw=80:
