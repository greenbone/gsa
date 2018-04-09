/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';
import {exclude_object_props} from 'gmp/utils/object';

import PropTypes from '../../../utils/proptypes';

import Loading from '../../../components/loading/loading';

import Display, {
  DISPLAY_HEADER_HEIGHT,
} from './display';

const ownProps = [
  'title',
  'dataTransform',
  'data',
  'isLoading',
  'menu',
  'height',
  'width',
  'id',
  'onRemoveClick',
];

class DataDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      data: this.getTransformedData(this.props),
    };
  }

  getTransformedData(props) {
    const {data, dataTransform, ...other} = props;

    const tprops = exclude_object_props(other, ownProps);

    return is_defined(dataTransform) ?
      dataTransform(data, tprops) : data;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({data: this.getTransformedData(nextProps)});
    }
  }

  render() {
    const {data} = this.state;
    let {
      height,
      isLoading,
    } = this.props;
    const {
      children,
      menu,
      id,
      width,
      title,
      onRemoveClick,
      ...props
    } = this.props;

    height = height - DISPLAY_HEADER_HEIGHT;

    isLoading = isLoading && !is_defined(data);

    const otherProps = exclude_object_props(props, ownProps);
    return (
      <Display
        menu={menu}
        title={isLoading ? _('Loading') : title({data, id})}
        onRemoveClick={onRemoveClick}
        {...otherProps}
      >
        {isLoading ?
          <Loading/> :
          children({
            id,
            data,
            width,
            height,
          })
        }
      </Display>
    );
  }
}

DataDisplay.propTypes = {
  children: PropTypes.func.isRequired,
  data: PropTypes.any,
  dataTransform: PropTypes.func,
  height: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  menu: PropTypes.element,
  title: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
};

export default DataDisplay;

// vim: set ts=2 sw=2 tw=80:
