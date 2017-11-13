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
import withCapabilities from '../../utils/withCapabilities.js';

import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';
import EntityPage from '../../entity/page.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import Icon from '../../components/icon/icon.js';
import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';

import AgentComponent from './component.js';
import AgentDetails from './details.js';

const ToolBarIcons = withCapabilities(({
  capabilities,
  entity,
  onAgentCloneClick,
  onAgentCreateClick,
  onAgentDeleteClick,
  onAgentDownloadClick,
  onAgentEditClick,
  onAgentVerifyClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <HelpIcon
        page="agent_details"
        title={_('Help: Agent Details')}
      />
      <ListIcon
        title={_('Agent List')}
        page="agents"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onAgentCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onAgentCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onAgentEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onAgentDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Agent as XML')}
        onClick={onAgentDownloadClick}
      />
      {capabilities.mayOp('verify_report_format') &&
        <Icon
          img="verify.svg"
          value={entity}
          title={_('Verify Agent')}
          onClick={onAgentVerifyClick}
        />
      }
    </IconDivider>
  </Divider>
));

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onAgentCloneClick: PropTypes.func.isRequired,
  onAgentCreateClick: PropTypes.func.isRequired,
  onAgentDeleteClick: PropTypes.func.isRequired,
  onAgentDownloadClick: PropTypes.func.isRequired,
  onAgentEditClick: PropTypes.func.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <AgentComponent
    onCloned={goto_details('agent', props)}
    onCloneError={onError}
    onCreated={goto_details('agent', props)}
    onDeleted={goto_list('agents', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
    onVerified={onChanged}
    onVerifyError={onError}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      save,
      verify,
    }) => (
      <EntityPage
        {...props}
        detailsComponent={AgentDetails}
        sectionIcon="agent.svg"
        toolBarIcons={ToolBarIcons}
        title={_('Agent')}
        onAgentCloneClick={clone}
        onAgentCreateClick={create}
        onAgentDeleteClick={delete_func}
        onAgentDownloadClick={download}
        onAgentEditClick={edit}
        onAgentSaveClick={save}
        onAgentVerifyClick={verify}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      />
    )}
  </AgentComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const AgentPage = props => (
  <EntityContainer
    {...props}
    name="agent"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default AgentPage;

// vim: set ts=2 sw=2 tw=80:
