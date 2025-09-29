/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, wait} from 'web/testing';
import Features from 'gmp/capabilities/features';
import useLoadFeatures from 'web/hooks/useLoadFeatures';

const TestComponent = () => {
  const features = useLoadFeatures();
  return (
    <>
      {features &&
        features.map(feature => {
          return (
            <div key={feature} data-testid="features">
              {feature}
            </div>
          );
        })}
    </>
  );
};

describe('useLoadFeatures tests', () => {
  test('should load features', async () => {
    const features = new Features(['CVSS3_RATINGS', 'OPENVASD']);
    const response = {data: features};
    const gmp = {
      user: {
        currentFeatures: testing.fn().mockResolvedValue(response),
      },
    };
    const {render} = rendererWith({gmp});

    render(<TestComponent />);

    await wait();

    expect(gmp.user.currentFeatures).toHaveBeenCalled();
    expect(screen.getAllByTestId('features').length).toEqual(2);
  });
});
