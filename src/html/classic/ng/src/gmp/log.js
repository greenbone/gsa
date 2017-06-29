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

import {is_defined, is_string} from './utils.js';


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
    level = is_string(level) ? level.toLowerCase() : undefined;
    let loglevel = LogLevels[level];

    if (is_defined(loglevel)) {
      this.level = level;
    }
    else {
      console.error('Unknown loglevel ', level, ' for Logger ', this.name);
      level = 5;
      this.level = 'silent';
    }

    for (let logname in LogLevels) { // eslint-disable-line guard-for-in
      this[logname] = (LogLevels[logname] < loglevel) ? noop : (...args) => {
        return console[logname](this.name, ...args);
      };
    }
  }
}

const DEFAULT_LOG_LEVEL = 'error';

class DefaultLogger {

  constructor() {
    this.level = is_defined(window.config) &&
      is_string(window.config.loglevel) ? window.config.loglevel :
      DEFAULT_LOG_LEVEL;
    this.loggers = {};
  }

  setDefaultLevel(level) {
    this.level = is_string(level) ? level.toLowerCase() : DEFAULT_LOG_LEVEL;
  }

  getLogger(name) {
    name = is_string(name) ? name : 'unknown';
    let logger = this.loggers[name];

    if (!is_defined(logger)) {
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
