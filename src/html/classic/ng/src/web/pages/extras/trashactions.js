/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {is_defined} from 'gmp/utils.js';

import RestoreIcon from '../../components/icon/restoreicon.js';
import TrashDeleteIcon from '../../components/icon/trashdeleteicon.js';
import IconDivider from '../../components/layout/icondivider.js';

import TableData from '../../components/table/data.js';

import PropTypes from '../../utils/proptypes.js';


const check_by_type = {
  agent: entity => {
    return {restorable: true, deletable: true};
  },
  alert: entity => {
    const restorable =
     is_defined(entity.filter) ? !entity.filter.isInTrash() : true;
    return {restorable, deletable: !entity.isInUse()};
  },
  config: entity => {
    const restorable =
      is_defined(entity.scanner) ? !entity.scanner.isInTrash() : true;
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
  override: enitity => {
    return {restorable: true, deletable: true};
  },
  permission: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  port_list: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  report_format: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  role: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  scanner: entity => {
    const restorable = is_defined(entity.credential) ?
      !entity.credential.isInTrash() : true;
    return {restorable, deletable: !entity.isInUse()};
  },
  schedule: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  tag: entity => {
    return {restorable: true, deletable: !entity.isInUse()};
  },
  target: entity => {
    const ssh_cred = is_defined(entity.ssh_credential) ?
     !entity.ssh_credential.isInTrash() : true;
    const smb_cred = is_defined(entity.smb_credential) ?
     !entity.smb_credential.isInTrash() : true;
    const esxi_cred = is_defined(entity.esxi_credential) ?
     !entity.esxi_credential.isInTrash() : true;
    const snmp_cred = is_defined(entity.snmp_credential) ?
     !entity.snmp_credential.isInTrash() : true;
    const portlist = is_defined(entity.port_list) ?
     !entity.port_list.isInTrash() : true;

    const restorable =
      ssh_cred && smb_cred && esxi_cred && snmp_cred && portlist;
    return {restorable, deletable: !entity.isInUse()};
  },
  task: entity => {
    const schedule = is_defined(entity.schedule) ?
      !entity.schedule.isInTrash() : true;
    const target = is_defined(entity.target) ?
      !entity.target.isInTrash() : true;
    const config = is_defined(entity.config) ?
      !entity.config.isInTrash() : true;
    const scanner = is_defined(entity.scanner) ?
      !entity.scanner.isInTrash() : true;
    const alerts = is_defined(entity.alerts) ?
      !entity.alerts.some(alert => alert.isInTrash()) : true;

    const restorable = schedule && target && config && scanner && alerts;
    return {restorable, deletable: true};
  },
};


function get_restore_delete_props(
    entity,
    onEntityRestore,
    onEntityDelete,
  ) {
  let restoreprops;
  let deleteprops;
  const can_restore_and_delete = check_by_type[entity.entity_type];
  const {restorable, deletable} = can_restore_and_delete(entity);

  if (restorable) {
    restoreprops = {
      title: _('Restore'),
      onClick: onEntityRestore,
    };
  }
  else {
    restoreprops = {
      active: false,
    };
  }

  if (deletable) {
    deleteprops = {
      title: _('Delete'),
      onClick: onEntityDelete,
    };
  }
  else {
    deleteprops = {
      active: false,
      title: _('Still in use'),
    };
  }
  return {restoreprops, deleteprops};
}

const TrashActions = ({
    entity,
    onEntityDelete,
    onEntityRestore,
  }) => {
  const {restoreprops, deleteprops} =
    get_restore_delete_props(entity, onEntityRestore, onEntityDelete);
  return (
    <TableData>
      <IconDivider
        align={['center', 'center']}
        grow
      >
        <RestoreIcon
          name="restore"
          value={entity}
          {...restoreprops}
        />
        <TrashDeleteIcon
          name="delete"
          value={entity}
          {...deleteprops}
        />
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
