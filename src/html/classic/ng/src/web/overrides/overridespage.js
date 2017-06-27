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
import {is_defined, is_empty, includes, shorten} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import {withDashboard} from '../dashboard/dashboard.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import OverridesCharts from './charts.js';
import OverrideDialog from './dialog.js';
import FilterDialog from './filterdialog.js';
import Table from './table.js';

import {OVERRIDES_FILTER_FILTER} from '../../gmp/models/filter.js';


const Dashboard = withDashboard(OverridesCharts, {
  hideFilterSelect: true,
  configPrefId: '054862fe-0781-4527-b1aa-2113bcd16ce7',
  defaultControllersString: 'override-by-active-days|' +
    'override-by-created|override-by-text-words',
  defaultControllerString: 'override-by-active-days',
});

const ToolBarIcons = ({
    onNewOverrideClick,
  }, {capabilities}) => {
  return (
    <Layout flex box>
      <HelpIcon
        page="overrides"
        title={_('Help: Overrides')}/>

      {capabilities.mayCreate('override') &&
        <NewIcon title={_('New Override')}
          onClick={onNewOverrideClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ToolBarIcons.propTypes = {
  onNewOverrideClick: PropTypes.func,
};

class Page extends React.Component {
  constructor(...args) {
    super(...args);

    this.openOverrideDialog = this.openOverrideDialog.bind(this);
    this.handleSaveOverride = this.handleSaveOverride.bind(this);
  }

  openOverrideDialog(override) {
    let {gmp} = this.context;

    if (is_defined(override)) {
      let active = '0';
      if (override.isActive()) {
        if (is_empty(override.end_time)) {
          active = '-1';
        }
        else {
          active = '-2';
        }
      }

      let custom_severity = '0';
      let new_severity_from_list = '';
      let new_severity = '';

      if (includes([10, 5, 2, 0, -1], override.new_severity)) {
        new_severity_from_list = override.new_severity;
      }
      else {
        custom_severity = '1';
        new_severity = override.new_severity;
      }
      this.override_dialog.show({
        active,
        custom_severity,
        hosts: override.hosts,
        new_severity,
        new_severity_from_list,
        nvt: override.nvt,
        oid: override.nvt ? override.nvt.oid : undefined,
        override,
        override_id: override.id,
        override_severity: override.severity,
        port: override.port,
        result_id: is_empty(override.result.id) ? '' : '0',
        result_uuid: override.result.id,
        severity: override.severity,
        task_id: is_empty(override.task.id) ? '' : '0',
        task_uuid: override.task.id,
        text: override.text,
        visible: true,
      }, {
        title: _('Edit Override {{name}}',
          {name: shorten(override.text, 20)}),
      });
    }
    else {
      this.override_dialog.show({});
    }

    gmp.tasks.getAll().then(tasks =>
      this.override_dialog.setValue('tasks', tasks));
  }

  handleSaveOverride(data) {
    let {entityCommand, onChanged} = this.props;
    let promise;
    if (is_defined(data.override) && data.override.id) {
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
          onEditOverrideClick={this.openOverrideDialog}
          onNewOverrideClick={this.openOverrideDialog}/>
        <OverrideDialog
          ref={ref => this.override_dialog = ref}
          onSave={this.handleSaveOverride}/>
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

export default withEntitiesContainer(Page, 'override', {
  dashboard: Dashboard,
  extraLoadParams: {details: 1},
  filterEditDialog: FilterDialog,
  filtersFilter: OVERRIDES_FILTER_FILTER,
  sectionIcon: 'override.svg',
  table: Table,
  title: _('Overrides'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
