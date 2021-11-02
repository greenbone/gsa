/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {getEntityType} from 'gmp/utils/entitytype';

import RestoreIcon from 'web/components/icon/restoreicon';
import TrashDeleteIcon from 'web/components/icon/trashdeleteicon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';

import PropTypes from 'web/utils/proptypes';

const getRestorableDeletableForEntityType = {
  alert: entity => {
    const restorable = isDefined(entity.filter)
      ? !entity.filter.isInTrash()
      : true;
    return {restorable, deletable: !entity.isInUse()};
  },
  scanconfig: entity => {
    const restorable = isDefined(entity.scanner)
      ? !entity.scanner.isInTrash()
      : true;
    return {restorable, deletable: !entity.isInUse()};
  },
  credential: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  filter: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  group: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  note: entity => {
    return {restorable: true, deletable: true};
  },
  override: entity => {
    return {restorable: true, deletable: true};
  },
  permission: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  portlist: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  reportformat: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  role: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  scanner: entity => {
    const restorable = isDefined(entity.credential)
      ? !entity.credential.isInTrash()
      : true;
    return {restorable, deletable: !entity.isInUse()};
  },
  schedule: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  tag: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  target: entity => {
    const ssh_cred = isDefined(entity.ssh_credential)
      ? !entity.ssh_credential.isInTrash()
      : true;
    const smb_cred = isDefined(entity.smb_credential)
      ? !entity.smb_credential.isInTrash()
      : true;
    const esxi_cred = isDefined(entity.esxi_credential)
      ? !entity.esxi_credential.isInTrash()
      : true;
    const snmp_cred = isDefined(entity.snmp_credential)
      ? !entity.snmp_credential.isInTrash()
      : true;
    const portlist = isDefined(entity.port_list)
      ? !entity.port_list.isInTrash()
      : true;

    const restorable =
      ssh_cred && smb_cred && esxi_cred && snmp_cred && portlist;
    return {restorable, deletable: !entity.isInUse()};
  },
  task: entity => {
    const schedule = isDefined(entity.schedule)
      ? !entity.schedule.isInTrash()
      : true;
    const target = isDefined(entity.target) ? !entity.target.isInTrash() : true;
    const config = isDefined(entity.config) ? !entity.config.isInTrash() : true;
    const scanner = isDefined(entity.scanner)
      ? !entity.scanner.isInTrash()
      : true;
    const alerts = isDefined(entity.alerts)
      ? !entity.alerts.some(alert => alert.isInTrash())
      : true;

    const restorable = schedule && target && config && scanner && alerts;
    return {restorable, deletable: true};
  },
  ticket: entity => {
    return {restorable: true, deletable: true};
  },
};

const isAbleToRestoreAndDelete = entity => {
  const entityType = getEntityType(entity);
  const canRestoreAndDelete = getRestorableDeletableForEntityType[entityType];

  return isDefined(canRestoreAndDelete)
    ? canRestoreAndDelete(entity)
    : {restorable: false, deletable: false};
};

const getRestoreDeleteProps = (entity, onEntityRestore, onEntityDelete) => {
  let restoreprops;
  let deleteprops;
  const {restorable, deletable} = isAbleToRestoreAndDelete(entity);

  if (restorable) {
    restoreprops = {
      title: _('Restore'),
      onClick: onEntityRestore,
    };
  } else {
    restoreprops = {
      active: false,
    };
  }

  if (deletable) {
    deleteprops = {
      title: _('Delete'),
      onClick: onEntityDelete,
    };
  } else {
    deleteprops = {
      active: false,
      title: _('Still in use'),
    };
  }
  return {restoreprops, deleteprops};
};

const TrashActions = ({entity, onEntityDelete, onEntityRestore}) => {
  const {restoreprops, deleteprops} = getRestoreDeleteProps(
    entity,
    onEntityRestore,
    onEntityDelete,
  );
  return (
    <TableData>
      <IconDivider align={['center', 'center']} grow>
        <RestoreIcon name="restore" value={entity} {...restoreprops} />
        <TrashDeleteIcon name="delete" value={entity} {...deleteprops} />
      </IconDivider>
    </TableData>
  );
};

TrashActions.propTypes = {
  entity: PropTypes.model.isRequired,
  onEntityDelete: PropTypes.func.isRequired,
  onEntityRestore: PropTypes.func.isRequired,
};

export default TrashActions;
