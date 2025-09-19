/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {map} from 'gmp/utils/array';

export type Feature = (typeof FEATURE_NAMES)[number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FEATURE_NAMES = [
  'CVSS3_RATINGS',
  'OPENVASD',
  'FEED_VT_METADATA',
  'ENABLE_AGENTS',
  'ENABLE_CONTAINER_SCANNING',
] as const;

class Features {
  private readonly _features: Set<Feature>;

  constructor(featureNames?: Feature[]) {
    const features: Feature[] = map(
      featureNames,
      name => name.toUpperCase() as Feature,
    );
    this._features = new Set(features);
  }

  protected has(name: Feature): boolean {
    return this._features.has(name.toUpperCase() as Feature);
  }

  featureEnabled(feature: Feature) {
    return this.has(feature);
  }

  get length() {
    return this._features.size;
  }

  [Symbol.iterator]() {
    return this._features[Symbol.iterator]();
  }

  map<T>(callbackfn: (value: Feature, index: number, array: string[]) => T) {
    return Array.from(this._features).map(callbackfn);
  }
}

export default Features;
