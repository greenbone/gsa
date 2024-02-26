/* Copyright (C) 2024 Greenbone AG
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

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import ReportConfigDialog from './dialog';

class ReportConfigComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleCloseReportConfigDialog =
      this.handleCloseReportConfigDialog.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.openReportConfigDialog = this.openReportConfigDialog.bind(this);
  }

  openReportConfigDialog(reportconfig) {
    this.handleInteraction();
    const {gmp} = this.props;

    if (isDefined(reportconfig)) {
      // (re-)load report config to get params
      gmp.reportconfig.get(reportconfig).then(response => {
        const config = response.data;
        const preferences = {};
        const id_lists = {};

        config.params.forEach(param => {
          preferences[param.name] = param.value;
        });

        const p2 = gmp.reportformats.getAll().then(resp => resp.data);

        p2.then(formats => {
          this.setState({
            id: config.id,
            name: config.name,
            comment: config.comment,
            dialogVisible: true,
            formats,
            id_lists,
            preferences,
            reportconfig: config,
            originalParamInfo: reportconfig.params,
            title: _('Edit Report Config {{name}}', {name: config.name}),
          });
        });
      });
    } else {
      gmp.reportformats
        .getAll()
        .then(resp => resp.data)
        .then(formats => {
          this.setState({
            dialogVisible: true,
            reportconfig: undefined,
            formats,
            title: _('New Report Config'),
          });
        });
    }
  }

  closeReportConfigDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseReportConfigDialog() {
    this.closeReportConfigDialog();
    this.handleInteraction();
  }

  handleSave(data) {
    const {gmp} = this.props;

    this.handleInteraction();

    if (isDefined(data.id)) {
      const {onSaved, onSaveError} = this.props;
      return gmp.reportconfig
        .save(data)
        .then(onSaved, onSaveError)
        .then(() => this.closeReportConfigDialog());
    }

    const {onCreated, onCreateError} = this.props;
    return gmp.reportconfig
      .create(data)
      .then(onCreated, onCreateError)
      .then(() => this.closeReportConfigDialog());
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
      onCloneError,
      onCloned,
      onCreateError,
      onCreated,
      onDeleteError,
      onDeleted,
      onDownloadError,
      onDownloaded,
      onInteraction,
    } = this.props;

    const {dialogVisible, formats, reportconfig, title, preferences} =
      this.state;

    return (
      <EntityComponent
        name="reportconfig"
        onCloneError={onCloneError}
        onCloned={onCloned}
        onCreateError={onCreateError}
        onCreated={onCreated}
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
        onInteraction={onInteraction}
      >
        {other => (
          <React.Fragment>
            {children({
              ...other,
              create: this.openReportConfigDialog,
              edit: this.openReportConfigDialog,
            })}
            {dialogVisible && (
              <ReportConfigDialog
                reportconfig={reportconfig}
                formats={formats}
                title={title}
                preferences={preferences}
                onClose={this.handleCloseReportConfigDialog}
                onSave={this.handleSave}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

ReportConfigComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(ReportConfigComponent);

// vim: set ts=2 sw=2 tw=80:
