/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {is_defined} from 'gmp/utils';
import Promise from 'gmp/promise.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import EntityComponent from '../../entity/component.js';

import Wrapper from '../../components/layout/wrapper.js';

import ReportFormatDialog from './dialog.js';

class ReportFormatComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.closeReportFormatDialog = this.closeReportFormatDialog.bind(this);
    this.handleVerify = this.handleVerify.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.openReportFormatDialog = this.openReportFormatDialog.bind(this);
  }

  handleVerify(format) {
    const {gmp, onVerified, onVerifyError} = this.props;

    gmp.reportformat.verify(format).then(onVerified, onVerifyError);
  }

  openReportFormatDialog(reportformat) {
    if (is_defined(reportformat)) {
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
          }
          else {
            preferences[param.name] = param.value;
          }
        });

        // only load formats if they are required for the report format list
        // type param
        const p2 = load_formats ?
          gmp.reportformats.getAll().then(resp => resp.data) :
          Promise.resolve(undefined);

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
    }
    else {
      this.setState({
        dialogVisible: true,
        reportformat: undefined,
        title: _('New Report Format'),
      });
    }
  }

  closeReportFormatDialog() {
    this.setState({dialogVisible: false});
  }

  handleSave(data) {
    const {gmp} = this.props;
    if (is_defined(data.id)) {
      const {onSaved, onSaveError} = this.props;
      return gmp.reportformat.save(data).then(onSaved, onSaveError);
    }

    const {onImported, onImportError} = this.props;
    return gmp.reportformat.import(data).then(onImported, onImportError);
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
    } = this.props;

    const {
      dialogVisible,
      reportformat,
      title,
    } = this.state;

    return (
      <EntityComponent
        name="reportformat"
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
      >
        {other => (
          <Wrapper>
            {children({
              ...other,
              create: this.openReportFormatDialog,
              edit: this.openReportFormatDialog,
              verify: this.handleVerify,
            })}
            <ReportFormatDialog
              reportformat={reportformat}
              title={title}
              visible={dialogVisible}
              onClose={this.closeReportFormatDialog}
              onSave={this.handleSave}
            />
          </Wrapper>
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onVerified: PropTypes.func,
  onVerifyError: PropTypes.func,
};

export default withGmp(ReportFormatComponent);

// vim: set ts=2 sw=2 tw=80:
