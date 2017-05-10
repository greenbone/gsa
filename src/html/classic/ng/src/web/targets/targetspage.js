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

import _ from '../../locale.js';
import {is_defined, is_empty} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import TargetsFilterDialog from './filterdialog.js';
import TargetsTable from './table.js';
import TargetDialogContainer from './dialogcontainer.js';

import {TARGETS_FILTER_FILTER} from '../../gmp/models/filter.js';

const ToolBarIcons = ({onNewTargetClick}) => {
  return (
    <Layout flex box>
      <HelpIcon page="targets"/>
      <NewIcon
        title={_('New Target')}
        onClick={onNewTargetClick}/>
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewTargetClick: PropTypes.func,
};

const id_or__ = value => {
  return is_defined(value) && !is_empty(value.id) ? value.id : 0;
};

class TargetsPage extends React.Component {

  constructor(...args) {
    super(...args);

    this.openTargetDialog = this.openTargetDialog.bind(this);
  }

  openTargetDialog(entity) {
    if (entity && entity.id) {
      this.target_dialog.show({
        id: entity.id,
        alive_tests: entity.alive_tests,
        comment: entity.comment,
        esxi_credential_id: id_or__(entity.esxi_credential),
        exclude_hosts: entity.exclude_hosts,
        hosts: entity.hosts,
        in_use: entity.isInUse(),
        name: entity.name,
        port_list_id: id_or__(entity.port_list),
        port: is_empty(entity.ssh_credential.id) ?
          '22' : entity.ssh_credential.port,
        reverse_lookup_only: entity.reverse_lookup_only,
        reverse_lookup_unify: entity.reverse_lookup_unify,
        smb_credential_id: id_or__(entity.smb_credential),
        snmp_credential_id: id_or__(entity.snmp_credential),
        ssh_credential_id: id_or__(entity.ssh_credential),
        target_source: 'manual',
        target_exclude_source: 'manual',
      }, {
        title: _('Edit Target {{name}}', entity),
      });
    }
    else {
      this.target_dialog.show({});
    }
  }

  render() {
    const {onChanged} = this.props;
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEditTarget={this.openTargetDialog}
          onNewTargetClick={this.openTargetDialog}/>
        <TargetDialogContainer
          ref={ref => this.target_dialog = ref}
          onSave={onChanged}/>
      </Layout>
    );
  };
}

TargetsPage.propTypes = {
  onChanged: PropTypes.func,
};

export default withEntitiesContainer(TargetsPage, 'target', {
  filterEditDialog: TargetsFilterDialog,
  filtersFilter: TARGETS_FILTER_FILTER,
  sectionIcon: 'target.svg',
  table: TargetsTable,
  title: _('Targets'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
