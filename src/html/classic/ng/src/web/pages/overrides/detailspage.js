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

import InfoTable from '../../components/table/info.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import EntityPage from '../../entity/page.js';
import {withEntityContainer} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/withEntityComponent.js';

import CloneIcon from '../../entities/icons/entitycloneicon.js';
import CreateIcon from '../../entities/icons/entitycreateicon.js';
import EditIcon from '../../entities/icons/entityediticon.js';
import TrashIcon from '../../entities/icons/entitytrashicon.js';

import OverrideDetails from './details.js';
import withOverrideComponent from './withOverrideComponent.js';

const ToolBarIcons = ({
  entity,
  onOverrideCloneClick,
  onOverrideCreateClick,
  onOverrideDeleteClick,
  onOverrideDownloadClick,
  onOverrideEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <HelpIcon
        page="override_details"
        title={_('Help: Override Details')}
      />
      <ListIcon
        title={_('Override List')}
        page="overrides"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onOverrideCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onOverrideCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onOverrideEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onOverrideDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Override as XML')}
        onClick={onOverrideDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onOverrideCloneClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
  onOverrideDeleteClick: PropTypes.func.isRequired,
  onOverrideDownloadClick: PropTypes.func.isRequired,
  onOverrideEditClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  ...props,
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
                  type="nvt"
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

      <OverrideDetails
        entity={entity}
        {...props}
      />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const goto_override = goto_details('override');

const Page = withOverrideComponent({
  onCloned: goto_override,
  onCloneError: 'onError',
  onCreated: goto_override,
  onCreateError: undefined,
  onDeleted: goto_list('overrides'),
  onDeleteError: 'onError',
  onDownloadError: 'onError',
  onSaved: 'onChanged',
  onSaveError: undefined,
})(EntityPage);

export default withEntityContainer('override', {
  details: Details,
  // permissionsComponent: TargetPermissions,
  sectionIcon: 'override.svg',
  title: _('Override'),
  toolBarIcons: ToolBarIcons,
})(Page);

// vim: set ts=2 sw=2 tw=80:
