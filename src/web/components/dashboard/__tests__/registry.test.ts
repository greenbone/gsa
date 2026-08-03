/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ComponentType} from 'react';
import {beforeEach, describe, expect, test} from '@gsa/testing';
import {getDisplay, registerDisplay} from 'web/components/dashboard/registry';

const {getLoggerMock, log} = vi.hoisted(() => {
  const logger = {
    debug: vi.fn(),
    error: vi.fn(),
  };

  return {
    getLoggerMock: vi.fn(() => logger),
    log: logger,
  };
});

vi.mock('gmp/log', () => ({
  default: {
    getLogger: getLoggerMock,
  },
}));

describe('dashboard registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should register and return a display', () => {
    const displayId = 'dummy-valid';
    const DummyDisplay = () => null;

    registerDisplay(displayId, DummyDisplay, {title: 'Dummy display'});

    const display = getDisplay(displayId);

    expect(display).toBeDefined();
    expect(display?.displayId).toBe(displayId);
    expect(display?.component).toBe(DummyDisplay);
    expect(display?.title).toBe('Dummy display');
    expect(log.error).not.toHaveBeenCalled();
    expect(log.debug).toHaveBeenCalledWith('Registered display', displayId);
  });

  test('should log an error for undefined display id', () => {
    const unregisteredId = 'dummy-invalid-id';
    const DummyDisplay = () => null;

    registerDisplay(undefined as unknown as string, DummyDisplay, {
      title: 'Dummy display',
    });

    expect(log.error).toHaveBeenCalledWith(
      'Undefined id passed while registering display',
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(getDisplay(unregisteredId)).toBeUndefined();
  });

  test('should log an error for undefined component', () => {
    const displayId = 'dummy-invalid-component';

    registerDisplay(displayId, undefined as unknown as ComponentType, {
      title: 'Dummy display',
    });

    expect(log.error).toHaveBeenCalledWith(
      'Undefined component passed while registering display',
      displayId,
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(getDisplay(displayId)).toBeUndefined();
  });

  test('should log an error for undefined title', () => {
    const displayId = 'dummy-invalid-title';
    const DummyDisplay = () => null;

    registerDisplay(displayId, DummyDisplay, {});

    expect(log.error).toHaveBeenCalledWith(
      'Undefined title passed while registering display',
      displayId,
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(getDisplay(displayId)).toBeUndefined();
  });
});
