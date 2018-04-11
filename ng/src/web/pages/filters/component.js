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
  ['agent', _('Agent')],
  ['alert', _('Alert')],
  ['asset', _('Asset')],
  ['credential', _('Credential')],
  ['filter', _('Filter')],
  ['group', _('Group')],
  ['note', _('Note')],
  ['override', _('Override')],
  ['permission', _('Permission')],
  ['port_list', _('Port List')],
  ['report', _('Report')],
  ['report_format', _('Report Format')],
  ['result', _('Result')],
  ['role', _('Role')],
  ['schedule', _('Schedule')],
  ['info', _('SecInfo')],
  ['config', _('Scan Config')],
  ['tag', _('Tag')],
  ['target', _('Target')],
  ['task', _('Task')],
  ['user', _('User')],
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
    }
    else {
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
