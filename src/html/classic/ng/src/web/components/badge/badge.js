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

import glamorous from 'glamorous';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

const BadgeContainer = glamorous.div({
  position: 'relative',
  display: 'inline-flex',
},
  ({margin}) => ({marginRight: margin}),
);

BadgeContainer.displayName = 'BadgeContainer';

const BadgeIcon = glamorous.span({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  fontSize: '10px',
  backgroundColor: 'red',
  fontWeight: 'bold',
  borderRadius: '10px',
  minWidth: '10px',
  padding: '3px 5px',
  zIndex: 1,
},
  ({
    backgroundColor = '#99CE48',
    color = 'white',
    position = 'bottom',
    radius = 8,
    margin = 8,
  }) => {
    return {
      right: -margin,
      color: color,
      backgroundColor,
      [position]: -radius,
    };
  },
);

BadgeIcon.displayName = 'BadgeIcon';

class Badge extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};
  }

  componentDidMount() {
    this.calcMargin();
  }

  componentDidUpdate(prev) {
    if (prev.content !== this.props.content) {
      this.calcMargin();
    }
  }

  calcMargin() {
    if (is_defined(this.icon)) {
      const {width} = this.icon.getBoundingClientRect();
      this.setState({margin: width / 2});
    }
  }

  render() {
    const {
      margin,
    } = this.state;
    const {
      backgroundColor,
      children,
      color,
      content,
      dynamic = true,
      position,
    } = this.props;
    return (
      <BadgeContainer
        margin={dynamic ? margin : undefined}
      >
        {children}

        {is_defined(content) &&
          <BadgeIcon
            innerRef={ref => this.icon = ref}
            color={color}
            backgroundColor={backgroundColor}
            position={position}
            margin={dynamic ? margin : undefined}
          >
            {content}
          </BadgeIcon>
        }
      </BadgeContainer>
    );
  }
}

Badge.propTypes = {
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dynamic: PropTypes.bool,
  position: PropTypes.oneOf(['bottom', 'top']),
};

export default Badge;

// vim: set ts=2 sw=2 tw=80:
