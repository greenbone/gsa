/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import Features from 'gmp/capabilities/features';
import {
  CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import useCredentialStore from 'web/hooks/useCredentialStore';

describe('useCredentialStore', () => {
  test('should return true for credential store types when feature is enabled', () => {
    const features = new Features(['ENABLE_CREDENTIAL_STORES']);
    const {renderHook} = rendererWith({features});

    const {result: result1} = renderHook(() =>
      useCredentialStore(CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE),
    );
    expect(result1.current).toBe(true);

    const {result: result2} = renderHook(() =>
      useCredentialStore(CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE),
    );
    expect(result2.current).toBe(true);

    const {result: result3} = renderHook(() =>
      useCredentialStore(CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE),
    );
    expect(result3.current).toBe(true);
  });

  test('should return false for credential store types when feature is disabled', () => {
    const features = new Features();
    const {renderHook} = rendererWith({features});

    const {result} = renderHook(() =>
      useCredentialStore(CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE),
    );
    expect(result.current).toBe(false);
  });

  test('should return false for non-credential store types even when feature is enabled', () => {
    const features = new Features(['ENABLE_CREDENTIAL_STORES']);
    const {renderHook} = rendererWith({features});

    const {result} = renderHook(() =>
      useCredentialStore(USERNAME_PASSWORD_CREDENTIAL_TYPE),
    );
    expect(result.current).toBe(false);
  });

  test('should return false for non-credential store types when feature is disabled', () => {
    const features = new Features();
    const {renderHook} = rendererWith({features});

    const {result} = renderHook(() =>
      useCredentialStore(USERNAME_PASSWORD_CREDENTIAL_TYPE),
    );
    expect(result.current).toBe(false);
  });
});
