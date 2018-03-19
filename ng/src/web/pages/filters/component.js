/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import {is_defined, first, shorten} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import withCapabilties from '../../utils/withCapabilities.js';

import EntityComponent from '../../entity/component.js';

import Wrapper from '../../components/layout/wrapper.js';

import FilterDialog from './dialog.js';

const FILTER_OPTIONS = [
  ['agents', 'Agent', _('Agent')],
  ['alerts', 'Alert', _('Alert')],
  ['assets', 'Asset', _('Asset')],
  ['credentials', 'Credential', _('Credential')],
  ['filters', 'Filter', _('Filter')],
  ['groups', 'Group', _('Group')],
  ['notes', 'Note', _('Note')],
  ['overrides', 'Override', _('Override')],
  ['permissions', 'Permission', _('Permission')],
  ['port_lists', 'Port List', _('Port List')],
  ['reports', 'Report', _('Report')],
  ['report_formats', 'Report Format', _('Report Format')],
  ['results', 'Result', _('Result')],
  ['roles', 'Role', _('Role')],
  ['schedules', 'Schedule', _('Schedule')],
  ['info', 'SecInfo', _('SecInfo')],
  ['configs', 'Scan Config', _('Scan Config')],
  ['tags', 'Tag', _('Tag')],
  ['targets', 'Target', _('Target')],
  ['tasks', 'Task', _('Task')],
  ['users', 'User', _('User')],
];

const filter_types = (caps, name) => {
  return caps.mayAccess(name);
};

const includes_type = (types, type) => {
  for (const option of types) {
    if (option[1] === type) {
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

    this.closeFilterDialog = this.closeFilterDialog.bind(this);
    this.openFilterDialog = this.openFilterDialog.bind(this);
  }

  openFilterDialog(filter) {
    const {capabilities} = this.props;

    let types = FILTER_OPTIONS.filter(option =>
      filter_types(capabilities, option[0]));

    if (!is_defined(types)) {
      types = [];
    };

    if (is_defined(filter)) {
      let {filter_type} = filter;
      if (!includes_type(types, filter_type)) {
        filter_type = first(types, [])[1];
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
    }
    else {
      const type = first(types, [])[1]; // eslint-disable-line prefer-destructuring

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
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Wrapper>
            {children({
              ...other,
              create: this.openFilterDialog,
              edit: this.openFilterDialog,
            })}
            {dialogVisible &&
              <FilterDialog
                comment={comment}
                id={id}
                name={name}
                term={term}
                title={title}
                type={type}
                types={types}
                onClose={this.closeFilterDialog}
                onSave={save}
              />
            }
          </Wrapper>
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withCapabilties(FilterComponent);
