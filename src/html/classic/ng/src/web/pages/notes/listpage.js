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

import  _ from 'gmp/locale.js';
import {is_defined, is_empty, shorten} from 'gmp/utils.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import {withEntitiesContainer} from '../../entities/container.js';

import {withDashboard} from '../../components/dashboard/dashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';
import NewIcon from '../../components/icon/newicon.js';

import NotesCharts from './charts.js';
import NoteDialog from './dialog.js';
import FilterDialog from './filterdialog.js';
import NotesTable from './table.js';

import {NOTES_FILTER_FILTER} from 'gmp/models/filter.js';

const Dashboard = withDashboard(NotesCharts, {
  hideFilterSelect: true,
  configPrefId: 'ce7b121-c609-47b0-ab57-fd020a0336f4',
  defaultControllersString: 'note-by-active-days|note-by-created|' +
    'note-by-text-words',
  defaultControllerString: 'note-by-active-days',
});

const ToolBarIcons = ({onNewNoteClick}, {capabilities}) => {
  return (
    <Layout flex box>
      <HelpIcon
        page="notes"
        title={_('Help: Notes')}/>
      {capabilities.mayCreate('note') &&
        <NewIcon title={_('New Note')}
          onClick={onNewNoteClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ToolBarIcons.propTypes = {
  onNewNoteClick: PropTypes.func,
};


class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSaveNote = this.handleSaveNote.bind(this);
    this.openNoteDialog = this.openNoteDialog.bind(this);
  }

  openNoteDialog(note) {
    let {gmp} = this.context;

    if (is_defined(note) && note.id) {
      let active = '0';
      if (note.isActive()) {
        if (is_empty(note.end_time)) {
          active = '-1';
        }
        else {
          active = '-2';
        }
      }
      this.note_dialog.show({
        active,
        hosts: is_defined(note.hosts) ? '--' : '',
        hosts_manual: note.hosts,
        port: note.port,
        oid: is_defined(note.nvt) ? note.nvt.oid : undefined,
        note,
        note_id: note.id,
        nvt: note.nvt,
        note_severity: note.severity,
        task_id: is_defined(note.task) && is_defined(note.task.id) ? '0' : '',
        task_uuid: is_defined(note.task) ? note.task.id : '',
        result_id: is_defined(note.result) && is_defined(note.result.id) ?
          '0' : '',
        result_uuid: is_defined(note.result) ? note.result.id : '',
        severity: note.severity,
        text: note.text,
      }, {
        title: _('Edit Note {{name}}', {name: shorten(note.text, 20)}),
      });
    }
    else {
      this.note_dialog.show({});
    }
    gmp.tasks.getAll().then(tasks => this.note_dialog.setValue('tasks', tasks));
  }

  handleSaveNote(data) {
    let {entityCommand, onChanged} = this.props;
    let promise;
    if (data.note && data.note.id) {
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
          onEditNoteClick={this.openNoteDialog}
          onNewNoteClick={this.openNoteDialog}/>
        <NoteDialog
          ref={ref => this.note_dialog = ref}
          onSave={this.handleSaveNote}/>
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withEntitiesContainer(Page, 'note', {
  dashboard: Dashboard,
  extraLoadParams: {details: 1},
  filterEditDialog: FilterDialog,
  filtersFilter: NOTES_FILTER_FILTER,
  sectionIcon: 'note.svg',
  table: NotesTable,
  title: _('Notes'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
