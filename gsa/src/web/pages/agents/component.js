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
import {shorten} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import AgentDialog from './dialog.js';

class AgentComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleDownloadInstaller = this.handleDownloadInstaller.bind(this);
    this.handleVerifyAgent = this.handleVerifyAgent.bind(this);
    this.handleCloseAgentDialog = this.handleCloseAgentDialog.bind(this);
    this.openAgentDialog = this.openAgentDialog.bind(this);
  }

  handleVerifyAgent(agent) {
    const {gmp, onVerifyError, onVerified} = this.props;

    this.handleInteraction();

    gmp.agent.verify(agent).then(onVerified, onVerifyError);
  }

  handleDownloadInstaller(agent) {
    const {gmp, onInstallerDownloadError, onInstallerDownloaded} = this.props;
    const {id, name} = agent;

    this.handleInteraction();

    return gmp.agent
      .downloadInstaller(agent)
      .then(response => {
        const filename = 'agent-' + name + '-' + id + '-installer';
        return {filename, data: response.data};
      })
      .then(onInstallerDownloaded, onInstallerDownloadError);
  }

  openAgentDialog(agent) {
    let title = '';

    if (isDefined(agent)) {
      title = _('Edit Agent {{name}}', {name: shorten(agent.name)});
    } else {
      title = _('New Agent');
    }

    this.setState({
      dialogVisible: true,
      agent,
      title,
    });

    this.handleInteraction();
  }

  closeAgentDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseAgentDialog() {
    this.closeAgentDialog();
    this.handleInteraction();
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
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onInteraction,
      onSaved,
      onSaveError,
    } = this.props;

    const {agent, dialogVisible, title} = this.state;

    return (
      <EntityComponent
        name="agent"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({save, ...other}) => (
          <React.Fragment>
            {children({
              ...other,
              create: this.openAgentDialog,
              edit: this.openAgentDialog,
              verify: this.handleVerifyAgent,
              downloadinstaller: this.handleDownloadInstaller,
            })}
            {dialogVisible && (
              <AgentDialog
                agent={agent}
                title={title}
                onClose={this.handleCloseAgentDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeAgentDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

AgentComponent.propTypes = {
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
  onInstallerDownloadError: PropTypes.func,
  onInstallerDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onVerified: PropTypes.func,
  onVerifyError: PropTypes.func,
};

export default withGmp(AgentComponent);

// vim: set ts=2 sw=2 tw=80:
