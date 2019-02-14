/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import {AGENTS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';

import AgentIcon from 'web/components/icon/agenticon';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/agents';

import AgentComponent from './component';
import AgentsTable, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(({capabilities, onAgentCreateClick}) => (
  <IconDivider>
    <ManualIcon page="search" searchTerm="agent" title={_('Help: Agents')} />
    {capabilities.mayCreate('agent') && (
      <NewIcon title={_('New Agent')} onClick={onAgentCreateClick} />
    )}
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
  onInteraction,
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
    onInstallerDownloadError={onError}
    onInstallerDownloaded={onDownloaded}
    onInteraction={onInteraction}
    onVerifyError={onError}
    onVerified={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      downloadinstaller,
      edit,
      save,
      verify,
    }) => (
      <EntitiesPage
        {...props}
        filterEditDialog={AgentsFilterDialog}
        filtersFilter={AGENTS_FILTER_FILTER}
        sectionIcon={<AgentIcon size="large" />}
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
        onAgentInstallerDownloadClick={downloadinstaller}
        onAgentSaveClick={save}
        onAgentVerifyClick={verify}
        onInteraction={onInteraction}
      />
    )}
  </AgentComponent>
);

AgentsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('agent', {
  entitiesSelector,
  loadEntities,
})(AgentsPage);

// vim: set ts=2 sw=2 tw=80:
