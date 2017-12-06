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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';
import Promise from 'gmp/promise.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import EntityComponent from '../../entity/component.js';

import Wrapper from '../../components/layout/wrapper.js';

import ReportFormatDialog from './dialog.js';

class ReportFormatComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleVerify = this.handleVerify.bind(this);
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
        });
      });
    }
    else {
      this.reportformat_dialog.show({});
    }
  }

  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onSaved,
      onSaveError,
    } = this.props;
    return (
      <EntityComponent
        name="reportformat"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Wrapper>
            {children({
              ...other,
              create: this.openReportFormatDialog,
              edit: this.openReportFormatDialog,
              verify: this.handleVerify,
            })}
            <ReportFormatDialog
              ref={ref => this.reportformat_dialog = ref}
              onSave={save}
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
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onVerified: PropTypes.func,
  onVerifyError: PropTypes.func,
};

export default withGmp(ReportFormatComponent);

// vim: set ts=2 sw=2 tw=80:
