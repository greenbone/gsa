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

import {is_defined} from '../../utils.js';
import  _ from '../../locale.js';

import SelectionType from '../selectiontype.js';
import PropTypes from '../proptypes.js';

import TableHead from '../table/head.js';

/**
 * A higher order component to create table headers which support entity
 * selection
 *
 * If a react element instance is passed via actions the element will be
 * forwarded as actions to Component.
 *
 * If actions is undefined a default table head column will be passed as
 * actions to Component.
 *
 * If actions is true a default table head column will be passed as actions to
 * Component if the current selectionType (passed via props) is SELECTION_USER.
 *
 * If actions is false no actions (a null value in react) will be passed to
 * Component.
 *
 * @param {Component} Component React component rendered as header
 * @param {Element}   actions   React element, undefined or boolean value.
 * @param {Object}    options   Default properties for Component.
 *
 * @return A new EntitiesHeader component
 */
export const withEntitiesHeader = (Component, actions, options = {}) => {

  if (!is_defined(actions)) {
    actions = (
      <TableHead width="10em">{_('Actions')}</TableHead>
    );
  }
  else if (actions === false) {
    actions = null;
  }

  const HeaderWrapper = props => {
    let {selectionType} = props;
    let column = actions;

    if (actions === true) {
      if (selectionType === SelectionType.SELECTION_USER) {
        column = <TableHead width="6em">{_('Actions')}</TableHead>;
      }
      else {
        column = null;
      }
    }
    return <Component {...options} actions={column} {...props}/>;
  };

  HeaderWrapper.propTypes = {
    selectionType: PropTypes.number,
  };

  return HeaderWrapper;
};

// vim: set ts=2 sw=2 tw=80:
