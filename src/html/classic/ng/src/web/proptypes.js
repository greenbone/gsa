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
import moment from 'moment';

import {is_defined} from '../utils.js';

import CollectionList from '../gmp/collectionlist.js';

import Model from '../gmp/model.js';
import Capabilities from '../gmp/capabilities.js';

import Filter from '../gmp/models/filter.js';

import {EntityCommand, EntitiesCommand} from '../gmp/command.js';

export const component = React.PropTypes.oneOfType([
  React.PropTypes.func,
  React.PropTypes.object,
]);

export const componentOrFalse = React.PropTypes.oneOfType([
  component,
  React.PropTypes.oneOf([false]),
]);

export const componentOrElement = React.PropTypes.oneOfType([
  component,
  React.PropTypes.element,
]);

export const numberString = React.PropTypes.oneOfType([
  React.PropTypes.number,
  React.PropTypes.string,
]);

export const icon =  React.PropTypes.oneOfType([
  React.PropTypes.string,
  React.PropTypes.element,
]);

export const yesno = React.PropTypes.oneOf([
  "1", "0", 1, 0,
]);

export const id = React.PropTypes.string; // TODO improve checking for uuid

export const idOrZero = React.PropTypes.oneOfType([
  id,
  React.PropTypes.oneOf([0]),
]);

export const stringOrFalse = React.PropTypes.oneOfType([
  React.PropTypes.string,
  React.PropTypes.oneOf([false]),
]);

export const collection = React.PropTypes.instanceOf(CollectionList);

export const arrayLike = React.PropTypes.oneOfType([
  React.PropTypes.array,
  collection,
]);

export const set = React.PropTypes.instanceOf(Set);

export const filter = React.PropTypes.instanceOf(Filter);

export const model = React.PropTypes.instanceOf(Model);

export const entitycommand = React.PropTypes.instanceOf(EntityCommand);
export const entitiescommand = React.PropTypes.instanceOf(EntitiesCommand);

export const capabilities = React.PropTypes.instanceOf(Capabilities);

const mayRequire = validator => {
  const wrapper = (...props) => {
    return validator(...props);
  };

  wrapper.isRequired = (props, prop_name, component_name) => {
    if (is_defined(props[prop_name])) {
      return validator(props, prop_name, component_name);
    }
    return new Error('Prop `' + prop_name + '` supplied to' +
      ' `' + component_name + '` is required.');
  };

  return wrapper;
};

const momentDateValidator = (props, prop_name, component_name) => {
  if (!moment.isMoment(props[prop_name])) {
    return new Error('Invalid prop `' + prop_name + '` supplied to' +
      ' `' + component_name + '`. Note a valid moment date.');
  }
  return undefined;
};

export const momentDate = mayRequire(momentDateValidator);

export const timeunit =  React.PropTypes.oneOf([
  'hour', 'day', 'week', 'month',
]);

export default {
  bool: React.PropTypes.bool,
  any: React.PropTypes.any,
  array: React.PropTypes.array,
  arrayOf: React.PropTypes.arrayOf,
  element: React.PropTypes.element,
  func: React.PropTypes.func,
  instanceOf: React.PropTypes.instanceOf,
  node: React.PropTypes.node,
  number: React.PropTypes.number,
  object: React.PropTypes.object,
  objectOf: React.PropTypes.objectOf,
  oneOf: React.PropTypes.oneOf,
  oneOfType: React.PropTypes.oneOfType,
  shape: React.PropTypes.shape,
  symbol: React.PropTypes.symbol,
  string: React.PropTypes.string,

  arrayLike,
  capabilities,
  collection,
  component,
  componentOrFalse,
  componentOrElement,
  entitycommand,
  entitiescommand,
  filter,
  model,
  momentDate,
  numberString,
  icon,
  id,
  idOrZero,
  set,
  stringOrFalse,
  timeunit,
  yesno,
};

// vim: set ts=2 sw=2 tw=80:
