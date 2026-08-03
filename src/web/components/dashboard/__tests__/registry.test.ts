/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test} from '@gsa/testing';
import {type ToString} from 'gmp/types';
import {
  type DisplayComponent,
  getDisplay,
  registerDisplay,
} from 'web/components/dashboard/registry';

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

  const createDisplayComponent = (displayId?: string): DisplayComponent => {
    return Object.assign(() => null, {displayId} as {displayId: string});
  };

  test('should register and return a display', () => {
    const displayId = 'dummy-valid';
    const DummyDisplay = createDisplayComponent(displayId);

    registerDisplay(DummyDisplay, 'Dummy display');

    const display = getDisplay(displayId);

    expect(display).toBeDefined();
    expect(display?.component).toBe(DummyDisplay);
    expect(display?.title).toBe('Dummy display');
    expect(display?.component.displayId).toBe(displayId);
    expect(log.error).not.toHaveBeenCalled();
    expect(log.debug).toHaveBeenCalledWith('Registered display', displayId);
  });

  test('should log an error for undefined display id', () => {
    const unregisteredId = 'dummy-invalid-id';
    const DummyDisplay = createDisplayComponent();

    registerDisplay(DummyDisplay, 'Dummy display');

    expect(log.error).toHaveBeenCalledWith(
      'Undefined id passed while registering display',
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(getDisplay(unregisteredId)).toBeUndefined();
  });

  test('should log an error for undefined component', () => {
    const displayId = 'dummy-invalid-component';

    registerDisplay(undefined as unknown as DisplayComponent, 'Dummy display');

    expect(log.error).toHaveBeenCalledWith(
      'Undefined component passed while registering display',
      undefined,
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(getDisplay(displayId)).toBeUndefined();
  });

  test('should log an error for undefined title', () => {
    const displayId = 'dummy-invalid-title';
    const DummyDisplay = createDisplayComponent(displayId);

    registerDisplay(DummyDisplay, undefined as unknown as ToString);

    expect(log.error).toHaveBeenCalledWith(
      'Undefined title passed while registering display',
      displayId,
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(getDisplay(displayId)).toBeUndefined();
  });
});
