/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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
import ReactDOM from 'react-dom';

import glamorous from 'glamorous';

import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes';
import Theme from '../../utils/theme';

import Wrapper from '../layout/wrapper';
import withSubscription from '../../utils/withSubscription';

const Placeholder = glamorous.div(
  ({isSticky, height}) => (
    {
      paddingBottom: isSticky ? height + 'px' : 0,
    }
  ),
);

Placeholder.displayName = 'StickyPlaceholder';

const StickyWrapper = glamorous.div(
  ({isSticky}) => isSticky ? 'sticky' : undefined,
  ({isSticky, difference, left, width}) => isSticky ? {
    position: 'fixed',
    top: difference > 0 ? 0 : difference,
    left: left,
    width: width,
    transform: 'translateZ(0)',
    zIndex: Theme.Layers.aboveAll,
  } : {},
);

StickyWrapper.displayName = 'StickyWrapper';

class Sticky extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      isSticky: false,
    };

    this.handleContainerEvent = this.handleContainerEvent.bind(this);
  }

  componentWillMount() {
    const {subscribe} = this.props;

    this.unsubscribe = subscribe('sticky.changed', this.handleContainerEvent);
  }

  componentWillUnmount() {
    if (is_defined(this.unsubscribe)) {
      this.unsubscribe();
    }
  }

  handleContainerEvent({
    container,
    distanceFromTop,
    distanceFromBottom,
    eventSource,
  }) {

    const {
      bottomOffset = 0,
      topOffset = 0,
    } = this.props;

    let {isSticky} = this.state;

    const placeholderClientRect = this.placeholder.getBoundingClientRect();
    const contentClientRect = this.content.getBoundingClientRect();
    const calculatedHeight = contentClientRect.height;

    const bottomDifference = distanceFromBottom - bottomOffset -
      calculatedHeight;

    isSticky = distanceFromTop <= -topOffset &&
      distanceFromBottom > -bottomOffset;

    this.setState({
      isSticky,
      height: calculatedHeight,
      difference: bottomDifference,
      left: placeholderClientRect.left,
      width: placeholderClientRect.width,
    });
  };

  render() {
    const {
      children,
      ...props
    } = this.props;

    const {
      isSticky,
      height,
      difference,
      left,
      width,
    } = this.state;

    const element = React.cloneElement(
      children,
      {
        ref: content => this.content = ReactDOM.findDOMNode(content),
      },
    );

    return (
      <Wrapper>
        <Placeholder
          isSticky={isSticky}
          height={height}
          innerRef={ref => this.placeholder = ref}>
        </Placeholder>
        <StickyWrapper
          {...props}
          isSticky={isSticky}
          difference={difference}
          left={left}
          width={width}>
          {element}
        </StickyWrapper>
      </Wrapper>
    );
  }
}

Sticky.propTypes = {
  bottomOffset: PropTypes.number,
  subscribe: PropTypes.func.isRequired,
  topOffset: PropTypes.number,
};

export default withSubscription(Sticky);

// vim: set ts=2 sw=2 tw=80:
