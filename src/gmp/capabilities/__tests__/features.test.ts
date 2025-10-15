/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Features, {type Feature} from 'gmp/capabilities/features';

describe('Features tests', () => {
  test('should check feature enabled', () => {
    const featureList: Feature[] = ['CVSS3_RATINGS', 'OPENVASD'];
    const features = new Features(featureList);

    expect(features.featureEnabled('CVSS3_RATINGS')).toBe(true);
    expect(features.featureEnabled('OPENVASD')).toBe(true);
    // @ts-expect-error
    expect(features.featureEnabled('openvasd')).toBe(true);
    expect(features.featureEnabled('FEED_VT_METADATA')).toBe(false);
    expect(features.featureEnabled('ENABLE_AGENTS')).toBe(false);
    // @ts-expect-error
    expect(features.featureEnabled('enable_agents')).toBe(false);
  });

  test('should handle unknown features', () => {
    const featureList: Feature[] = [
      // @ts-expect-error
      'ENABLED_FEATURE_1',
      // @ts-expect-error
      'ENABLED_FEATURE_2',
    ];
    const features = new Features(featureList);
    // @ts-expect-error
    expect(features.featureEnabled('ENABLED_FEATURE_1')).toBe(true);
    // @ts-expect-error
    expect(features.featureEnabled('enabled_feature_2')).toBe(true);
    // @ts-expect-error
    expect(features.featureEnabled('UNDEFINED_FEATURE')).toBe(false);
  });

  test('should allow iterating', () => {
    const featureList: Feature[] = ['CVSS3_RATINGS', 'OPENVASD'];
    const features = new Features(featureList);

    expect(features.length).toEqual(2);

    let i = 0;
    for (const feature of features) {
      i++;
      expect(featureList).toContain(feature);
    }
    expect(i).toEqual(2);
  });

  test('should allow mapping', () => {
    const features = new Features(['CVSS3_RATINGS', 'OPENVASD']);

    expect(features.map(feature => feature)).toEqual([
      'CVSS3_RATINGS',
      'OPENVASD',
    ]);
  });
});
