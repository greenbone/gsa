/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import $ from 'jquery';

import {is_defined, is_array} from '../../utils.js';

import {withLayout} from '../layout.js';

import 'select2';

import './css/select2.css';

function equal_array_keys(arr1, arr2) {
  if (Object.is(arr1, arr2)) {
    return true;
  }

  if (!is_array(arr1) || !is_array(arr2)) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].key !== arr2[i].key) {
      return false;
    }
  }
  return true;
}

class Select2Container extends React.Component {

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.destroy();
  }

  componentWillReceiveProps(next) {
    let {value} = this.props;

    if (this.select2 && next.value !== value) {
      this.setValue(next.value);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // only update componentn if value or options have changed
    return this.props.value !== nextProps.value ||
      !equal_array_keys(this.props.children, nextProps.children) ||
      this.props.disabled !== nextProps.disabled;
  }

  componentDidUpdate(prevProps) {
    if (!equal_array_keys(this.props.children, prevProps.children)) {
      // options have changed -> rebuild
      this.destroy();
      this.init();
    }
  }

  handleChange() {
    let {onChange, name} = this.props;
    if (onChange) {
      onChange(this.select2.val(), name);
    }
  }

  setValue(value) {
    $(this.select).val(value).trigger('change.select2');
  }

  init() {
    let {value} = this.props;

    this.select2 = $(this.select).select2();

    if (is_defined(value)) {
      this.setValue(value);
    }

    this.select2.on('change', this.handleChange);
  }

  destroy() {
    if (this.select2) {
      this.select2.off('change');
      this.select2.select2('destroy');
      this.select2 = undefined;
    }
  }

  render() {
    let {onChange, value, className, ...other} = this.props; // eslint-disable-line no-unused-vars
    return (
      <span className={className}>
        <select {...other} ref={ref => this.select = ref}/>
      </span>
    );
  }
}

Select2Container.propTypes = {
  disabled: React.PropTypes.bool,
  name: React.PropTypes.string,
  onChange: React.PropTypes.func,
  value: React.PropTypes.any,
  className: React.PropTypes.string
};

export const Select2 = withLayout(Select2Container, {box: true});

export default Select2;

// vim: set ts=2 sw=2 tw=80:
