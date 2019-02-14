/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import {RootLogger, DEFAULT_LOG_LEVEL, LogLevels} from '../log.js';
import {isFunction} from 'util';

let origConsole;
let testConsole;

const getRootLogger = () => new RootLogger();

describe('log tests', () => {
  beforeEach(() => {
    origConsole = global.console;
    testConsole = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    };

    global.console = testConsole;
  });

  afterEach(() => {
    global.console = origConsole;
  });

  test('should init with defaults', () => {
    const logger = getRootLogger();
    expect(logger.level).toEqual(DEFAULT_LOG_LEVEL);
  });

  test('should init loglevel', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'error'})).toEqual(true);
    expect(logger.level).toEqual('error');
  });

  test('should ignore unknown loglevel in init', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'foo'})).toEqual(false);
    expect(logger.level).toEqual(DEFAULT_LOG_LEVEL);
  });

  test('should return new logger', () => {
    const logger = getRootLogger();
    const newLogger = logger.getLogger('foo.bar');

    expect(newLogger).toBeDefined();

    expect(isFunction(newLogger.error)).toEqual(true);
    expect(isFunction(newLogger.warn)).toEqual(true);
    expect(isFunction(newLogger.info)).toEqual(true);
    expect(isFunction(newLogger.debug)).toEqual(true);
    expect(isFunction(newLogger.trace)).toEqual(true);
    expect(newLogger.silent).toBeUndefined();
    expect(isFunction(newLogger.setLevel)).toEqual(true);
    expect(isFunction(newLogger.setDefaultLevel)).toEqual(true);
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);
  });

  test('should setDefaultLogLevel', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'error'})).toEqual(true);
    expect(logger.level).toEqual('error');

    const newLogger = logger.getLogger('foo.bar');
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);

    expect(logger.setDefaultLevel('debug')).toEqual(true);
    expect(newLogger.defaultLogValue).toEqual(LogLevels.debug);
  });

  test('should ignore unknown levels in RootLoogger setDefaultLogLevel', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'error'})).toEqual(true);
    expect(logger.level).toEqual('error');

    const newLogger = logger.getLogger('foo.bar');
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);

    expect(logger.setDefaultLevel('foo')).toEqual(false);
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);
  });

  test('should ignore unknown levels in logger setDefaultLogLevel', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'error'})).toEqual(true);
    expect(logger.level).toEqual('error');

    const newLogger = logger.getLogger('foo.bar');
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);

    newLogger.setDefaultLevel('foo');
    expect(newLogger.defaultLogValue).toEqual(LogLevels.silent);
  });

  test('should return same logger instance for the same name', () => {
    const logger = getRootLogger();
    const newLogger = logger.getLogger('foo.bar');
    expect(newLogger).toBeDefined();

    const anotherLogger = logger.getLogger('foo.bar');
    expect(anotherLogger).toBeDefined();

    expect(anotherLogger).toBe(newLogger);
  });

  test('should allow to set level on logger', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'error'})).toEqual(true);

    const newLogger = logger.getLogger('foo.bar');
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);
    expect(isFunction(newLogger.setLevel)).toEqual(true);

    newLogger.setLevel('debug');
    expect(newLogger.logValue).toEqual(LogLevels.debug);
  });

  test('should set loglevel to silent for unknown loglevels', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'error'})).toEqual(true);

    const newLogger = logger.getLogger('foo.bar');
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);
    expect(isFunction(newLogger.setLevel)).toEqual(true);

    newLogger.setLevel('foo');
    expect(testConsole.error).toHaveBeenCalled();
    expect(newLogger.logValue).toEqual(LogLevels.silent);
  });

  test('should log debug when level changes', () => {
    const logger = getRootLogger();
    const newLogger = logger.getLogger('foo.bar');
    newLogger.setLevel('error');
    expect(newLogger.logValue).toEqual(LogLevels.error);

    expect(testConsole.trace).not.toHaveBeenCalled();
    newLogger.trace('foo');
    expect(testConsole.trace).not.toHaveBeenCalled();

    expect(testConsole.debug).not.toHaveBeenCalled();
    newLogger.debug('foo');
    expect(testConsole.debug).not.toHaveBeenCalled();

    expect(testConsole.info).not.toHaveBeenCalled();
    newLogger.info('foo');
    expect(testConsole.info).not.toHaveBeenCalled();

    expect(testConsole.warn).not.toHaveBeenCalled();
    newLogger.warn('foo');
    expect(testConsole.warn).not.toHaveBeenCalled();

    expect(testConsole.error).not.toHaveBeenCalled();
    newLogger.error('foo');
    expect(testConsole.error).toHaveBeenCalled();

    newLogger.setLevel('debug');

    expect(testConsole.trace).not.toHaveBeenCalled();
    newLogger.trace('foo');
    expect(testConsole.trace).not.toHaveBeenCalled();

    expect(testConsole.debug).not.toHaveBeenCalled();
    newLogger.debug('foo');
    expect(testConsole.debug).toHaveBeenCalled();

    expect(testConsole.info).not.toHaveBeenCalled();
    newLogger.info('foo');
    expect(testConsole.info).toHaveBeenCalled();

    expect(testConsole.warn).not.toHaveBeenCalled();
    newLogger.warn('foo');
    expect(testConsole.warn).toHaveBeenCalled();

    expect(testConsole.error).toHaveBeenCalledTimes(1);
    newLogger.error('foo');
    expect(testConsole.error).toHaveBeenCalledTimes(2);
  });

  test('should log debug when default level changes', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'error'})).toEqual(true);

    const newLogger = logger.getLogger('foo.bar');
    expect(newLogger.logValue).toBeUndefined();
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);

    expect(testConsole.trace).not.toHaveBeenCalled();
    newLogger.trace('foo');
    expect(testConsole.trace).not.toHaveBeenCalled();

    expect(testConsole.debug).not.toHaveBeenCalled();
    newLogger.debug('foo');
    expect(testConsole.debug).not.toHaveBeenCalled();

    expect(testConsole.info).not.toHaveBeenCalled();
    newLogger.info('foo');
    expect(testConsole.info).not.toHaveBeenCalled();

    expect(testConsole.warn).not.toHaveBeenCalled();
    newLogger.warn('foo');
    expect(testConsole.warn).not.toHaveBeenCalled();

    expect(testConsole.error).not.toHaveBeenCalled();
    newLogger.error('foo');
    expect(testConsole.error).toHaveBeenCalled();

    logger.setDefaultLevel('debug');
    expect(newLogger.logValue).toBeUndefined();
    expect(newLogger.defaultLogValue).toEqual(LogLevels.debug);

    expect(testConsole.trace).not.toHaveBeenCalled();
    newLogger.trace('foo');
    expect(testConsole.trace).not.toHaveBeenCalled();

    expect(testConsole.debug).not.toHaveBeenCalled();
    newLogger.debug('foo');
    expect(testConsole.debug).toHaveBeenCalled();

    expect(testConsole.info).not.toHaveBeenCalled();
    newLogger.info('foo');
    expect(testConsole.info).toHaveBeenCalled();

    expect(testConsole.warn).not.toHaveBeenCalled();
    newLogger.warn('foo');
    expect(testConsole.warn).toHaveBeenCalled();

    expect(testConsole.error).toHaveBeenCalledTimes(1);
    newLogger.error('foo');
    expect(testConsole.error).toHaveBeenCalledTimes(2);
  });

  test('should not override level if default level changes', () => {
    const logger = getRootLogger();
    expect(logger.init({loglevel: 'error'})).toEqual(true);

    const newLogger = logger.getLogger('foo.bar');
    newLogger.setLevel('error');

    expect(newLogger.logValue).toEqual(LogLevels.error);
    expect(newLogger.defaultLogValue).toEqual(LogLevels.error);

    expect(testConsole.trace).not.toHaveBeenCalled();
    newLogger.trace('foo');
    expect(testConsole.trace).not.toHaveBeenCalled();

    expect(testConsole.debug).not.toHaveBeenCalled();
    newLogger.debug('foo');
    expect(testConsole.debug).not.toHaveBeenCalled();

    expect(testConsole.info).not.toHaveBeenCalled();
    newLogger.info('foo');
    expect(testConsole.info).not.toHaveBeenCalled();

    expect(testConsole.warn).not.toHaveBeenCalled();
    newLogger.warn('foo');
    expect(testConsole.warn).not.toHaveBeenCalled();

    expect(testConsole.error).not.toHaveBeenCalled();
    newLogger.error('foo');
    expect(testConsole.error).toHaveBeenCalled();

    logger.setDefaultLevel('debug');
    expect(newLogger.logValue).toEqual(LogLevels.error);
    expect(newLogger.defaultLogValue).toEqual(LogLevels.debug);

    expect(testConsole.trace).not.toHaveBeenCalled();
    newLogger.trace('foo');
    expect(testConsole.trace).not.toHaveBeenCalled();

    expect(testConsole.debug).not.toHaveBeenCalled();
    newLogger.debug('foo');
    expect(testConsole.debug).not.toHaveBeenCalled();

    expect(testConsole.info).not.toHaveBeenCalled();
    newLogger.info('foo');
    expect(testConsole.info).not.toHaveBeenCalled();

    expect(testConsole.warn).not.toHaveBeenCalled();
    newLogger.warn('foo');
    expect(testConsole.warn).not.toHaveBeenCalled();

    expect(testConsole.error).toHaveBeenCalledTimes(1);
    newLogger.error('foo');
    expect(testConsole.error).toHaveBeenCalledTimes(2);
  });
});

// vim: set ts=2 sw=2 tw=80:
