/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';
import {first} from 'gmp/utils/array';
import {shorten} from 'gmp/utils/string';

import EntityComponent from 'web/entity/component';

import FilterDialog from 'web/pages/filters/dialog';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

const FILTER_OPTIONS = [
  ['alert', _l('Alert')],
  ['credential', _l('Credential')],
  ['filter', _l('Filter')],
  ['group', _l('Group')],
  ['host', _l('Host')],
  ['note', _l('Note')],
  ['os', _l('Operating System')],
  ['override', _l('Override')],
  ['permission', _l('Permission')],
  ['port_list', _l('Port List')],
  ['report', _l('Report')],
  ['report_format', _l('Report Format')],
  ['result', _l('Result')],
  ['role', _l('Role')],
  ['scanner', _l('Scanner')],
  ['schedule', _l('Schedule')],
  ['info', _l('SecInfo')],
  ['config', _l('Scan Config')],
  ['tag', _l('Tag')],
  ['target', _l('Target')],
  ['task', _l('Task')],
  ['ticket', _l('Ticket')],
  ['tls_certificate', _l('TLS Certificate')],
  ['user', _l('User')],
  ['vulnerability', _l('Vulnerability')],
];

const filter_types = (caps, name) => {
  return caps.mayAccess(name);
};

const includes_type = (types, type) => {
  for (const option of types) {
    if (option[0] === type) {
      return true;
    }
  }
  return false;
};

class FilterComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      dialogVisible: false,
      types: [],
    };

    this.handleCloseFilterDialog = this.handleCloseFilterDialog.bind(this);
    this.openFilterDialog = this.openFilterDialog.bind(this);
  }

  openFilterDialog(filter) {
    const {capabilities} = this.props;

    let types = FILTER_OPTIONS.filter(option =>
      filter_types(capabilities, option[0]),
    );

    if (!isDefined(types)) {
      types = [];
    }

    this.handleInteraction();

    if (isDefined(filter)) {
      let {filter_type} = filter;
      if (!includes_type(types, filter_type)) {
        filter_type = first(types, [])[0];
      }

      const title = _('Edit Filter {{name}}', {name: shorten(filter.name)});

      this.setState({
        comment: filter.comment,
        dialogVisible: true,
        id: filter.id,
        name: filter.name,
        term: filter.toFilterString(),
        title,
        type: filter_type,
        types,
      });
    } else {
      const type = first(types, [])[0]; // eslint-disable-line prefer-destructuring

      this.setState({
        comment: undefined,
        dialogVisible: true,
        id: undefined,
        name: undefined,
        term: '',
        type,
        types,
      });
    }
  }

  closeFilterDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseFilterDialog() {
    this.closeFilterDialog();
    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onInteraction,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      comment,
      dialogVisible,
      id,
      name,
      term,
      title,
      type,
      types,
    } = this.state;

    return (
      <EntityComponent
        name="filter"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({save, ...other}) => (
          <React.Fragment>
            {children({
              ...other,
              create: this.openFilterDialog,
              edit: this.openFilterDialog,
            })}
            {dialogVisible && (
              <FilterDialog
                comment={comment}
                id={id}
                name={name}
                term={term}
                title={title}
                type={type}
                types={types}
                onClose={this.handleCloseFilterDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeFilterDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

FilterComponent.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withCapabilities(FilterComponent);
