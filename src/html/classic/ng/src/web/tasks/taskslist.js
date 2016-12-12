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
import {is_defined, log, autobind} from '../../utils.js';

import Icon from '../icon.js';
import {StrippedTable, TableRow, TableHead} from '../table.js';
import Layout from '../layout.js';
import Pagination from '../pagination.js';

import Select2 from '../form/select2.js';
import Download from '../form/download.js';

import TasksListEntry from './taskslistentry.js';

const SELECTION_PAGE_CONTENTS = '0';
const SELECTION_USER = '1';
const SELECTION_FILTER = '2';

export class TasksList extends React.Component {

  constructor(...args) {
    super(...args);

    let {tasks} = this.props;

    this.state = {
      selection_type: SELECTION_PAGE_CONTENTS,
      selected: tasks ? tasks : [],
    };

    autobind(this, 'on');
  }

  componentWillReceiveProps(props) {
    let {selection_type} = this.state;
    let {tasks} = props;

    if (selection_type !== SELECTION_USER) {
      this.setState({selected: tasks});
    }
  }

  onDeleteTasks() {
    let {onDeleteBulk, tasks} = this.props;
    let {selected, selection_type} = this.state;
    let {gmp} = this.context;
    let promise;

    if (selection_type === SELECTION_FILTER) {
      let filter = tasks.getFilter().all();
      promise  = gmp.tasks.deleteByFilter(filter);
    }
    else {
      promise = gmp.tasks.delete(selected);
    }

    promise.then(deleted => {
      if (onDeleteBulk) {
        onDeleteBulk(deleted);
      }
      log.debug('successfully deleted tasks', deleted);
    }, err => log.error(err));
  }

  onDownloadTasks() {
    let {gmp} = this.context;
    let {tasks} = this.props;
    let {selected, selection_type} = this.state;
    let promise;

    if (selection_type === SELECTION_USER) {
      promise = gmp.tasks.export(selected);
    }
    else if (selection_type === SELECTION_PAGE_CONTENTS) {
      promise = gmp.tasks.exportByFilter(tasks.getFilter());
    }
    else {
      promise = gmp.tasks.exportByFilter(tasks.getFilter().all());
    }

    promise.then(xhr => {
      this.download.setData(xhr.responseText);
      this.download.download();
    }, err => log.error(err));
  }

  onSelectionTypeChange(value) {
    let {tasks} = this.props;
    let selected = tasks;

    if (value === SELECTION_USER) {
      selected = new Set();
    }

    this.setState({selection_type: value, selected});
  }

  onSelectTask(task) {
    let {selected} = this.state;

    selected.add(task);

    this.setState({selected});
  }

  onDeselectTask(task) {
    let {selected} = this.state;

    selected.delete(task);

    this.setState({selected});
  }

  render() {
    let {tasks} = this.props;
    let {selection_type} = this.state;

    if (!is_defined(tasks) || tasks.length === 0) {
      return <div>{_('No tasks available')}</div>;
    }

    let filter = tasks.getFilter();
    let counts = tasks.getCounts();
    let overrides = filter.get('apply_overrides');
    let entries = tasks.map(task => {
      return (
        <TasksListEntry key={task.id} task={task}
          selection={selection_type === SELECTION_USER}
          onSelected={this.onSelectTask}
          onDeselected={this.onDeselectTask}
          onDelete={this.props.onDelete}
          onCloned={this.props.onCloned}/>
      );
    });

    let overrides_icon;
    if (overrides === 1) {
      overrides_icon = (
        <Icon size="small" img="overrides_enabled.svg"
          title={_('Overrides are applied')}
          onClick={this.props.onToggleOverridesClick}/>
      );
    }
    else {
      overrides_icon = (
        <Icon size="small" img="overrides_disabled.svg"
          title={_('No Overrides')}
          onClick={this.props.onToggleOverridesClick}/>
      );
    }

    let header = [
      <TableRow key="1">
        <TableHead rowSpan="2">{_('Name')}</TableHead>
        <TableHead rowSpan="2" width="10em">{_('Status')}</TableHead>
        <TableHead colSpan="2">{_('Reports')}</TableHead>
        <TableHead rowSpan="2" width="10em">
          <Layout flex align="space-between">
            {_('Severity')} {overrides_icon}
          </Layout>
        </TableHead>
        <TableHead rowSpan="2" width="6em">{_('Trend')}</TableHead>
        <TableHead rowSpan="2" width="10em">{_('Actions')}</TableHead>
      </TableRow>,
      <TableRow key="2">
        <TableHead>Total</TableHead>
        <TableHead>Last</TableHead>
      </TableRow>
    ];

    let delete_title;
    let download_title;
    if (selection_type === SELECTION_PAGE_CONTENTS) {
      delete_title = _('Move page contents to trashcan');
      download_title = _('Export page contents');
    }
    else if (selection_type === SELECTION_USER) {
      delete_title = _('Move selection to trashcan');
      download_title = _('Export selection');
    }
    else if (selection_type === SELECTION_FILTER) {
      delete_title = _('Move all filtered to trashcan');
      download_title = _('Export all filtered');
    }

    let footer = (
      <TableRow>
        <td colSpan="8">
          <Layout flex align={['end', 'center']}>
            <Select2
              value={selection_type}
              onChange={this.onSelectionTypeChange}>
              <option value={SELECTION_PAGE_CONTENTS}>
                {_('Apply to page contents')}
              </option>
              <option value={SELECTION_USER}>
                {_('Apply to selection')}
              </option>
              <option value={SELECTION_FILTER}>
                {_('Apply to all filtered')}
              </option>
            </Select2>
            <Icon img="trashcan.svg"
              title={delete_title}
              onClick={this.onDeleteTasks}/>
            <Icon img="download.svg"
              title={download_title}
              onClick={this.onDownloadTasks}/>
            <Download ref={ref => this.download = ref} filename="tasks.xml"/>
          </Layout>
        </td>
      </TableRow>
    );

    let pagination = (
      <Pagination
        counts={counts}
        onFirstClick={this.props.onFirstClick}
        onLastClick={this.props.onLastClick}
        onNextClick={this.props.onNextClick}
        onPreviousClick={this.props.onPreviousClick}/>
    );

    let filterstring = filter ? filter.toFilterString() : '';
    return (
      <div className="entities-table">
        {pagination}
        <StrippedTable header={header} footer={footer}>
          {entries}
        </StrippedTable>
        <Layout flex align="space-between">
          <div className="footnote">
            {_('(Applied filter: {{filter}})', {filter: filterstring})}
          </div>
          {pagination}
        </Layout>
      </div>
    );
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

TasksList.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default TasksList;

// vim: set ts=2 sw=2 tw=80:
