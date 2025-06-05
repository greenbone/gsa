/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import useActiveTab from 'web/entity/hooks/useActiveTab';
import {rendererWith, wait} from 'web/testing';

describe('useActiveTab', () => {
  test('should set active tab to 0 by default', () => {
    const {renderHook} = rendererWith();
    const {result} = renderHook(() => useActiveTab());
    const [activeTab] = result.current;
    expect(activeTab).toBe(0);
  });

  test('should set active tab to 1 when activated', async () => {
    const {renderHook} = rendererWith();
    const {result} = renderHook(() => useActiveTab());
    const [activeTab, setActiveTab] = result.current;
    expect(activeTab).toBe(0);
    setActiveTab(1);
    await wait();
    expect(result.current[0]).toBe(1);
  });

  test('should call onInteraction when active tab changes', async () => {
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith();
    const {result} = renderHook(() => useActiveTab({onInteraction}));
    const [, setActiveTab] = result.current;
    setActiveTab(1);
    await wait();
    expect(onInteraction).toHaveBeenCalled();
  });
});
