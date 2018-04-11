/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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
import 'core-js/fn/object/entries';

import React from 'react';

import {is_defined} from 'gmp/utils/identity';

import Grid, {createRow, createItem} from '../sortable/grid.js';

import PropTypes from '../../utils/proptypes.js';

class Dashboard extends React.Component {

  static propTypes = {
    components: PropTypes.object,
    defaultContent: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    filter: PropTypes.filter,
    maxItemsPerRow: PropTypes.number,
    onFilterChanged: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      items: [],
    };

    this.handleItemsChange = this.handleItemsChange.bind(this);
  }

  componentDidMount() {
    this.createItems();
  }

  createItems() {
    const {components = {}, defaultContent = [[]]} = this.props;

    const items = defaultContent.map(row => {
      const rowItems = row.map(id => {

        const component = components[id];
        if (!is_defined(component)) {
          return undefined;
        }

        return createItem({id});
      }).filter(is_defined);

      if (rowItems.length > 0) {
        return createRow(rowItems);
      }
      return undefined;
    }).filter(is_defined);

    this.setState({items});
  }

  handleItemsChange(items) {
    this.setState({items});
  }

  render() {
    const {items} = this.state;
    const {
      maxItemsPerRow,
      filter,
      components = {},
      onFilterChanged,
    } = this.props;

    return (
      <Grid
        items={items}
        maxItemsPerRow={maxItemsPerRow}
        onChange={this.handleItemsChange}
      >
        {({dragHandleProps, id, props, height, width, remove}) => {
          const {id: elementId} = props;
          const Component = components[elementId];
          return is_defined(Component) ? (
            <Component
              filter={filter}
              dragHandleProps={dragHandleProps}
              height={height}
              width={width}
              id={id}
              onRemoveClick={remove}
              onFilterChanged={onFilterChanged}
            />
          ) : null;
        }}
      </Grid>
    );
  }
}

export default Dashboard;

// vim: set ts=2 sw=2 tw=80:
