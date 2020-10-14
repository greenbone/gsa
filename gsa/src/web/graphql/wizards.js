/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {dateTimeWithTimeZone} from 'gmp/locale/date';

import {ALL_IANA_ASSIGNED_TCP} from 'gmp/models/portlist';
import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';
import {OPENVAS_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';

import {useCreateTarget} from 'web/graphql/targets';

import {useCreateTask, useStartTask} from 'web/graphql/tasks';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useUserTimezone from 'web/utils/useUserTimezone';

export const useRunQuickFirstScan = () => {
  const [sessionTimeout] = useUserSessionTimeout();
  const [userTimezone] = useUserTimezone();

  const [createTarget] = useCreateTarget();
  const [createTask] = useCreateTask();
  const [startTask] = useStartTask();

  const runQuickFirstScan = useCallback(
    data => {
      const date = dateTimeWithTimeZone(sessionTimeout, userTimezone);

      const {hosts} = data;
      const targetInputObject = {
        name: `Target for immediate scan of IP ${hosts} - ${date}`,
        hosts,
        portListId: ALL_IANA_ASSIGNED_TCP,
      };

      return createTarget(targetInputObject).then(resp => {
        const targetId = resp?.data?.createTarget?.id;

        const taskInputObject = {
          name: `Immediate scan of IP ${hosts}`,
          configId: FULL_AND_FAST_SCAN_CONFIG_ID,
          targetId,
          scannerId: OPENVAS_DEFAULT_SCANNER_ID,
        };

        return createTask(taskInputObject).then(response => {
          const taskId = response?.data?.createTask?.id;

          return startTask(taskId).then(
            result => result?.data?.startTask?.reportId,
          );
        });
      });
    },
    [createTarget, createTask, startTask, sessionTimeout, userTimezone],
  );

  return [runQuickFirstScan];
};
