/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import EntityComponent from 'web/entity/EntityComponent';
import ReportFormatDialog from 'web/pages/reportformats/Dialog';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

class ReportFormatComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleCloseReportFormatDialog =
      this.handleCloseReportFormatDialog.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.openReportFormatDialog = this.openReportFormatDialog.bind(this);
  }

  openReportFormatDialog(reportformat) {
    this.handleInteraction();

    if (isDefined(reportformat)) {
      const {gmp} = this.props;
      const {_} = this.props;

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
      const {_} = this.props;

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

    const {dialogVisible, reportformat, title, preferences} = this.state;

    return (
      <EntityComponent
        name="reportformat"
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
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
                preferences={preferences}
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
  _: PropTypes.func.isRequired,
};

export default withGmp(withTranslation(ReportFormatComponent));
