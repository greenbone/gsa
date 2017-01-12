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

import  _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import FilterDialog from '../filterdialog.js';
import Section from '../section.js';
import Sort from '../sortby.js';
import Toolbar from '../toolbar.js';
import PowerFilter from '../powerfilter.js';

import Dashboard from '../dashboard/dashboard.js';
import DashboardControls from '../dashboard/controls.js';

import EntitiesComponent from '../entities/component.js';
import EntitiesTable from '../entities/table.js';
import EntitiesFooter from '../entities/footer.js';

import Download from '../form/download.js';

import HelpIcon from '../icons/helpicon.js';

import TableRow from '../table/row.js';
import TableHead from '../table/head.js';

import NotesCharts from './charts.js';
import NotesListRow from './noteslistrow.js';

import {NOTES_FILTER_FILTER} from '../../gmp/commands/filters.js';

const SORT_FIELDS = [
  ['text', _('Text')],
  ['nvt', _('Nvt')],
  ['active', _('Active')],
];

export class Notes extends EntitiesComponent {

  getGmp() {
    return this.context.gmp.notes;
  }

  loadFilters() {
    this.context.gmp.filters.get(NOTES_FILTER_FILTER).then(filters => {
      this.setState({filters});
    });
  }

  getSectionTitle() {
    let entities = this.getEntities();

    if (!entities) {
      return _('Notes');
    }

    let counts = this.getCounts();
    return _('Notes ({{filtered}} of {{all}})', counts);
  }

  renderHeader() {
    let entities = this.getEntities();

    if (!is_defined(entities)) {
      return null;
    }

    return (
      <TableRow>
        <TableHead>
          <Sort by="text" onClick={this.onSortChange}>
            {_('Text')}
          </Sort>
        </TableHead>
        <TableHead>
          <Sort by="nvt" onClick={this.onSortChange}>
            {_('NVT')}
          </Sort>
        </TableHead>
        <TableHead>
          <Sort by="active" onClick={this.onSortChange}>
            {_('Active')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          {_('Actions')}
        </TableHead>
      </TableRow>
    );
  }

  renderFooter() {
    let {selection_type} = this.state;
    return (
      <EntitiesFooter span="8" download trash
        selectionType={selection_type}
        onTrashClick={this.onDeleteBulk}
        onDownloadClick={this.onDownloadBulk}
        onSelectionTypeChange={this.onSelectionTypeChange}>
      </EntitiesFooter>
    );
  }

  renderRows() {
    let entities = this.getEntities();
    let {selection_type} = this.state;

    if (!is_defined(entities)) {
      return null;
    }

    return entities.map(note => {
      return (
        <NotesListRow
          key={note.id}
          note={note}
          selection={selection_type}
          onSelected={this.onSelect}
          onDeselected={this.onDeselect}
          onDelete={this.reload}
          onCloned={this.reload}/>
      );
    });
  }

  render() {
    let {filters, filter} = this.state;
    let counts = this.getCounts();

    return (
      <div>
        <Toolbar>
          <HelpIcon page="notes"/>
          <PowerFilter
            filter={filter}
            filters={filters}
            onFilterCreated={this.onFilterCreated}
            onResetClick={this.onFilterReset}
            onEditClick={() => this.filter_dialog.show()}
            onUpdate={this.onFilterUpdate}/>

          <FilterDialog
            sortFields={SORT_FIELDS}
            filter={filter}
            ref={ref => this.filter_dialog = ref}
            onSave={this.onFilterUpdate}/>
        </Toolbar>

        <Section title={this.getSectionTitle()}
          img="note.svg"
          extra={<DashboardControls/>}>
          <Dashboard hide-filter-select
            filter={filter}
            config-pref-id="ce7b121-c609-47b0-ab57-fd020a0336f4"
            default-controllers-string={'note-by-active-days|note-by-created|' +
              'note-by-text-words'}
            default-controller-string="note-by-active-days">
            <NotesCharts filter={filter}/>
          </Dashboard>

          <EntitiesTable
            header={this.renderHeader()}
            footer={this.renderFooter()}
            counts={counts}
            filter={filter}
            emptyTitle={_('No notes available')}
            rows={this.renderRows()}
            onFirstClick={this.onFirst}
            onLastClick={this.onLast}
            onNextClick={this.onNext}
            onPreviousClick={this.onPrevious}/>

          <Download ref={ref => this.download = ref}
            filename="notes.xml"/>
        </Section>
      </div>
    );
  }
}

Notes.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default Notes;

// vim: set ts=2 sw=2 tw=80:
