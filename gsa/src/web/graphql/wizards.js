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

import {useMutation} from '@apollo/client';

import {dateTimeWithTimeZone} from 'gmp/locale/date';

import {CREATE_TARGET} from 'web/graphql/targets';

import {CREATE_TASK, START_TASK} from 'web/graphql/tasks';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useUserTimezone from 'web/utils/useUserTimezone';

export const useRunQuickFirstScan = () => {
  const [sessionTimeout] = useUserSessionTimeout();
  const [userTimezone] = useUserTimezone();

  const [createTarget] = useMutation(CREATE_TARGET);
  const [createTask] = useMutation(CREATE_TASK);
  const [startTask] = useMutation(START_TASK);

  const runQuickFirstScan = useCallback(
    data => {
      const date = dateTimeWithTimeZone(sessionTimeout, userTimezone);

      const {hosts} = data;
      const targetInputObject = {
        name: `Target for immediate scan of IP ${hosts} - ${date}`,
        hosts,
        portListId: '33d0cd82-57c6-11e1-8ed1-406186ea4fc5', // All IANA assigned TCP
      };

      return createTarget({
        variables: {input: targetInputObject},
      }).then(resp => {
        const targetId = resp?.data?.createTarget?.id;

        const taskInputObject = {
          name: `Immediate scan of IP ${hosts}`,
          configId: 'daba56c8-73ec-11df-a475-002264764cea', // Full and Fast
          targetId,
          scannerId: '08b69003-5fc2-4037-a479-93b440211c73', // OpenVAS Default
        };

        return createTask({
          variables: {input: taskInputObject},
        }).then(response => {
          const taskId = response?.data?.createTask?.id;

          return startTask({variables: {id: taskId}}).then(
            result => result?.data?.startTask?.reportId,
          );
        });
      });
    },
    [createTarget, createTask, startTask, sessionTimeout, userTimezone],
  );

  return [runQuickFirstScan];
};
