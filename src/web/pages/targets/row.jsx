/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React from 'react';
import ExportIcon from 'web/components/icon/exporticon';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import PropTypes from 'web/utils/proptypes';

const Actions = withEntitiesActions(
  ({
    entity,
    onTargetEditClick,
    onTargetCloneClick,
    onTargetDownloadClick,
    onTargetDeleteClick,
  }) => (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Target')}
        entity={entity}
        name="target"
        onClick={onTargetDeleteClick}
      />
      <EditIcon
        displayName={_('Target')}
        entity={entity}
        name="target"
        onClick={onTargetEditClick}
      />
      <CloneIcon
        displayName={_('Target')}
        entity={entity}
        name="target"
        title={_('Clone Target')}
        value={entity}
        onClick={onTargetCloneClick}
      />
      <ExportIcon
        title={_('Export Target')}
        value={entity}
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
        <DetailsLink id={cred.id} textOnly={!links} type="credential">
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
      displayName={_('Target')}
      entity={entity}
      link={links}
      type="target"
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>{shorten(entity.hosts.join(', '), 500)}</TableData>
    <TableData>{entity.max_hosts}</TableData>
    <TableData>
      {isDefined(entity.port_list) && (
        <span>
          <DetailsLink
            id={entity.port_list.id}
            textOnly={!links}
            type="portlist"
          >
            {entity.port_list.name}
          </DetailsLink>
        </span>
      )}
    </TableData>
    <TableData align="center" flex="column">
      <Cred cred={entity.ssh_credential} links={links} title={'SSH'} />
      <Cred
        cred={entity.ssh_elevate_credential}
        links={links}
        title={_('SSH Elevate')}
      />
      <Cred cred={entity.smb_credential} links={links} title={'SMB'} />
      <Cred cred={entity.esxi_credential} links={links} title={'ESXi'} />
      <Cred cred={entity.snmp_credential} links={links} title={'SNMP'} />
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
