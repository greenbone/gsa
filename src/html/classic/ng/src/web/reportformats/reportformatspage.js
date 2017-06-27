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
import {is_defined} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import Text from '../components/form/text.js';

import HelpIcon from '../components/icon/helpicon.js';
import NewIcon from '../components/icon/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import PromiseFactory from '../../gmp/promise.js';

import ReportFormatDialog from './dialog.js';
import Row from './row.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['extension', _('Extension')],
  ['content_type', _('Content Type')],
  ['trust', _('Trust (Last Verified)')],
  ['active', _('Active')],
];

const ToolBarIcons = ({
    onNewReportFormatClick
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="report_formats"
        title={_('Help: Report Formats')}/>
      {capabilities.mayCreate('report_format') &&
        <NewIcon
          title={_('New Report Format')}
          onClick={onNewReportFormatClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewReportFormatClick: PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSaveReportFormat = this.handleSaveReportFormat.bind(this);
    this.handleVerify = this.handleVerify.bind(this);
    this.openReportFormatDialog = this.openReportFormatDialog.bind(this);
  }

  handleVerify(format) {
    const {entityCommand, showSuccess, showError} = this.props;

    entityCommand.verify(format).then(() => {
      showSuccess(_('Report Format {{name}} verified successfully.',
        {name: format.name}));
    }, error => {
      showError(
        <Layout flex="column">
          <Text>
            {_('Report Format {{name}} could not be verified.',
                {name: format.name})}
          </Text>
          <Text>
            {error.message}
          </Text>
        </Layout>
        );
    });
  }

  handleSaveReportFormat(data) {
    const {onChanged, entityCommand} = this.props;
    let promise;

    if (is_defined(data.reportformat)) {
      promise = entityCommand.save(data);
    }
    else {
      promise = entityCommand.import(data);
    }

    return promise.then(() => onChanged());
  }

  openReportFormatDialog(reportformat) {
    if (is_defined(reportformat)) {
      const {entityCommand, entitiesCommand, showError} = this.props;

      // (re-)load report format to get params
      entityCommand.get(reportformat).then(response => {
        let format = response.data;
        let preferences = {};
        let load_formats = false;
        let id_lists = {};

        format.params.forEach(param => {
          if (param.type === 'report_format_list') {
            load_formats = true;
            id_lists[param.name] = param.value;
          }
          else {
            preferences[param.name] = param.value;
          }
        });

        // only load formats if they are required for the report format list
        // type param
        let p2 = load_formats ? entitiesCommand.getAll() :
          PromiseFactory.resolve(undefined);

        p2.then(formats => {
          this.reportformat_dialog.show({
            active: format.active,
            formats,
            id: format.id,
            id_lists,
            name: format.name,
            preferences,
            reportformat: format,
            summary: format.summary,
          }, {
            title: _('Edit Report Format {{name}}', {name: format.name}),
          });
        }, error => showError(error.message));
      });
    }
    else {
      this.reportformat_dialog.show({
      });
    }
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEntityEdit={this.openReportFormatDialog}
          onNewReportFormatClick={this.openReportFormatDialog}
          onVerifyReportFormat={this.handleVerify}
        />
        <ReportFormatDialog
          ref={ref => this.reportformat_dialog = ref}
          onSave={this.handleSaveReportFormat}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  entitiesCommand: PropTypes.entitiescommand,
  onChanged: PropTypes.func,
  showError: PropTypes.func.isRequired,
  showSuccess: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No report formats available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  footer: createEntitiesFooter({
    download: 'reportformats.xml',
    span: 6,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'reportformat', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'report_format.svg',
  table: Table,
  title: _('Report Formats'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
