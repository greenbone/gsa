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

import moment from 'moment';
import ReactPropTypes from 'prop-types';

import {is_defined} from 'gmp/utils';

import {CacheFactory, Cache} from 'gmp/cache.js';

import Gmp from 'gmp/gmp.js';
import Model from 'gmp/model.js';
import {EntityCommand, EntitiesCommand} from 'gmp/command.js';

import Capabilities from 'gmp/capabilities/capabilities.js';

import CollectionCounts from 'gmp/collection/collectioncounts.js';

import Filter from 'gmp/models/filter.js';
import Settings from 'gmp/models/settings.js';

import {
  SEVERITY_CLASS_BSI,
  SEVERITY_CLASS_CLASSIC,
  SEVERITY_CLASS_NIST,
  SEVERITY_CLASS_PCI_DSS,
} from './severity';

export const mayRequire = validator => {
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

const component = ReactPropTypes.oneOfType([
  ReactPropTypes.func,
  ReactPropTypes.object,
]);

const componentOrFalse = ReactPropTypes.oneOfType([
  component,
  ReactPropTypes.oneOf([false]),
]);

const componentOrElement = ReactPropTypes.oneOfType([
  component,
  ReactPropTypes.element,
]);

const elementOrString = ReactPropTypes.oneOfType([
  ReactPropTypes.element,
  ReactPropTypes.string,
]);

const numberString = ReactPropTypes.string; // TODO restrict string to contain numbers

const numberOrNumberString = ReactPropTypes.oneOfType([
  ReactPropTypes.number,
  numberString,
]);

const icon = ReactPropTypes.oneOfType([
  ReactPropTypes.string,
  ReactPropTypes.element,
]);

const yesno = ReactPropTypes.oneOf([
  1, 0,
]);

const id = ReactPropTypes.string; // TODO improve checking for uuid

const idOrZero = ReactPropTypes.oneOfType([
  id,
  ReactPropTypes.oneOf([0]),
]);

const stringOrFalse = ReactPropTypes.oneOfType([
  ReactPropTypes.string,
  ReactPropTypes.oneOf([false]),
]);

const counts = ReactPropTypes.instanceOf(CollectionCounts);

const set = ReactPropTypes.instanceOf(Set);

const filter = ReactPropTypes.instanceOf(Filter);

const model = ReactPropTypes.instanceOf(Model);

const entitycommand = ReactPropTypes.instanceOf(EntityCommand);
const entitiescommand = ReactPropTypes.instanceOf(EntitiesCommand);

const capabilities = ReactPropTypes.instanceOf(Capabilities);

const gmp = ReactPropTypes.instanceOf(Gmp);

const settings = ReactPropTypes.instanceOf(Settings);

const cachefactory = ReactPropTypes.instanceOf(CacheFactory);
const cache = ReactPropTypes.instanceOf(Cache);

const momentDateValidator = (props, prop_name, component_name) => {
  const value = props[prop_name];
  if (is_defined(value) && !moment.isMoment(value)) {
    return new Error('Invalid prop `' + prop_name + '` supplied to' +
      ' `' + component_name + '`. Not a valid moment date. Value is ' + value);
  }
  return undefined;
};

const momentDate = mayRequire(momentDateValidator);

const timeunit = ReactPropTypes.oneOf([
  'hour', 'day', 'week', 'month',
]);

const iconSize = ReactPropTypes.oneOfType([
  ReactPropTypes.array,
  ReactPropTypes.oneOf([
    'small', 'medium', 'large', 'default',
  ]),
]);

const toStringValidator = (props, prop_name, component_name) => {
  const value = props[prop_name];
  if (is_defined(value) && !is_defined(value.toString)) {
    return new Error('Invalid prop `' + prop_name + '` supplied to' +
      ' `' + component_name + '`. Prop ' + prop_name + ' can not be ' +
      'converted to String. Value is `' + value + '`.');
  }
};

const toString = mayRequire(toStringValidator);

const severityClass = ReactPropTypes.objectOf([
  SEVERITY_CLASS_BSI,
  SEVERITY_CLASS_CLASSIC,
  SEVERITY_CLASS_NIST,
  SEVERITY_CLASS_PCI_DSS,
]);

const ref = ReactPropTypes.oneOfType([
  ReactPropTypes.func,
  // React.createRef() returns an object with a current property
  ReactPropTypes.shape({
    current: ReactPropTypes.any,
  }),
]);

export default {
  bool: ReactPropTypes.bool,
  any: ReactPropTypes.any,
  array: ReactPropTypes.array,
  arrayOf: ReactPropTypes.arrayOf,
  element: ReactPropTypes.element,
  func: ReactPropTypes.func,
  instanceOf: ReactPropTypes.instanceOf,
  node: ReactPropTypes.node,
  number: ReactPropTypes.number,
  object: ReactPropTypes.object,
  objectOf: ReactPropTypes.objectOf,
  oneOf: ReactPropTypes.oneOf,
  oneOfType: ReactPropTypes.oneOfType,
  shape: ReactPropTypes.shape,
  symbol: ReactPropTypes.symbol,
  string: ReactPropTypes.string,

  cache,
  cachefactory,
  capabilities,
  counts,
  component,
  componentOrFalse,
  componentOrElement,
  elementOrString,
  entitycommand,
  entitiescommand,
  filter,
  gmp,
  iconSize,
  model,
  momentDate,
  numberString,
  numberOrNumberString,
  icon,
  id,
  idOrZero,
  ref,
  set,
  settings,
  severityClass,
  stringOrFalse,
  timeunit,
  toString,
  yesno,
};

// vim: set ts=2 sw=2 tw=80:
