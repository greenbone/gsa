/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import {isDefined, isString} from './utils/identity';

const GREENBONE_GREEN = '#99CE48';

const LogLevels = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

function noop() {};

/* eslint-disable no-console */

export class Logger {

  constructor(name, level) {
    this.name = name;
    this.setLevel(level);
  }

  setLevel(level) {
    level = isString(level) ? level.toLowerCase() : undefined;
    const loglevel = LogLevels[level];

    if (isDefined(loglevel)) {
      this.level = level;
    }
    else {
      console.error('Unknown loglevel ', level, ' for Logger ', this.name);
      level = 5;
      this.level = 'silent';
    }

    for (const logname in LogLevels) { // eslint-disable-line guard-for-in
      this[logname] = LogLevels[logname] < loglevel ? noop : (...args) => {
        return console[logname]('%c' + this.name, 'color: ' + GREENBONE_GREEN,
          ...args);
      };
    }
  }
}

const DEFAULT_LOG_LEVEL = 'error';

class DefaultLogger {

  constructor() {
    this.level = isDefined(window.config) &&
      isString(window.config.loglevel) ? window.config.loglevel :
      DEFAULT_LOG_LEVEL;
    this.loggers = {};
  }

  setDefaultLevel(level) {
    this.level = isString(level) ? level.toLowerCase() : DEFAULT_LOG_LEVEL;
  }

  getLogger(name) {
    name = isString(name) ? name : 'unknown';
    let logger = this.loggers[name];

    if (!isDefined(logger)) {
      logger = new Logger(name, this.level);
      this.loggers[name] = logger;
    }
    return logger;
  }

  error(...args) {
    console.error(...args);
  }

  warn(...args) {
    console.warn(...args);
  }

  info(...args) {
    console.info(...args);
  }

  debug(...args) {
    console.debug(...args);
  }
}

/* eslint-enable no-console */

const logger = new DefaultLogger();

window.logger = logger;

export default logger;

// vim: set ts=2 sw=2 tw=80:
