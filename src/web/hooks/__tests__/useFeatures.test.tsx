/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import Features from 'gmp/capabilities/features';
import useFeatures from 'web/hooks/useFeatures';

const TestUseFeatures = () => {
  const features = useFeatures();
  if (features.featureEnabled('ENABLE_AGENTS')) {
    return <span>May use agents</span>;
  }
  return <span>Agents are not available</span>;
};

describe('useFeatures tests', () => {
  test('should be allowed to use the agent feature', () => {
    const features = new Features(['ENABLE_AGENTS']);
    const {render} = rendererWith({features});

    const {element} = render(<TestUseFeatures />);

    expect(element).toHaveTextContent(/^May use agents$/);
  });

  test('should not be allowed to use the agents feature', () => {
    const features = new Features();
    const {render} = rendererWith({features});

    const {element} = render(<TestUseFeatures />);

    expect(element).toHaveTextContent(/^Agents are not available$/);
  });

  test('should throw an error if used outside FeaturesProvider', () => {
    // @ts-expect-error
    const {render} = rendererWith({features: null});

    expect(() => render(<TestUseFeatures />)).toThrow(
      'useFeatures must be used within a FeaturesProvider',
    );
  });
});
