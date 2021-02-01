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
import {useEffect, useCallback} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {isDefined} from 'gmp/utils/identity';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {createDeleteEntity} from 'web/store/entities/utils/actions';

import PropTypes from 'web/utils/proptypes';
import {generateFilename} from 'web/utils/render';
import useGmp from 'web/utils/useGmp';
import useUserName from 'web/utils/useUserName';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

export const goto_details = (type, props) => ({data}) => {
  const {history} = props;
  return history.push('/' + type + '/' + data.id);
};

export const goto_list = (type, props) => () => {
  const {history} = props;
  return history.push('/' + type);
};

const EntityComponent = ({
  children,
  name,
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
}) => {
  const gmp = useGmp();
  const username = useUserName();
  const dispatch = useDispatch();
  const [, renewSession] = useUserSessionTimeout();

  const cmd = gmp[name];

  const userDefaultsSelector = useSelector(getUserSettingsDefaults);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  const deleteEntityFunc = createDeleteEntity({entityType: name});
  const deleteEntity = id => dispatch(deleteEntityFunc(gmp)(id));

  const loadSettings = useCallback(
    () => dispatch(loadUserSettingDefaults(gmp)()),
    [dispatch, gmp],
  );

  useEffect(() => {
    // load settings on mount
    loadSettings();
  }, [loadSettings]);

  const handleEntityDelete = entity => {
    renewSession();

    return deleteEntity(entity.id).then(onDeleted, onDeleteError);
  };

  const handleEntityClone = useCallback(
    entity => {
      renewSession();

      return cmd.clone(entity).then(onCloned, onCloneError);
    },
    [cmd, renewSession, onCloneError, onCloned],
  );

  const handleEntitySave = useCallback(
    data => {
      renewSession();

      if (isDefined(data.id)) {
        return cmd.save(data).then(onSaved, onSaveError);
      }

      return cmd.create(data).then(onCreated, onCreateError);
    },
    [cmd, renewSession, onCreateError, onCreated, onSaveError, onSaved],
  );

  const handleEntityDownload = useCallback(
    entity => {
      renewSession();

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
    },
    [
      cmd,
      name,
      detailsExportFileName,
      renewSession,
      username,
      onDownloadError,
      onDownloaded,
    ],
  );

  return children({
    create: handleEntitySave,
    clone: handleEntityClone,
    delete: handleEntityDelete,
    save: handleEntitySave,
    download: handleEntityDownload,
  });
};

EntityComponent.propTypes = {
  children: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
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

export default EntityComponent;

// vim: set ts=2 sw=2 tw=80:
