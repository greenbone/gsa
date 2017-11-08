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

import _ from 'gmp/locale.js';

import IconDivider from '../../components/layout/icondivider.js';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import {goto_details} from '../../entity/component.js';

import {withDashboard} from '../../components/dashboard/dashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';
import NewIcon from '../../components/icon/newicon.js';

import HostsCharts from './charts.js';
import HostsFilterDialog from './filterdialog.js';
import HostsTable from './table.js';
import HostComponent from './component.js';

import {ASSETS_FILTER_FILTER} from 'gmp/models/filter.js';

const ToolBarIcons = ({
  onHostCreateClick,
}, {capabilities}) => (
  <IconDivider>
    <HelpIcon page="hosts"/>
    {capabilities.mayCreate('host') &&
      <NewIcon
        title={_('New Host')}
        onClick={onHostCreateClick}/>
    }
  </IconDivider>
);

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ToolBarIcons.propTypes = {
  onHostCreateClick: PropTypes.func.isRequired,
};

const Dashboard = withDashboard(HostsCharts, {
  hideFilterSelect: true,
  configPrefId: 'd3f5f2de-a85b-43f2-a817-b127457cc8ba',
  defaultControllersString: 'host-by-severity-class|host-by-topology|' +
    'host-by-modification-time',
  defaultControllerString: 'hosts-by-cvss',
});

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <HostComponent
    onTargetCreated={goto_details('target', props)}
    onTargetCreateError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
  >
    {({
      create,
      createtargetfromselection,
      createtargetfromhost,
      delete: delete_func,
      download,
      edit,
    }) => (
      <EntitiesPage
        {...props}
        dashboard={Dashboard}
        filterEditDialog={HostsFilterDialog}
        sectionIcon="host.svg"
        table={HostsTable}
        title={_('Hosts')}
        toolBarIcons={ToolBarIcons}
        onError={onError}
        onHostCreateClick={create}
        onHostDeleteClick={delete_func}
        onHostDownloadClick={download}
        onHostEditClick={edit}
        onTargetCreateFromSelection={createtargetfromselection}
        onTargetCreateFromHostClick={createtargetfromhost}
      />
    )}
  </HostComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('host', {
  filtersFilter: ASSETS_FILTER_FILTER,
})(Page);

// vim: set ts=2 sw=2 tw=80:
