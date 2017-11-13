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

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import ExportIcon from '../../components/icon/exporticon.js';
import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import DeleteIcon from '../../entity/icon/deleteicon.js';

import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';

import ScheduleComponent from './component.js';
import ScheduleDetails from './details.js';

const ToolBarIcons = ({
  entity,
  onScheduleCloneClick,
  onScheduleCreateClick,
  onScheduleDeleteClick,
  onScheduleDownloadClick,
  onScheduleEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <HelpIcon
        page="schedule_details"
        title={_('Help: Schedule Details')}
      />
      <ListIcon
        title={_('Schedules List')}
        page="schedules"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onScheduleCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onScheduleCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onScheduleEditClick}
      />
      <DeleteIcon
        entity={entity}
        onClick={onScheduleDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Schedule as XML')}
        onClick={onScheduleDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onScheduleCloneClick: PropTypes.func.isRequired,
  onScheduleCreateClick: PropTypes.func.isRequired,
  onScheduleDeleteClick: PropTypes.func.isRequired,
  onScheduleDownloadClick: PropTypes.func.isRequired,
  onScheduleEditClick: PropTypes.func.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <ScheduleComponent
    onCloned={goto_details('schedule', props)}
    onCloneError={onError}
    onCreated={goto_details('schedule', props)}
    onDeleted={goto_list('schedules', props)}
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
      <EntityPage
        {...props}
        sectionIcon="schedule.svg"
        title={_('Schedule')}
        detailsComponent={ScheduleDetails}
        toolBarIcons={ToolBarIcons}
        onScheduleCloneClick={clone}
        onScheduleCreateClick={create}
        onScheduleDeleteClick={delete_func}
        onScheduleDownloadClick={download}
        onScheduleEditClick={edit}
        onScheduleSaveClick={save}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      />
    )}
  </ScheduleComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const SchedulePage = props => (
  <EntityContainer
    {...props}
    name="schedule"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default SchedulePage;

// vim: set ts=2 sw=2 tw=80:
