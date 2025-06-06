/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import {Route, Routes} from 'react-router';
import Capabilities from 'gmp/capabilities/capabilities';
import ConditionalRoute from 'web/components/conditionalRoute/ConditionalRoute';

const MockComponent = () => <div>Mock Component</div>;

describe('ConditionalRoute', () => {
  const featureList = [
    {name: 'ENABLED_FEATURE', _enabled: 1},
    {name: 'DISABLED_FEATURE', _enabled: 0},
  ];
  const capabilities = new Capabilities(['everything'], featureList);
  const {render} = rendererWith({capabilities, router: true});
  test.each([
    {
      feature: 'ENABLED_FEATURE',
      expectedText: 'Mock Component',
      description: 'renders the component when the feature is enabled',
    },
    {
      feature: 'DISABLED_FEATURE',
      expectedText: 'Not Found',
      description: 'redirects when the feature is disabled',
    },
    {
      feature: 'unknown-feature',
      expectedText: 'Not Found',
      description: 'does not render the component for an unknown feature',
    },
  ])('$description', ({feature, expectedText}) => {
    render(
      <Routes>
        <Route
          element={
            <ConditionalRoute component={MockComponent} feature={feature} />
          }
          path="/"
        />
        <Route element={<div>Not Found</div>} path="/notfound" />
      </Routes>,
    );

    expect(screen.getByText(expectedText)).toBeVisible();
  });
});
