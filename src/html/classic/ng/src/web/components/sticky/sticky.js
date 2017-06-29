/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import PropTypes from '../../utils/proptypes.js';

const Placeholder = glamorous.div(
  ({isSticky, height}) => (
    {
      paddingBottom: isSticky ? height + 'px' : 0,
    }
  ),
);

const Wrapper = glamorous.div(
  ({isSticky}) => isSticky ? 'sticky' : undefined,
  ({isSticky, difference, left, width}) => isSticky ? {
    position: 'fixed',
    top: difference > 0 ? 0 : difference,
    left: left,
    width: width,
    transform: 'translateZ(0)',
    zIndex: 20,
  } : {},
);

class Sticky extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      isSticky: false,
    };

    this.handleContainerEvent = this.handleContainerEvent.bind(this);
  }

  componentWillMount() {
    const {subscribe} = this.context;

    subscribe(this.handleContainerEvent);
  }

  componentWillUnmount() {
    const {unsubscribe} = this.context;

    unsubscribe(this.handleContainerEvent);
  }

  handleContainerEvent({
    container,
    distanceFromTop,
    distanceFromBottom,
    eventSource
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
    let {
      children,
      ...props,
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
      <div>
        <Placeholder
          isSticky={isSticky}
          height={height}
          innerRef={ref => this.placeholder = ref}>
        </Placeholder>
        <Wrapper
          {...props}
          isSticky={isSticky}
          difference={difference}
          left={left}
          width={width}>
          {element}
        </Wrapper>
      </div>
    );
  }
}

Sticky.propTypes = {
  bottomOffset: PropTypes.number,
  topOffset: PropTypes.number,
};

Sticky.contextTypes = {
  subscribe: PropTypes.func.isRequired,
  unsubscribe: PropTypes.func.isRequired,
};


export default Sticky;

// vim: set ts=2 sw=2 tw=80:
