/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import {renderComponent} from 'web/utils/render';

import EntityNameTableData from 'web/entities/entitynametabledata';
import {withEntityActions} from 'web/entities/actions';
import {withEntityRow} from 'web/entities/row';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import FootNote from 'web/components/footnote/footnote';

import ExportIcon from 'web/components/icon/exporticon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import CredentialDownloadIcon from './downloadicon';

const Actions = ({
  entity,
  onCredentialDeleteClick,
  onCredentialDownloadClick,
  onCredentialCloneClick,
  onCredentialEditClick,
  onCredentialInstallerDownloadClick,
}) => {
  return (
    <IconDivider
      align={['center', 'center']}
      grow
    >
      <TrashIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        onClick={onCredentialDeleteClick}
      />
      <EditIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        onClick={onCredentialEditClick}
      />
      <CloneIcon
        displayName={_('Credential')}
        name="credential"
        entity={entity}
        title={_('Clone Credential')}
        value={entity}
        onClick={onCredentialCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Credential')}
        onClick={onCredentialDownloadClick}
      />
      <CredentialDownloadIcon
        credential={entity}
        onDownload={onCredentialInstallerDownloadClick}
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
  onCredentialInstallerDownloadClick: PropTypes.func.isRequired,
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
    <TableData>
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
    {renderComponent(actions, {...props, entity})}
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
