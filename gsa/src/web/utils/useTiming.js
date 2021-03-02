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

import {useEffect, useCallback} from 'react';

import logger from 'gmp/log';

import {hasValue, isFunction, isDefined} from 'gmp/utils/identity';

import useInstanceVariable from './useInstanceVariable';

const log = logger.getLogger('web.utils.useTiming');

const useTiming = (doFunc, timeout) => {
  const timer = useInstanceVariable({});

  const startTimer = useCallback(() => {
    if (hasValue(timer.timerId)) {
      log.debug('Not starting timer. A timer is already running.', {
        timer: timer.timerId,
      });
      return;
    }

    const timeoutValue = isFunction(timeout) ? timeout() : timeout;

    if (!hasValue(timeoutValue) || timeoutValue < 0) {
      log.debug('Not starting timer because timeout value was', timeoutValue);
      return;
    }

    timer.timerId = setTimeout(() => {
      log.debug('Timer with id', timer.timerId, 'fired.');

      const promise = doFunc();

      if (isDefined(promise?.then)) {
        promise
          .then(() => {
            timer.timerId = undefined;
            timer.startTimer();
          })
          .catch(() => {
            timer.timerId = undefined;
          });
      } else {
        timer.timerId = undefined;
      }
    }, timeoutValue);

    log.debug(
      'Started timer with id',
      timer.timerId,
      'and timeout of',
      timeoutValue,
      'milliseconds',
    );
  }, [doFunc, timeout, timer]);

  useEffect(() => {
    // put starTimer func into timer ref to allow referencing the NEWEST version
    // when a promise has ended
    timer.startTimer = startTimer;
  });

  const clearTimer = useCallback(() => {
    if (hasValue(timer.timerId)) {
      log.debug('Clearing timer with id', timer.timerId);

      clearTimeout(timer.timerId);

      timer.timerId = undefined;
    }
  }, [timer]);

  // clear timer on unmount
  useEffect(
    () => () => {
      log.debug('Removing timer on unmount');
      clearTimer();
    },
    [clearTimer],
  );

  return [startTimer, clearTimer, !!timer.timerId];
};

export default useTiming;
