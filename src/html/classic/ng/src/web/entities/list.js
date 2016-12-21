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
import {is_defined, log} from '../../utils.js';

import SelectionType from '../selectiontype.js';

import Download from '../form/download.js';

import EntitiesTable from '../entities/table.js';

export class EntitiesList extends React.Component {

  constructor(...args) {
    super(...args);

    this.onSelectionTypeChange = this.onSelectionTypeChange.bind(this);
    this.onDownload = this.onDownload.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onDeselect = this.onDeselect.bind(this);

    this.defaultState();
  }

  defaultState() {
    let entities = this.getEntities();

    this.state = {
      selection_type: SelectionType.SELECTION_PAGE_CONTENTS,
      selected: entities ? entities : [],
    };
  }

  getEntities() {
    return null;
  }

  getGmp() {
    return null;
  }

  componentWillReceiveProps(props) {
    let {selection_type} = this.state;
    let {entities} = props;

    if (selection_type !== SelectionType.SELECTION_USER) {
      this.setState({selected: entities});
    }
  }

  onSelect(entity) {
    let {selected} = this.state;

    selected.add(entity);

    this.setState({selected});
  }

  onDeselect(entity) {
    let {selected} = this.state;

    selected.delete(entity);

    this.setState({selected});
  }

  onSelectionTypeChange(value) {
    let selected;
    if (value === SelectionType.SELECTION_USER) {
      selected = new Set();
    }
    else {
      selected = this.getEntities();
    }

    this.setState({selection_type: value, selected});
  }

  onDelete() {
    let {onDeleteBulk} = this.props;
    let {selected, selection_type} = this.state;
    let gmp = this.getGmp();
    let entities = this.getEntities();
    let promise;

    if (selection_type === SelectionType.SELECTION_FILTER) {
      let filter = entities.getFilter().all();
      promise  = gmp.deleteByFilter(filter);
    }
    else {
      promise = gmp.delete(selected);
    }

    promise.then(deleted => {
      if (onDeleteBulk) {
        onDeleteBulk(deleted);
      }
      log.debug('successfully deleted entities', deleted);
    }, err => log.error(err));
  }

  onDownload() {
    let {selected, selection_type} = this.state;
    let entities = this.getEntities();
    let gmp = this.getGmp();
    let filter = entities.getFilter();
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = gmp.export(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = gmp.exportByFilter(filter);
    }
    else {
      promise = gmp.exportByFilter(filter.all());
    }

    promise.then(xhr => {
      this.download.setData(xhr.responseText);
      this.download.download();
    }, err => log.error(err));
  }

  renderEntities() {
    return null;
  }

  renderHeader() {
    return null;
  }

  renderFooter() {
    return null;
  }

  render() {
    let entities = this.getEntities();

    if (!is_defined(entities)) {
      return <div>{_('Loading')}</div>;
    }

    if (entities.length === 0) {
      return <div>{this.empty_title}</div>;
    }

    let entries = this.renderEntities();
    let header = this.renderHeader();
    let footer = this.renderFooter();

    let filter = entities.getFilter();
    let counts = entities.getCounts();
    return (
      <div>
        <EntitiesTable
          counts={counts}
          filter={filter}
          entries={entries}
          header={header}
          footer={footer}
          onFirstClick={this.props.onFirstClick}
          onLastClick={this.props.onLastClick}
          onNextClick={this.props.onNextClick}
          onPreviousClick={this.props.onPreviousClick}/>
        <Download ref={ref => this.download = ref}
          filename={this.export_filename}/>
      </div>
    );
  }
}

EntitiesList.propTypes = {
  onDeleteBulk: React.PropTypes.func,
  onFirstClick: React.PropTypes.func,
  onLastClick: React.PropTypes.func,
  onPreviousClick: React.PropTypes.func,
  onNextClick: React.PropTypes.func,
};

EntitiesList.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default EntitiesList;

// vim: set ts=2 sw=2 tw=80:
