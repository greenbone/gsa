/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import ReportFormatDialog from './dialog';

class ReportFormatComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleCloseReportFormatDialog = this.handleCloseReportFormatDialog.bind(
      this,
    );
    this.handleVerify = this.handleVerify.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.openReportFormatDialog = this.openReportFormatDialog.bind(this);
  }

  handleVerify(format) {
    const {gmp, onVerified, onVerifyError} = this.props;

    this.handleInteraction();

    gmp.reportformat.verify(format).then(onVerified, onVerifyError);
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
    const {
      children,
      onCloned,
      onCloneError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onInteraction,
    } = this.props;

    const {dialogVisible, reportformat, title} = this.state;

    return (
      <EntityComponent
        name="reportformat"
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
      >
        {other => (
          <React.Fragment>
            {children({
              ...other,
              import: this.openReportFormatDialog,
              edit: this.openReportFormatDialog,
              verify: this.handleVerify,
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
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onImportError: PropTypes.func,
  onImported: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onVerified: PropTypes.func,
  onVerifyError: PropTypes.func,
};

export default withGmp(ReportFormatComponent);

// vim: set ts=2 sw=2 tw=80:
