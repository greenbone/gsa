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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';
import withEntitiesActions from 'web/entities/withEntitiesActions';

const Actions = withEntitiesActions(({
  entity,
  onTargetEditClick,
  onTargetCloneClick,
  onTargetDownloadClick,
  onTargetDeleteClick,
}) => (
  <IconDivider
    align={['center', 'center']}
    grow
  >
    <TrashIcon
      displayName={_('Target')}
      name="target"
      entity={entity}
      onClick={onTargetDeleteClick}
    />
    <EditIcon
      displayName={_('Target')}
      name="target"
      entity={entity}
      onClick={onTargetEditClick}
    />
    <CloneIcon
      displayName={_('Target')}
      name="target"
      entity={entity}
      title={_('Clone Target')}
      value={entity}
      onClick={onTargetCloneClick}
    />
    <ExportIcon
      value={entity}
      title={_('Export Target')}
      onClick={onTargetDownloadClick}
    />
  </IconDivider>
));

Actions.propTypes = {
  entity: PropTypes.model,
  onTargetCloneClick: PropTypes.func.isRequired,
  onTargetDeleteClick: PropTypes.func.isRequired,
  onTargetDownloadClick: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

const Cred = ({
  cred,
  title,
  links = true,
}) => {
  if (!isDefined(cred) || !isDefined(cred.id)) {
    return null;
  }
  return (
    <Layout>
      <span>{title}: </span>
      <Layout box>
        <DetailsLink
          type="credential"
          id={cred.id}
          textOnly={!links}
        >
          {cred.name}
        </DetailsLink>
      </Layout>
    </Layout>
  );
};

Cred.propTypes = {
  cred: PropTypes.model,
  links: PropTypes.bool,
  title: PropTypes.string,
};

const Row = ({
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      link={links}
      type="target"
      displayName={_('Target')}
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>
      {shorten(entity.hosts.join(', '), 500)}
    </TableData>
    <TableData>
      {entity.max_hosts}
    </TableData>
    <TableData>
      <DetailsLink
        type="portlist"
        id={entity.port_list.id}
        textOnly={!links}
      >
        {entity.port_list.name}
      </DetailsLink>
    </TableData>
    <TableData flex="column" align="center">
      <Cred
        cred={entity.ssh_credential}
        title={'SSH'}
        links={links}
      />
      <Cred
        cred={entity.smb_credential}
        title={'SMB'}
        links={links}
      />
      <Cred
        cred={entity.esxi_credential}
        title={'ESXi'}
        links={links}
      />
      <Cred
        cred={entity.snmp_credential}
        title={'SNMP'}
        links={links}
      />
    </TableData>
    <Actions
      {...props}
      entity={entity}
    />
  </TableRow>
);

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
