/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {debounce} from 'gmp/utils/event';
import {is_defined, has_value} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes';

const Container = glamorous.div('autosize-container', {
  overflow: 'hidden',
});

/**
 * Component to provide width and height props to a children function
 *
 * Initially it renders a <div/> container element. After mounting it calculates
 * the height and width of the container element and passes the width and height
 * to a child function. width and height are re-calculated on each render of
 * AutoSize.
 *
 * This component uses the render props pattern.
 */
class AutoSize extends React.Component {

  static propTypes = {
    children: PropTypes.func.isRequired,
  }

  constructor(...args) {
    super(...args);

    this.handleResize = debounce(this.handleResize.bind(this), 100);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, {passive: true});

    this.forceUpdate(); // force re-render to provide size
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.forceUpdate();
  }

  getSize() {
    if (!has_value(this.container)) {
      return {};
    }

    const {width, height} = this.container.getBoundingClientRect();
    return {
      width,
      height,
    };
  }

  render() {
    const {children} = this.props;

    const {width, height} = this.getSize();

    // only call children if height and width are defined
    const shouldCallChildren = is_defined(height) && is_defined(width);
    return (
      <Container
        innerRef={ref => this.container = ref}
      >
        {shouldCallChildren && children({width, height})}
      </Container>
    );
  }
}

export default AutoSize;

// vim: set ts=2 sw=2 tw=80:
