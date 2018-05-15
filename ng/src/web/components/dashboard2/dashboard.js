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

import Logger from 'gmp/log';

import {is_defined, has_value} from 'gmp/utils/identity';
import {debounce} from 'gmp/utils/event';
import {exclude_object_props} from 'gmp/utils/object';

import {
  loadSettings,
  saveSettings,
} from 'web/store/dashboard/settings/actions';
import DashboardSettings from 'web/store/dashboard/settings/selectors';

import Grid, {createRow, createItem, itemsPropType} from '../sortable/grid.js';

import PropTypes from '../../utils/proptypes';
import withGmp from '../../utils/withGmp';
import compose from '../../utils/compose';

import {getDisplay} from './registry';

const log = Logger.getLogger('web.components.dashboard');

const ownPropNames = [
  'defaultContent',
  'gmp',
  'id',
  'items',
  'loadSettings',
  'maxItemsPerRow',
  'maxRows',
  'permittedDisplays',
  'saveSettings',
];

const convertDefaultContent = defaultContent =>
  defaultContent.map(row => createRow(
    row.map(item => createItem({name: item}))));

class Dashboard extends React.Component {

  static propTypes = {
    defaultContent: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    filter: PropTypes.filter,
    id: PropTypes.id.isRequired,
    items: itemsPropType,
    loadSettings: PropTypes.func.isRequired,
    maxItemsPerRow: PropTypes.number,
    maxRows: PropTypes.number,
    permittedDisplays: PropTypes.arrayOf(PropTypes.string).isRequired,
    saveSettings: PropTypes.func.isRequired,
    onFilterChanged: PropTypes.func,
  }

  constructor(props) {
    super(props);

    const {permittedDisplays = []} = this.props;

    this.components = {};
    permittedDisplays.forEach(name => {
      const display = getDisplay(name);

      if (is_defined(display)) {
        this.components[name] = display.component;
      }
      else {
        log.warn('Unknown Dashboard display', name);
      }
    });

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
    const {
      id,
      permittedDisplays,
      defaultContent,
      maxItemsPerRow,
      maxRows,
    } = this.props;

    const defaults = {
      items: convertDefaultContent(defaultContent),
      permittedDisplays,
      maxItemsPerRow,
      maxRows,
    };

    this.props.loadSettings(id, defaults);
  }

  handleItemsChange(items) {
    this.setState({items});

    this.save(items);
  }

  save(items) {
    const {id} = this.props;

    this.props.saveSettings(id, {items});
  }

  render() {
    const {
      items,
    } = this.state;
    const {
      maxItemsPerRow,
      maxRows,
      ...props
    } = this.props;

    const other = exclude_object_props(props, ownPropNames);
    return (
      <Grid
        items={has_value(items) ? items : []}
        maxItemsPerRow={maxItemsPerRow}
        maxRows={maxRows}
        onChange={this.handleItemsChange}
      >
        {({
          dragHandleProps, id,
          props: itemProps,
          height,
          width,
          remove,
          update,
        }) => {
          const {name, filterId} = itemProps;
          const Component = this.components[name];
          return is_defined(Component) ? (
            <Component
              {...other}
              dragHandleProps={dragHandleProps}
              height={height}
              width={width}
              id={id}
              filterId={filterId}
              onChanged={update}
              onRemoveClick={remove}
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
  loadSettings: (id, defaults) =>
    dispatch(loadSettings(ownProps)(id, defaults)),
  saveSettings: (id, settings) =>
    dispatch(saveSettings(ownProps)(id, settings)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(Dashboard);

// vim: set ts=2 sw=2 tw=80:
