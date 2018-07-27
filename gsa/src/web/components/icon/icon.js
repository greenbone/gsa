/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Img from 'web/components/img/img';

import withIconSize from './withIconSize';

const Anchor = glamorous.a({
  display: 'flex',
});

const StyledIcon = glamorous.span(
  ({onClick}) => isDefined(onClick) ? {
    cursor: 'pointer',
    '@media print': {
      display: 'none',
    },
  } : undefined,
);

class IconComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const {value, onClick} = this.props;

    onClick(value);
  }

  render() {
    const {
      img,
      to,
      alt = '',
      value,
      onClick,
      ...other
    } = this.props;
    return (
      <StyledIcon
        {...other}
        onClick={isDefined(onClick) ? this.handleClick : undefined}
      >
        {isDefined(to) ?
          <Anchor
            href={to}
          >
            <Img
              alt={alt}
              src={img}
            />
          </Anchor> :
          <Img
            alt={alt}
            src={img}
          />
        }
      </StyledIcon>
    );
  }
}

IconComponent.propTypes = {
  alt: PropTypes.string,
  img: PropTypes.string.isRequired,
  to: PropTypes.string,
  value: PropTypes.any,
  onClick: PropTypes.func,
};

export default withIconSize()(IconComponent);

// vim: set ts=2 sw=2 tw=80:
