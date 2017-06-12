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

import {classes} from '../../utils.js';

import PropTypes from '../proptypes.js';

class Sticky extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      isSticky: false,
      style: {},
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

    distanceFromBottom = distanceFromBottom - calculatedHeight;

    const style = isSticky ? {
      position: 'fixed',
      top: bottomDifference > 0 ? 0 : bottomDifference,
      left: placeholderClientRect.left,
      width: placeholderClientRect.width,
      transform: 'translateZ(0)',
    } : {};

    this.setState({
      isSticky,
      distanceFromTop,
      distanceFromBottom,
      calculatedHeight,
      style
    });
  };

  render() {
    let {
      children,
      className,
      ...props,
    } = this.props;

    const {
      style,
      isSticky,
      calculatedHeight,
    } = this.state;

    let placeholder_style = {
      paddingBottom: isSticky ? calculatedHeight + 'px' : 0,
    };

    const element = React.cloneElement(
      children,
      {
        ref: content => this.content = ReactDOM.findDOMNode(content),
      },
    );

    if (isSticky) {
      className = classes(className, 'sticky');
    }

    return (
      <div>
        <div
          style={placeholder_style}
          ref={ref => this.placeholder = ref}>
        </div>
        <div
          {...props}
          className={className}
          style={style}>
          {element}
        </div>
      </div>
    );
  }
}

Sticky.propTypes = {
  bottomOffset: PropTypes.number,
  className: PropTypes.string,
  topOffset: PropTypes.number,
};

Sticky.contextTypes = {
  subscribe: PropTypes.func.isRequired,
  unsubscribe: PropTypes.func.isRequired,
};


export default Sticky;

// vim: set ts=2 sw=2 tw=80:
