/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {updateDisplayName} from 'web/utils/displayName';

describe('updateDisplayName', () => {
  test('should update the displayName of the wrapper component', () => {
    const WrappedComponent = () => <div>Wrapped Component</div>;
    const WrapperComponent = () => <div>Wrapper Component</div>;

    const updatedWrapper = updateDisplayName(
      WrapperComponent,
      WrappedComponent,
      'TestWrapper',
    );

    expect(updatedWrapper.displayName).toBe('TestWrapper(WrappedComponent)');
  });

  test('should use "Component" if the wrapped component has no name or displayName', () => {
    const WrapperComponent = () => <div>Wrapper Component</div>;

    const updatedWrapper = updateDisplayName(
      WrapperComponent,
      () => <div>Anonymous Component</div>,
      'TestWrapper',
    );

    expect(updatedWrapper.displayName).toBe('TestWrapper(Component)');
  });

  test('should prioritize displayName over name for the wrapped component', () => {
    const WrappedComponent = () => <div>Wrapped Component</div>;
    WrappedComponent.displayName = 'CustomDisplayName';
    const WrapperComponent = () => <div>Wrapper Component</div>;

    const updatedWrapper = updateDisplayName(
      WrapperComponent,
      WrappedComponent,
      'TestWrapper',
    );

    expect(updatedWrapper.displayName).toBe('TestWrapper(CustomDisplayName)');
  });

  test('should handle string components correctly', () => {
    const WrapperComponent = () => <div>Wrapper Component</div>;

    const updatedWrapper = updateDisplayName(
      WrapperComponent,
      'StringComponent',
      'TestWrapper',
    );

    expect(updatedWrapper.displayName).toBe('TestWrapper(StringComponent)');
  });
});
