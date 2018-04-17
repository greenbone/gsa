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
import {debounce} from 'gmp/utils/event.js';

import Grid, {createRow, createItem, itemsPropType} from '../sortable/grid.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp';
import compose from '../../utils/compose';

import {loadSettings, saveSettings} from './settings/actions.js';
import DashboardSettings from './settings/selectors.js';

const convertDefaults = (id, defaultContent) => ({
  [id]: defaultContent.map(row => createRow(
    row.map(item => createItem({name: item})))),
});

class Dashboard extends React.Component {

  static propTypes = {
    components: PropTypes.object,
    defaultContent: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    filter: PropTypes.filter,
    id: PropTypes.id.isRequired,
    items: itemsPropType,
    loadSettings: PropTypes.func.isRequired,
    maxItemsPerRow: PropTypes.number,
    saveSettings: PropTypes.func.isRequired,
    onFilterChanged: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      items: undefined,
    };

    this.handleItemsChange = this.handleItemsChange.bind(this);
    this.save = debounce(this.save, 500);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return prevState.items === nextProps.items ?
      null : {items: nextProps.items};
  }

  componentDidMount() {
    const {id, defaultContent} = this.props;
    const defaults = is_defined(id) && is_defined(defaultContent) ?
      convertDefaults(id, defaultContent) : undefined;

    this.props.loadSettings(defaults);
  }

  handleItemsChange(items) {
    this.setState({items});

    this.save(items);
  }

  save(items) {
    const {id} = this.props;

    this.props.saveSettings(id, items);
  }

  render() {
    const {
      items,
    } = this.state;
    const {
      maxItemsPerRow,
      filter,
      components = {},
      onFilterChanged,
    } = this.props;

    return (
      <Grid
        items={has_value(items) ? items : []}
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
    items: settings.getItemsById(id),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadSettings: defaults => dispatch(loadSettings(ownProps)(defaults)),
  saveSettings: (id, items) => dispatch(saveSettings(ownProps)(id, items)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(Dashboard);

// vim: set ts=2 sw=2 tw=80:
