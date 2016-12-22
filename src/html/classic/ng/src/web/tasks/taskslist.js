/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {TableRow, TableHead} from '../table.js';
import Layout from '../layout.js';
import SelectionType from '../selectiontype.js';

import EntitiesList from '../entities/list.js';
import EntitiesFooter from '../entities/footer.js';

import Sort from '../sortby.js';
import TasksListEntry from './taskslistentry.js';

import OverridesIcon from '../icons/overridesicon.js';

export class TasksList extends EntitiesList {

  constructor(...args) {
    super(...args);

    this.export_filename = 'tasks.xml';
    this.empty_title = _('No tasks available');
  }

  getGmp() {
    return this.context.gmp.tasks;
  }

  getEntities() {
    return this.props.tasks;
  }

  renderHeader() {
    let {onSortChange} = this.props;
    let entities = this.getEntities();
    let filter = entities.getFilter();
    let overrides = filter.get('apply_overrides');
    return [
      <TableRow key="1">
        <TableHead rowSpan="2">
          <Sort by="name" onClick={onSortChange}>
            {_('Name')}
          </Sort>
        </TableHead>
        <TableHead rowSpan="2" width="10em">
          <Sort by="status" onClick={onSortChange}>
            {_('Status')}
          </Sort>
        </TableHead>
        <TableHead colSpan="2">{_('Reports')}</TableHead>
        <TableHead rowSpan="2" width="10em">
          <Layout flex align="space-between">
            <Sort by="severity" onClick={onSortChange}>
              {_('Severity')}
            </Sort>
            <OverridesIcon overrides={overrides}
              onClick={this.props.onToggleOverridesClick}/>
          </Layout>
        </TableHead>
        <TableHead rowSpan="2" width="6em">
          <Sort by="trend" onClick={onSortChange}>
            {_('Trend')}
          </Sort>
        </TableHead>
        <TableHead rowSpan="2" width="10em">{_('Actions')}</TableHead>
      </TableRow>,
      <TableRow key="2">
        <TableHead>
          <Sort by="total" onClick={onSortChange}>
            {_('Total')}
          </Sort>
        </TableHead>
        <TableHead>
          <Sort by="last" onClick={onSortChange}>
            {_('Last')}
          </Sort>
        </TableHead>
      </TableRow>
    ];
  }

  renderFooter() {
    let {selection_type} = this.state;
    return (
      <EntitiesFooter span="8" download trash
        selectionType={selection_type}
        onTrashClick={this.onDelete}
        onDownloadClick={this.onDownload}
        onSelectionTypeChange={this.onSelectionTypeChange}>
      </EntitiesFooter>
    );
  }

  renderEntities() {
    let entities = this.getEntities();
    let {selection_type} = this.state;
    return entities.map(task => {
      return (
        <TasksListEntry key={task.id} task={task}
          selection={selection_type === SelectionType.SELECTION_USER}
          onSelected={this.onSelect}
          onDeselected={this.onDeselect}
          onDelete={this.props.onDelete}
          onCloned={this.props.onCloned}/>
      );
    });
  }
};

TasksList.propTypes = {
  tasks: React.PropTypes.object,
  onDelete: React.PropTypes.func,
  onDeleteBulk: React.PropTypes.func,
  onCloned: React.PropTypes.func,
  onFirstClick: React.PropTypes.func,
  onLastClick: React.PropTypes.func,
  onPreviousClick: React.PropTypes.func,
  onNextClick: React.PropTypes.func,
  onToggleOverridesClick: React.PropTypes.func,
};

export default TasksList;

// vim: set ts=2 sw=2 tw=80:
