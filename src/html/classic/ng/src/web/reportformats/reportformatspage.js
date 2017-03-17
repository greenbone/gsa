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

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import Text from '../form/text.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import ReportFormatDialog from './dialog.js';
import Table from './table.js';

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
  onNewReportFormatClick: React.PropTypes.func,
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
      const {entityCommand, showError} = this.props;
      // (re-)load report format to get params
      entityCommand.get(reportformat).then(response => {
        reportformat = response.data;

        let preferences = {};

        reportformat.params.forEach(param => {
          preferences[param.name] = param.value;
        });

        this.reportformat_dialog.show({
          active: reportformat.active,
          id: reportformat.id,
          name: reportformat.name,
          preferences,
          reportformat,
          summary: reportformat.summary,
        }, {
          title: _('Edit Report Format {{name}}', {name: reportformat.name}),
        });
      }, error => showError(error.message));
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
  onChanged: React.PropTypes.func,
  showError: React.PropTypes.func.isRequired,
  showSuccess: React.PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

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
