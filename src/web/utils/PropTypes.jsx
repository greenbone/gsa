/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ReactPropTypes from 'prop-types';
import Capabilities from 'gmp/capabilities/capabilities';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import Gmp from 'gmp/gmp';
import Model from 'gmp/model';
import {isDate, isDuration} from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import Settings from 'gmp/models/settings';
import {isDefined} from 'gmp/utils/identity';
import warning from 'web/utils/Warning';

export const mayRequire = validator => {
  const wrapper = (...props) => {
    return validator(...props);
  };

  wrapper.isRequired = (props, prop_name, component_name, ...rest) => {
    if (isDefined(props[prop_name])) {
      return validator(props, prop_name, component_name, ...rest);
    }
    return new Error(
      'Prop `' +
        prop_name +
        '` supplied to' +
        ' `' +
        component_name +
        '` is required.',
    );
  };

  return wrapper;
};

export const deprecated =
  (validator, message = '') =>
  (props, prop_name, component_name, ...rest) => {
    warning(
      isDefined(props[prop_name]),
      `'${prop_name}' is deprecated on ${component_name}. ${message}`,
    );
    return validator(props, prop_name, component_name, ...rest);
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

const error = ReactPropTypes.shape({
  message: ReactPropTypes.string.isRequired,
  name: ReactPropTypes.string,
  stack: ReactPropTypes.string,
});

const numberString = ReactPropTypes.string; // TODO restrict string to contain numbers

const numberOrNumberString = ReactPropTypes.oneOfType([
  ReactPropTypes.number,
  numberString,
]);

const icon = ReactPropTypes.oneOfType([
  ReactPropTypes.string,
  ReactPropTypes.element,
]);

const yesno = ReactPropTypes.oneOf([1, 0]);

const id = ReactPropTypes.string; // TODO improve checking for uuid

const idOrZero = ReactPropTypes.oneOfType([id, ReactPropTypes.oneOf([0])]);

const stringOrFalse = ReactPropTypes.oneOfType([
  ReactPropTypes.string,
  ReactPropTypes.oneOf([false]),
]);

const counts = ReactPropTypes.shape({
  all: ReactPropTypes.number.isRequired,
  filtered: ReactPropTypes.number.isRequired,
  first: ReactPropTypes.number,
  length: ReactPropTypes.number,
  rows: ReactPropTypes.number,
});

const set = ReactPropTypes.instanceOf(Set);

const filter = ReactPropTypes.instanceOf(Filter);

const model = ReactPropTypes.instanceOf(Model);

const entitycommand = ReactPropTypes.instanceOf(EntityCommand);
const entitiescommand = ReactPropTypes.instanceOf(EntitiesCommand);

const capabilities = ReactPropTypes.instanceOf(Capabilities);

// allow to fake gmp in tests without getting proptype warnings
const gmp =
  process.env.NODE_ENV === 'test'
    ? ReactPropTypes.object
    : ReactPropTypes.instanceOf(Gmp);

const settings = ReactPropTypes.instanceOf(Settings);

const severityClass = ReactPropTypes.string;

const dateValidator = (props, prop_name, component_name) => {
  const value = props[prop_name];
  if (isDefined(value) && !isDate(value)) {
    return new Error(
      'Invalid prop `' +
        prop_name +
        '` supplied to' +
        ' `' +
        component_name +
        '`. Not a valid moment date. Value is ' +
        value,
    );
  }
  return undefined;
};

const date = mayRequire(dateValidator);

const timeunit = ReactPropTypes.oneOf(['hour', 'day', 'week', 'month']);

const durationValidator = (props, prop_name, component_name) => {
  const value = props[prop_name];
  if (isDefined(value) && !isDuration(value)) {
    return new Error(
      'Invalid prop `' +
        prop_name +
        '` supplied to' +
        ' `' +
        component_name +
        '`. Not a valid moment duration. Value is ' +
        value,
    );
  }
  return undefined;
};

const duration = mayRequire(durationValidator);

const iconSize = ReactPropTypes.oneOfType([
  ReactPropTypes.array,
  ReactPropTypes.oneOf(['tiny', 'small', 'medium', 'large', 'default']),
]);

const toStringValidator = (props, prop_name, component_name) => {
  const value = props[prop_name];
  if (isDefined(value) && !isDefined(value.toString)) {
    return new Error(
      'Invalid prop `' +
        prop_name +
        '` supplied to' +
        ' `' +
        component_name +
        '`. Prop ' +
        prop_name +
        ' can not be ' +
        'converted to String. Value is `' +
        value +
        '`.',
    );
  }
};

const toString = mayRequire(toStringValidator);

const ref = ReactPropTypes.oneOfType([
  ReactPropTypes.func,
  // React.createRef() returns an object with a current property
  ReactPropTypes.shape({
    current: ReactPropTypes.any,
  }),
]);

const gsaPropTypes = {
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
  elementType: ReactPropTypes.elementType,

  capabilities,
  counts,
  component,
  componentOrFalse,
  componentOrElement,
  elementOrString,
  entitycommand,
  entitiescommand,
  error,
  filter,
  gmp,
  iconSize,
  model,
  date,
  duration,
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

export default gsaPropTypes;
