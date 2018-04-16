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

import {connect} from 'react-redux';

import {is_defined, has_value} from 'gmp/utils/identity';

import Grid, {createRow, createItem} from '../sortable/grid.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp';
import compose from '../../utils/compose';

import {loadSettings} from './settings/actions.js';
import DashboardSettings from './settings/selectors.js';

const createItems = props => {
  const {components = {}, content} = props;

  return content.map(({height, items}) => {
    const rowItems = items.map(name => {

      const component = components[name];
      if (!is_defined(component)) {
        return undefined;
      }

      return createItem({name});
    }).filter(is_defined);

    if (rowItems.length > 0) {
      return createRow(rowItems, height);
    }
    return undefined;
  }).filter(is_defined);
};

class Dashboard extends React.Component {

  static propTypes = {
    components: PropTypes.object,
    defaultContent: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    filter: PropTypes.filter,
    id: PropTypes.id.isRequired,
    loadSettings: PropTypes.func.isRequired,
    maxItemsPerRow: PropTypes.number,
    onFilterChanged: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      items: [],
      content: undefined,
    };

    this.handleItemsChange = this.handleItemsChange.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.content === nextProps.content) {
      return null;
    }

    const {content} = nextProps;
    return {
      items: has_value(content) ? createItems(nextProps) : [],
      content: content,
    };
  }

  componentDidMount() {
    const {id, defaultContent} = this.props;
    const defaults = is_defined(id) && is_defined(defaultContent) ?
      convertDefaults(id, defaultContent) : undefined;

    this.props.loadSettings(defaults);
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
          const {name} = props;
          const Component = components[name];
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

const mapStateToProps = (rootState, {id}) => {
  const settings = DashboardSettings(rootState);
  return {
    isLoading: settings.getIsLoading(),
    content: settings.getContentById(id),
  };
};

const convertDefaults = (id, defaultContent) => ({
  [id]: defaultContent.map(row => ({
    items: row,
  })),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadSettings: defaults => dispatch(loadSettings(ownProps)(defaults)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(Dashboard);

// vim: set ts=2 sw=2 tw=80:
