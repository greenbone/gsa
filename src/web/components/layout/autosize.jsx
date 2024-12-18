/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {debounce} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';

import PropTypes from '../../utils/proptypes';

const Container = styled.div`
  overflow: hidden;
`;

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
  };

  constructor(...args) {
    super(...args);

    this.state = {};

    this.handleResize = debounce(this.handleResize.bind(this), 100);

    this.containerRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, {passive: true});

    this.setState(this.getSize());
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.setState(this.getSize());
  }

  getSize() {
    const {current: container} = this.containerRef;

    if (container === null) {
      return {};
    }

    const {width, height} = container.getBoundingClientRect();
    return {
      width,
      height,
    };
  }

  componentDidUpdate() {
    const size = this.getSize();

    if (size.width !== this.state.width || size.height !== this.state.height) {
      this.setState(size);
    }
  }

  render() {
    const {children} = this.props;

    const {width, height} = this.state;

    // only call children if height and width are defined
    const shouldCallChildren = isDefined(height) && isDefined(width);
    return (
      <Container ref={this.containerRef}>
        {shouldCallChildren && children({width, height})}
      </Container>
    );
  }
}

export default AutoSize;
