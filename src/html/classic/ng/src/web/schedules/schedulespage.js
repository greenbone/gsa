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

import moment from 'moment-timezone';

import _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import ScheduleDialog from './dialog.js';
import Row from './row.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['first_run', _('First Run')],
  ['next_run', _('Next Run')],
  ['period', _('Period')],
  ['duration', _('Duration')],
];

const ToolBarIcons = ({
    onNewScheduleClick
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="schedules"
        title={_('Help: Schedules')}/>
      {capabilities.mayCreate('schedule') &&
        <NewIcon
          title={_('New Schedule')}
          onClick={onNewScheduleClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewScheduleClick: PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSaveSchedule = this.handleSaveSchedule.bind(this);
    this.openScheduleDialog = this.openScheduleDialog.bind(this);
  }

  handleSaveSchedule(data) {
    const {onChanged, entityCommand} = this.props;
    let promise;

    if (is_defined(data.schedule)) {
      promise = entityCommand.save(data);
    }
    else {
      promise = entityCommand.create(data);
    }

    return promise.then(() => onChanged());
  }

  openScheduleDialog(schedule) {
    let {gmp} = this.context;

    if (is_defined(schedule)) {
      let date = schedule.first_time;
      this.schedule_dialog.show({
        comment: schedule.comment,
        date,
        duration: schedule.simple_duration.value,
        duration_unit: is_defined(schedule.simple_duration.unit) ?
          schedule.simple_duration.unit : 'hour',
        hour: date.hours(),
        id: schedule.id,
        minute: date.minutes(),
        name: schedule.name,
        period: schedule.simple_period.value,
        period_unit: is_defined(schedule.simple_period.unit) ?
          schedule.simple_period.unit : 'hour',
        schedule,
        timezone: schedule.timezone,

      }, {
        title: _('Edit Schedule {{name}}', {name: schedule.name}),
      });
    }
    else {
      let timezone = gmp.globals.timezone;
      let now = moment().tz(timezone);

      this.schedule_dialog.show({
        timezone,
        minute: now.minutes(),
        hour: now.hours(),
        date: now,
      });
    }
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEntityEdit={this.openScheduleDialog}
          onNewScheduleClick={this.openScheduleDialog}
        />
        <ScheduleDialog
          ref={ref => this.schedule_dialog = ref}
          onSave={this.handleSaveSchedule}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: PropTypes.func,
  showError: PropTypes.func.isRequired,
  showSuccess: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No schedules available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  footer: createEntitiesFooter({
    download: 'schedules.xml',
    span: 6,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'schedule', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'schedule.svg',
  table: Table,
  title: _('Schedules'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
