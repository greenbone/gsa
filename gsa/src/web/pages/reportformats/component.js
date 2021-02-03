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

import EntityComponent from 'web/entity/component';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import ReportFormatDialog from './dialog';

class ReportFormatComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleCloseReportFormatDialog = this.handleCloseReportFormatDialog.bind(
      this,
    );
    this.handleSave = this.handleSave.bind(this);
    this.openReportFormatDialog = this.openReportFormatDialog.bind(this);
  }

  openReportFormatDialog(reportformat) {
    this.handleInteraction();

    if (isDefined(reportformat)) {
      const {gmp} = this.props;

      // (re-)load report format to get params
      gmp.reportformat.get(reportformat).then(response => {
        const format = response.data;
        const preferences = {};
        let load_formats = false;
        const id_lists = {};

        format.params.forEach(param => {
          if (param.type === 'report_format_list') {
            load_formats = true;
            id_lists[param.name] = param.value;
          } else {
            preferences[param.name] = param.value;
          }
        });

        // only load formats if they are required for the report format list
        // type param
        const p2 = load_formats
          ? gmp.reportformats.getAll().then(resp => resp.data)
          : Promise.resolve(undefined);

        p2.then(formats => {
          this.setState({
            dialogVisible: true,
            formats,
            id_lists,
            preferences,
            reportformat: format,
            title: _('Edit Report Format {{name}}', {name: format.name}),
          });
        });
      });
    } else {
      this.setState({
        dialogVisible: true,
        reportformat: undefined,
        title: _('Import Report Format'),
      });
    }
  }

  closeReportFormatDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseReportFormatDialog() {
    this.closeReportFormatDialog();
    this.handleInteraction();
  }

  handleSave(data) {
    const {gmp} = this.props;

    this.handleInteraction();

    if (isDefined(data.id)) {
      const {onSaved, onSaveError} = this.props;
      return gmp.reportformat
        .save(data)
        .then(onSaved, onSaveError)
        .then(() => this.closeReportFormatDialog());
    }

    const {onImported, onImportError} = this.props;
    return gmp.reportformat
      .import(data)
      .then(onImported, onImportError)
      .then(() => this.closeReportFormatDialog());
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {children, onDeleted, onDeleteError, onInteraction} = this.props;

    const {dialogVisible, reportformat, title} = this.state;

    return (
      <EntityComponent
        name="reportformat"
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onInteraction={onInteraction}
      >
        {other => (
          <React.Fragment>
            {children({
              ...other,
              import: this.openReportFormatDialog,
              edit: this.openReportFormatDialog,
            })}
            {dialogVisible && (
              <ReportFormatDialog
                reportformat={reportformat}
                title={title}
                onClose={this.handleCloseReportFormatDialog}
                onSave={this.handleSave}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

ReportFormatComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onImportError: PropTypes.func,
  onImported: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(ReportFormatComponent);

// vim: set ts=2 sw=2 tw=80:
