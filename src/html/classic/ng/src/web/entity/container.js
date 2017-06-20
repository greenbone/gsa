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

import logger from '../../log.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

const log = logger.getLogger('web.entity.container');

class EntityContainer extends React.Component {

  constructor(...args) {
    super(...args);

    const {gmpname} = this.props;
    const {gmp} = this.context;

    this.entity_command = gmp[gmpname];

    this.state = {
      loading: true,
    };

    this.reload = this.reload.bind(this);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
  }

  componentDidMount() {
    const {id} = this.props.params;
    this.load(id);
  }

  componentWillReceiveProps(next) {
    const {id} = this.props.params;
    if (id !== next.params.id) {
      this.load(next.params.id);
    }
  }

  load(id) {
    this.setState({loading: true});

    this.clearTimer(); // remove possible running timer

    this.entity_command.get({id}).then(response => {
      this.setState({entity: response.data, loading: false});

      const meta = response.getMeta();
      let refresh;

      if (meta.fromcache && meta.dirty) {
        log.debug('Forcing reload of entities', meta.dirty);
        refresh = 1;
      }

      this.startTimer(refresh);
    })
    .catch(err => {
      log.error(err);
      this.setState({entity: undefined, loading: false});
    });
  }

  reload() {
    const {id} = this.props.params;
    this.load(id);
  }

  handleChanged() {
    this.reload();
  }

  startTimer(refresh) {
    let {gmp} = this.context;
    refresh = is_defined(refresh) ? refresh : gmp.autorefresh;
    if (refresh && refresh >= 0) {
      this.timer = window.setTimeout(this.handleTimer, refresh * 1000);
      log.debug('Started reload timer with id', this.timer, 'and interval',
        refresh);
    }
  }

  clearTimer() {
    if (is_defined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;
    this.reload();
  }

  render() {
    const {loading, entity} = this.state;
    const Component = this.props.component;
    const {children, component, gmpname, ...other} = this.props;
    return (
      <Layout>
        <Component
          entity={entity}
          entityCommand={this.entity_command}
          loading={loading}
          onChanged={this.handleChanged}
          {...other}
        />
      </Layout>
    );
  }
}

EntityContainer.propTypes = {
  component: PropTypes.component.isRequired,
  gmpname: PropTypes.string.isRequired,
};

EntityContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export const withEntityContainer = (component, gmpname, options = {}) => {
  const EntityContainerWrapper = props => {
    return (
      <EntityContainer
        {...options}
        {...props}
        gmpname={gmpname}
        component={component}
      />
    );
  };
  return EntityContainerWrapper;
};

// vim: set ts=2 sw=2 tw=80:
