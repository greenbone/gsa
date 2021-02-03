/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import 'whatwg-fetch';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import withIconSize from 'web/components/icon/withIconSize';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import {get_img_url} from 'web/utils/urls';

const Anchor = styled.a`
  display: flex;
`;

const StyledIcon = styled.span`
  cursor: ${props => (isDefined(props.onClick) ? 'pointer' : undefined)};
  @media print {
    & {
      ${props => (isDefined(props.onClick) ? {display: 'none'} : undefined)};
    }
  }
`;

class IconComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {svgComponent: null};
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.loadImage();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.img !== this.props.img) {
      try {
        if (this.svgRef.removeChild(this.state.svgComponent)) {
          this.loadImage();
        }
      } catch (e) {
        /* Ignore errors here. If the old child couldn't be removed, a new one
        should not be appended. Therefore do nothing instead of crashing the GUI */
      }
    }
  }

  loadImage() {
    const {img} = this.props;
    const iconPath = get_img_url(img);
    fetch(iconPath).then(response =>
      response.text().then(resp => {
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(resp, 'image/svg+xml');
        const svg = doc.documentElement;
        this.setState({svgComponent: svg});
        if (this.svgRef !== null) {
          this.svgRef.appendChild(svg);
        }
      }),
    );
  }

  handleClick() {
    const {value, onClick} = this.props;

    onClick(value);
  }

  render() {
    const {className, to, value, onClick, ...other} = this.props;

    return (
      <StyledIcon
        {...other}
        onClick={isDefined(onClick) ? this.handleClick : undefined}
      >
        {isDefined(to) ? (
          <Anchor href={to}>
            <div className={className} ref={ref => (this.svgRef = ref)} />
          </Anchor>
        ) : (
          <div className={className} ref={ref => (this.svgRef = ref)} />
        )}
      </StyledIcon>
    );
  }
}

IconComponent = styled(IconComponent)`
  & svg path {
    fill: ${props => {
      const {active = true} = props;
      return active ? undefined : Theme.inputBorderGray;
    }};
  }
`;

IconComponent.propTypes = {
  alt: PropTypes.string,
  img: PropTypes.string.isRequired,
  to: PropTypes.string,
  value: PropTypes.any,
  onClick: PropTypes.func,
};

export default withIconSize()(IconComponent);

// vim: set ts=2 sw=2 tw=80:
