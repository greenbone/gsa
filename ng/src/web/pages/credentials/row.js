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
import {render_component} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import FootNote from '../../components/footnote/footnote.js';

import ExportIcon from '../../components/icon/exporticon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import CredentialDownloadIcon from './downloadicon.js';

const Actions = ({
  entity,
  onCredentialDeleteClick,
  onCredentialDownloadClick,
  onCredentialCloneClick,
  onCredentialEditClick,
}) => {
  return (
    <IconDivider align={['start', 'center']}>
      <TrashIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        onClick={onCredentialDeleteClick}/>
      <EditIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        onClick={onCredentialEditClick}/>
      <CloneIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        title={_('Clone Credential')}
        value={entity}
        onClick={onCredentialCloneClick}/>
      <ExportIcon
        value={entity}
        title={_('Export Credential')}
        onClick={onCredentialDownloadClick}
      />
      <CredentialDownloadIcon
        type={entity.credential_type}
        id={entity.id}
      />
    </IconDivider>
  );
};

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onCredentialCloneClick: PropTypes.func.isRequired,
  onCredentialDeleteClick: PropTypes.func.isRequired,
  onCredentialDownloadClick: PropTypes.func.isRequired,
  onCredentialEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      link={links}
      type="credential"
      displayName={_('Credential')}
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData flex>
      <Divider>
        <span>
          {entity.credential_type}
        </span>
        <FootNote>
          ({entity.full_type})
        </FootNote>
      </Divider>
    </TableData>
    <TableData>
      {entity.isAllowInsecure() ? _('Yes') : _('No')}
    </TableData>
    <TableData>
      {entity.login}
    </TableData>
    {render_component(actions, {...props, entity})}
  </TableRow>
);

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
