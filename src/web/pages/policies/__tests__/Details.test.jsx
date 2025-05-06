/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Policy from 'gmp/models/policy';
import Details from 'web/pages/policies/Details';
import {rendererWith} from 'web/utils/Testing';

describe('Policy Details tests', () => {
  test('should render full Details', () => {
    const policy = Policy.fromElement({
      name: 'foo',
      comment: 'bar',
      scanner: {name: 'scanner', type: '42'},
      tasks: {
        task: [
          {id: '1234', name: 'audit1'},
          {id: '5678', name: 'audit2'},
        ],
      },
    });
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element, getAllByTestId} = render(<Details entity={policy} />);

    expect(element).toHaveTextContent('bar');

    const detailsLinks = getAllByTestId('details-link');

    expect(element).toHaveTextContent('audit1');
    expect(detailsLinks[0]).toHaveAttribute('href', '/audit/1234');

    expect(element).toHaveTextContent('audit2');
    expect(detailsLinks[1]).toHaveAttribute('href', '/audit/5678');

    expect(element).not.toHaveTextContent('scanner');
  });
});
