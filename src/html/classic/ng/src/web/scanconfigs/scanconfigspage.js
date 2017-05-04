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
import {
  for_each,
  is_defined,
  select_save_id,
  shorten,
} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesTable} from '../entities/table.js';

import HelpIcon from '../icons/helpicon.js';
import Icon from '../icons/icon.js';
import NewIcon from '../icons/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import EditScanConfigDialog from './editdialog.js';
import Header from './header.js';
import ImportDialog from './importdialog.js';
import Row from './row.js';
import ScanConfigDialog from './dialog.js';

import {OSP_SCANNER_TYPE} from '../../gmp/models/scanner.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['families_total', _('Families: Total')],
  ['families_trend', _('Families: Trend')],
  ['nvts_total', _('NVTS: Total')],
  ['nvts_trend', _('NVTs: Trend')],
];

const ToolBarIcons = ({
    onNewConfigClick,
    onImportConfigClick,
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="configs"
        title={_('Help: Scan Configs')}/>
      {capabilities.mayCreate('config') &&
        <NewIcon
          title={_('New Scan Config')}
          onClick={onNewConfigClick}/>
      }
      {capabilities.mayCreate('config') &&
        <Icon
          img="upload.svg"
          title={_('Import Scan Config')}
          onClick={onImportConfigClick}
        />
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewConfigClick: PropTypes.func,
  onImportConfigClick: PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleImportConfig = this.handleImportConfig.bind(this);
    this.handleSaveConfig = this.handleSaveConfig.bind(this);
    this.openCreateConfigDialog = this.openCreateConfigDialog.bind(this);
    this.openEditConfigDialog = this.openEditConfigDialog.bind(this);
    this.openImportDialog = this.openImportDialog.bind(this);
  }

  openEditConfigDialog(config) {
    const {entityCommand} = this.props;

    entityCommand.editScanConfigSettings(config).then(response => {
      let {data} = response;
      let {families, scanconfig} = data;
      let trend = {};
      let select = {};

      for_each(families, family => {
        let {name} = family;
        let config_family = scanconfig.families[name];

        if (is_defined(config_family)) {
          trend[name] = config_family.trend;
          select[name] = config_family.nvts.count === family.max ? '1' : '0';
        }
        else {
          trend[name] = '0';
          select[name] = '0';
        }
      });

      let scanner_preference_values = {};

      for_each(scanconfig.preferences.scanner, preference => {
        scanner_preference_values[preference.name] =  preference.value;
      });

      const state = {
        comment: config.comment,
        id: config.id,
        name: config.name,
        config: scanconfig,
        families,
        trend,
        select,
        scanner_preference_values,
      };

      this.edit_dialog.show(state, {
        title: _('Edit Scan Config {{name}}', {name: shorten(config.name)}),
      });

      this.loadScanners(this.edit_dialog);
    });
  }

  openCreateConfigDialog() {
    this.scanconfig_dialog.show({});
    this.loadScanners(this.scanconfig_dialog);
  }

  openImportDialog() {
    this.import_dialog.show({});
  }

  handleImportConfig(data) {
    const {entityCommand, onChanged} = this.props;
    return entityCommand.import(data).then(() => onChanged());
  }

  handleSaveConfig(data) {
    const {entityCommand, onChanged} = this.props;
    return entityCommand.save(data).then(() => onChanged());
  }

  loadScanners(dialog) {
    const {gmp} = this.context;

    gmp.scanners.getAll({cache: false}).then(scanners => {
      scanners = scanners.filter(scanner => scanner.type === OSP_SCANNER_TYPE);
      dialog.setValues({
        scanners,
        scanner_id: select_save_id(scanners),
      });
    });
  }

  render() {
    const {onEntitySave} = this.props;
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEntityEdit={this.openEditConfigDialog}
          onNewConfigClick={this.openCreateConfigDialog}
          onImportConfigClick={this.openImportDialog}
        />
        <ScanConfigDialog
          ref={ref => this.scanconfig_dialog = ref}
          onSave={onEntitySave}
        />
        <ImportDialog
          ref={ref => this.import_dialog = ref}
          onSave={this.handleImportConfig}
        />
        <EditScanConfigDialog
          ref={ref => this.edit_dialog = ref}
          onSave={this.handleSaveConfig}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: PropTypes.func,
  onEntitySave: PropTypes.func,
  showError: PropTypes.func.isRequired,
  showSuccess: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No Scan Configs available'),
  header: Header,
  row: Row,
  footer: createEntitiesFooter({
    download: 'scanconfigs.xml',
    span: 7,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'scanconfig', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'config.svg',
  table: Table,
  title: _('Scan Configs'),
  toolBarIcons: ToolBarIcons,
  foldable: true,
});

// vim: set ts=2 sw=2 tw=80:
