/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import {useCallback} from 'react';

import {useSelector} from 'react-redux';

import {capitalizeFirstLetter} from 'gmp/utils/string';

import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import {generateFilename} from 'web/utils/render';
import useUserName from 'web/utils/useUserName';

const useExportEntity = () => {
  const username = useUserName();
  const userDefaultsSelector = useSelector(getUserSettingsDefaults);
  const listExportFileName = userDefaultsSelector.getValueByName(
    'listexportfilename',
  );

  const exportEntity = useCallback(
    ({entity, exportFunc, resourceType, onDownload, onError}) => {
      return exportFunc([entity.id]).then(response => {
        const filename = generateFilename({
          fileNameFormat: listExportFileName,
          resourceType,
          username,
        });

        const commandName =
          'export' + capitalizeFirstLetter(resourceType) + 'ByIds';

        const xml = response.data;
        const {exportedEntities} = xml[commandName];
        onDownload({filename, data: exportedEntities});
      }, onError);
    },
    [listExportFileName, username],
  );

  return exportEntity;
};

export default useExportEntity;
