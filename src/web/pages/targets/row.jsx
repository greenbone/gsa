/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

const Actions = withEntitiesActions(
  ({
    entity,
    onTargetEditClick,
    onTargetCloneClick,
    onTargetDownloadClick,
    onTargetDeleteClick,
  }) => (
    <IconDivider align={['center', 'center']} grow>
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
  ),
);

Actions.propTypes = {
  entity: PropTypes.model,
  onTargetCloneClick: PropTypes.func.isRequired,
  onTargetDeleteClick: PropTypes.func.isRequired,
  onTargetDownloadClick: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

const Cred = ({cred, title, links = true}) => {
  if (!isDefined(cred) || !isDefined(cred.id)) {
    return null;
  }
  return (
    <Layout>
      <span>{title}: </span>
      <Layout>
        <DetailsLink type="credential" id={cred.id} textOnly={!links}>
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

export const Row = ({
  actionsComponent: ActionsComponent = Actions,
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
    <TableData>{shorten(entity.hosts.join(', '), 500)}</TableData>
    <TableData>{entity.max_hosts}</TableData>
    <TableData>
      {isDefined(entity.port_list) && (
        <span>
          <DetailsLink
            type="portlist"
            id={entity.port_list.id}
            textOnly={!links}
          >
            {entity.port_list.name}
          </DetailsLink>
        </span>
      )}
    </TableData>
    <TableData flex="column" align="center">
      <Cred cred={entity.ssh_credential} title={'SSH'} links={links} />
      <Cred
        cred={entity.ssh_elevate_credential}
        title={_('SSH Elevate')}
        links={links}
      />
      <Cred cred={entity.smb_credential} title={'SMB'} links={links} />
      <Cred cred={entity.esxi_credential} title={'ESXi'} links={links} />
      <Cred cred={entity.snmp_credential} title={'SNMP'} links={links} />
    </TableData>
    <ActionsComponent {...props} entity={entity} />
  </TableRow>
);

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
