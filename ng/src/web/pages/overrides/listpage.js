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
import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import withDashboard from '../../components/dashboard/withDashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import OverridesCharts from './charts.js';
import FilterDialog from './filterdialog.js';
import OverridesTable from './table.js';
import OverrideComponent from './component.js';

import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter.js';


const Dashboard = withDashboard({
  hideFilterSelect: true,
  configPrefId: '054862fe-0781-4527-b1aa-2113bcd16ce7',
  defaultControllersString: 'override-by-active-days|' +
    'override-by-created|override-by-text-words',
  defaultControllerString: 'override-by-active-days',
})(OverridesCharts);

const ToolBarIcons = ({
  onOverrideCreateClick,
}, {capabilities}) => {
  return (
    <IconDivider>
      <HelpIcon
        page="overrides"
        title={_('Help: Overrides')}/>

      {capabilities.mayCreate('override') &&
        <NewIcon
          title={_('New Override')}
          onClick={onOverrideCreateClick}
        />
      }
    </IconDivider>
  );
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ToolBarIcons.propTypes = {
  onOverrideCreateClick: PropTypes.func.isRequired,
};

const Page = ({
  onChanged,
  onError,
  onDownloaded,
  ...props
}) => (
  <OverrideComponent
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      save,
    }) => (
      <EntitiesPage
        {...props}
        dashboard={Dashboard}
        filterEditDialog={FilterDialog}
        sectionIcon="override.svg"
        table={OverridesTable}
        title={_('Overrides')}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onDownloaded={onDownloaded}
        onError={onError}
        onOverrideCloneClick={clone}
        onOverrideCreateClick={create}
        onOverrideDeleteClick={delete_func}
        onOverrideDownloadClick={download}
        onOverrideEditClick={edit}
        onOverrideSaveClick={save}
      />
    )}
  </OverrideComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('override', {
  extraLoadParams: {details: 1},
  filtersFilter: OVERRIDES_FILTER_FILTER,
})(Page);

// vim: set ts=2 sw=2 tw=80:
