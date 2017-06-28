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

import _ from '../../locale.js';
import {is_defined, first} from '../../utils.js';

import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import HelpIcon from '../components/icon/helpicon.js';
import NewIcon from '../components/icon/newicon.js';

import Layout from '../components/layout/layout.js';

import {createFilterDialog} from '../components/powerfilter/dialog.js';

import FilterEditDialog from './dialog.js';
import Row from './row.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['term', _('Term')],
  ['type', _('Type')],
];

const ToolBarIcons = ({
    onNewFilterClick
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="filters"
        title={_('Help: Filters')}/>
      {capabilities.mayCreate('filter') &&
        <NewIcon
          title={_('New Filter')}
          onClick={onNewFilterClick}/>
      }
    </Layout>
  );
};

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
  for (let option of types) {
    if (option[1] === type) {
      return true;
    }
  }
  return false;
};

ToolBarIcons.propTypes = {
  onNewFilterClick: PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.openFilterDialog = this.openFilterDialog.bind(this);
    this.handleSaveFilter = this.handleSaveFilter.bind(this);
  }

  openFilterDialog(filter) {
    let {capabilities} = this.context;

    let types = FILTER_OPTIONS.filter(option =>
        filter_types(capabilities, option[0]));

    if (is_defined(filter)) {
      let {type} = filter;
      if (!includes_type(types, type)) {
        type = first(types, [])[1];
      }
      this.filter_dialog.show({
        comment: filter.comment,
        filter,
        id: filter.id,
        name: filter.name,
        term: filter.term,
        type,
        types,
      });
    }
    else {
      let type = first(types, [])[1];

      this.filter_dialog.show({
        type,
        types,
      });
    }
  }

  handleSaveFilter(data) {
    let {entityCommand, onChanged} = this.props;
    let promise;
    if (data.filter) {
      promise = entityCommand.save(data);
    }
    else {
      promise = entityCommand.create(data);
    }
    return promise.then(() => onChanged());
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEntityEdit={this.openFilterDialog}
          onNewFilterClick={this.openFilterDialog}
        />
        <FilterEditDialog
          ref={ref => this.filter_dialog = ref}
          onSave={this.handleSaveFilter}
        />
      </Layout>
    );
  }

}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: PropTypes.func.isRequired,
};


Page.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No filters available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  footer: createEntitiesFooter({
    download: 'filters.xml',
    span: 6,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'filter', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'filter.svg',
  table: Table,
  title: _('Filters'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
