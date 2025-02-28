/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import {createDeleteEntity} from 'web/store/entities/utils/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';

class EntityComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleEntityClone = this.handleEntityClone.bind(this);
    this.handleEntityDelete = this.handleEntityDelete.bind(this);
    this.handleEntityDownload = this.handleEntityDownload.bind(this);
    this.handleEntitySave = this.handleEntitySave.bind(this);
  }

  componentDidMount() {
    this.props.loadSettings();
  }

  handleEntityDelete(entity) {
    const {deleteEntity, onDeleted, onDeleteError} = this.props;

    this.handleInteraction();

    return deleteEntity(entity.id).then(onDeleted, onDeleteError);
  }

  handleEntityClone(entity) {
    const {onCloned, onCloneError, gmp, name} = this.props;
    const cmd = gmp[name];

    this.handleInteraction();

    return cmd.clone(entity).then(onCloned, onCloneError);
  }

  handleEntitySave(data) {
    const {gmp, name} = this.props;
    const cmd = gmp[name];

    this.handleInteraction();

    if (isDefined(data.id)) {
      const {onSaved, onSaveError} = this.props;
      return cmd.save(data).then(onSaved, onSaveError);
    }

    const {onCreated, onCreateError} = this.props;
    return cmd.create(data).then(onCreated, onCreateError);
  }

  handleEntityDownload(entity) {
    const {
      detailsExportFileName,
      username,
      gmp,
      name,
      onDownloaded,
      onDownloadError,
    } = this.props;
    const cmd = gmp[name];

    this.handleInteraction();

    const promise = cmd.export(entity).then(response => {
      const filename = generateFilename({
        creationTime: entity.creationTime,
        fileNameFormat: detailsExportFileName,
        id: entity.id,
        modificationTime: entity.modificationTime,
        resourceName: entity.name,
        resourceType: name,
        username,
      });

      return {filename, data: response.data};
    });

    return promise.then(onDownloaded, onDownloadError);
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {children} = this.props;

    return children({
      create: this.handleEntitySave,
      clone: this.handleEntityClone,
      delete: this.handleEntityDelete,
      save: this.handleEntitySave,
      download: this.handleEntityDownload,
    });
  }
}

EntityComponent.propTypes = {
  children: PropTypes.func.isRequired,
  deleteEntity: PropTypes.func.isRequired,
  detailsExportFileName: PropTypes.string,
  gmp: PropTypes.gmp.isRequired,
  loadSettings: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  username: PropTypes.string,
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

const mapStateToProps = rootState => {
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const username = getUsername(rootState);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );
  return {
    detailsExportFileName,
    username,
  };
};

const mapDispatchToProps = (dispatch, {name, gmp}) => {
  const deleteEntity = createDeleteEntity({entityType: name});
  return {
    deleteEntity: id => dispatch(deleteEntity(gmp)(id)),
    loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
  };
};

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(EntityComponent);
