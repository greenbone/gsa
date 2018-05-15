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

import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';

import IconDivider from '../../components/layout/icondivider.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import {goto_details} from '../../entity/component.js';

import DashboardControls from '../../components/dashboard2/controls';

import ManualIcon from '../../components/icon/manualicon.js';
import NewIcon from '../../components/icon/newicon.js';

import HostsFilterDialog from './filterdialog.js';
import HostsTable from './table.js';
import HostComponent from './component.js';

import HostsDashboard, {HOSTS_DASHBOARD_ID} from './dashboard';


const ToolBarIcons = withCapabilities(({
  capabilities,
  onHostCreateClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="hosts-view"
      title={_('Help: Hosts')}
    />
    {capabilities.mayCreate('host') &&
      <NewIcon
        title={_('New Host')}
        onClick={onHostCreateClick}/>
    }
  </IconDivider>
));

ToolBarIcons.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  onHostCreateClick: PropTypes.func.isRequired,
};

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
        dashboard2={HostsDashboard}
        dashboardControls={() => (
          <DashboardControls dashboardId={HOSTS_DASHBOARD_ID} />
        )}
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
  filtersFilter: HOSTS_FILTER_FILTER,
})(Page);

// vim: set ts=2 sw=2 tw=80:
