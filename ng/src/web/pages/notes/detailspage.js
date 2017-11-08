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

import _, {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import {render_yesno} from '../../utils/render.js';
import PropTypes from '../../utils/proptypes.js';

import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import EntityPage from '../../entity/page.js';
import EntityContainer from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import NoteDetails from './details.js';
import NoteComponent from './component.js';

const ToolBarIcons = ({
  entity,
  onNoteCloneClick,
  onNoteCreateClick,
  onNoteDeleteClick,
  onNoteDownloadClick,
  onNoteEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <HelpIcon
        page="note_details"
        title={_('Help: Note Details')}
      />
      <ListIcon
        title={_('Note List')}
        page="notes"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onNoteCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onNoteCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onNoteEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onNoteDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Note as XML')}
        onClick={onNoteDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onNoteCloneClick: PropTypes.func.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onNoteDeleteClick: PropTypes.func.isRequired,
  onNoteDownloadClick: PropTypes.func.isRequired,
  onNoteEditClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  ...props
}) => {
  const {nvt} = entity;
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('NVT Name')}
            </TableData>
            <TableData>
              {is_defined(nvt) ?
                <DetailsLink
                  id={nvt.id}
                  type={nvt.nvt_type}
                >
                  {nvt.name}
                </DetailsLink> :
                _('None. Result was an open port.')
              }
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('NVT OID')}
            </TableData>
            <TableData>
              {nvt.id}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Active')}
            </TableData>
            <TableData>
              {render_yesno(entity.isActive())}
              {entity.isActive() && is_defined(entity.end_time) &&
                ' ' + _('until {{- enddate}}',
                  {enddate: datetime(entity.end_time)})
              }
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <NoteDetails
        entity={entity}
        {...props}
      />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <NoteComponent
    onCloned={goto_details('note', props)}
    onCloneError={onError}
    onCreated={goto_details('note', props)}
    onDeleted={goto_list('notes', props)}
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
        sectionIcon="note.svg"
        title={_('Note')}
        detailsComponent={Details}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onDownloaded={onDownloaded}
        onError={onError}
        onNoteCloneClick={clone}
        onNoteCreateClick={create}
        onNoteDeleteClick={delete_func}
        onNoteDownloadClick={download}
        onNoteEditClick={edit}
        onNoteSaveClick={save}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      />
    )}
  </NoteComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const NotePage = props => (
  <EntityContainer
    {...props}
    name="note"
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default NotePage;

// vim: set ts=2 sw=2 tw=80:
