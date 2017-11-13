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

import {AGENTS_FILTER_FILTER} from 'gmp/models/filter.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import HelpIcon from '../../components/icon/helpicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

import AgentComponent from './component.js';
import AgentsTable, {SORT_FIELDS} from './table.js';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onAgentCreateClick,
}) => (
  <IconDivider>
    <HelpIcon
      page="agents"
      title={_('Help: Agents')}
    />
    {capabilities.mayCreate('agent') &&
      <NewIcon
        title={_('New Agent')}
        onClick={onAgentCreateClick}
      />
    }
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onAgentCreateClick: PropTypes.func.isRequired,
};

const AgentsFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const AgentsPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <AgentComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onVerifyError={onError}
    onVerified={onChanged}
  >{({
    clone,
    create,
    delete: delete_func,
    download,
    edit,
    save,
    verify,
  }) => (
    <EntitiesPage
      {...props}
      filterEditDialog={AgentsFilterDialog}
      sectionIcon="agent.svg"
      table={AgentsTable}
      title={_('Agents')}
      toolBarIcons={ToolBarIcons}
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onError={onError}
      onAgentCloneClick={clone}
      onAgentCreateClick={create}
      onAgentDeleteClick={delete_func}
      onAgentDownloadClick={download}
      onAgentEditClick={edit}
      onAgentSaveClick={save}
      onAgentVerifyClick={verify}
    />
  )}
  </AgentComponent>
);

AgentsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};


export default withEntitiesContainer('agent', {
  filtersFilter: AGENTS_FILTER_FILTER,
})(AgentsPage);

// vim: set ts=2 sw=2 tw=80:
