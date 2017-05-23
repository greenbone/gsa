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

import {classes, is_defined} from '../../utils.js';

import PropTypes from '../proptypes.js';

import Text from '../form/text.js';

import EntityActions from './actions.js';

import './css/row.css';

export const withEntityRow = (Component, actions, options = {}) => {

  if (!is_defined(actions)) {
    actions = EntityActions;
  }

  const EntityRowWrapper = props => {
    return (
      <Component
        {...options}
        actions={actions}
        {...props}
      />
    );
  };
  return EntityRowWrapper;
};

export const RowDetailsToggle = ({
    className,
    ...props,
  }) => {
  className = classes(className, 'row-details-toggle');
  return (
    <Text {...props} className={className} />
  );
};

RowDetailsToggle.propTypes = {
  className: PropTypes.string,
};


// vim: set ts=2 sw=2 tw=80:
