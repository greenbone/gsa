/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  testing,
} from '@gsa/testing';
import Logger from 'gmp/log';
import {type ToString} from 'gmp/types';
import {
  type DisplayComponent,
  type DisplayRegistry,
  getDisplay,
  registerDisplay,
} from 'web/components/dashboard/registry';

interface TestDisplayProps {
  value: string;
}

const LOG_NAME = 'web.components.dashboard.registry';

describe('dashboard registry', () => {
  let displayRegistry: DisplayRegistry<TestDisplayProps>;
  const log = Logger.getLogger(LOG_NAME);
  let originalDebug: (...args: unknown[]) => void;
  let originalError: (...args: unknown[]) => void;

  beforeEach(() => {
    testing.clearAllMocks();

    originalDebug = log.debug;
    originalError = log.error;
    log.debug = testing.fn();
    log.error = testing.fn();

    displayRegistry = {};
  });

  afterEach(() => {
    log.debug = originalDebug;
    log.error = originalError;
  });

  const createDisplayComponent = (
    displayId?: string,
  ): DisplayComponent<TestDisplayProps> => {
    return Object.assign(() => null, {displayId} as {displayId: string});
  };

  test('should register and return a display', () => {
    const displayId = 'dummy-valid';
    const DummyDisplay = createDisplayComponent(displayId);

    registerDisplay<TestDisplayProps>(
      DummyDisplay,
      'Dummy display',
      displayRegistry,
    );

    const display = getDisplay<TestDisplayProps>(displayId, displayRegistry);

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

    registerDisplay<TestDisplayProps>(
      DummyDisplay,
      'Dummy display',
      displayRegistry,
    );

    expect(log.error).toHaveBeenCalledWith(
      'Undefined id passed while registering display',
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(
      getDisplay<TestDisplayProps>(unregisteredId, displayRegistry),
    ).toBeUndefined();
  });

  test('should log an error for undefined component', () => {
    const displayId = 'dummy-invalid-component';

    registerDisplay<TestDisplayProps>(
      undefined as unknown as DisplayComponent<TestDisplayProps>,
      'Dummy display',
      displayRegistry,
    );

    expect(log.error).toHaveBeenCalledWith(
      'Undefined component passed while registering display',
      undefined,
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(
      getDisplay<TestDisplayProps>(displayId, displayRegistry),
    ).toBeUndefined();
  });

  test('should log an error for undefined title', () => {
    const displayId = 'dummy-invalid-title';
    const DummyDisplay = createDisplayComponent(displayId);

    registerDisplay<TestDisplayProps>(
      DummyDisplay,
      undefined as unknown as ToString,
      displayRegistry,
    );

    expect(log.error).toHaveBeenCalledWith(
      'Undefined title passed while registering display',
      displayId,
    );
    expect(log.debug).not.toHaveBeenCalled();
    expect(
      getDisplay<TestDisplayProps>(displayId, displayRegistry),
    ).toBeUndefined();
  });
});
