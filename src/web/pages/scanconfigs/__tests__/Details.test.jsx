/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import ScanConfig from 'gmp/models/scanconfig';
import {OPENVAS_SCANNER_TYPE} from 'gmp/models/scanner';
import Details from 'web/pages/scanconfigs/Details';
import {rendererWith, screen} from 'web/utils/Testing';

describe('Scan Config Details tests', () => {
  test('should render full Details', () => {
    const config = ScanConfig.fromElement({
      name: 'foo',
      comment: 'bar',
      scanner: {name: 'scanner1', id: '42', type: OPENVAS_SCANNER_TYPE},
      tasks: {
        task: [
          {id: '1234', name: 'task1'},
          {id: '5678', name: 'task2'},
        ],
      },
    });
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element} = render(<Details entity={config} />);

    expect(element).toHaveTextContent('bar');

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(element).toHaveTextContent('task1');
    expect(detailsLinks[0]).toHaveAttribute('href', '/task/1234');

    expect(element).toHaveTextContent('task2');
    expect(detailsLinks[1]).toHaveAttribute('href', '/task/5678');

    expect(element).not.toHaveTextContent('scanner');
  });

  test('should mark deprecated', () => {
    const config = ScanConfig.fromElement({
      name: 'foo',
      comment: 'bar',
      deprecated: '1',
      scanner: {name: 'scanner1', id: '42', type: OPENVAS_SCANNER_TYPE},
      tasks: {
        task: [
          {id: '1234', name: 'task1'},
          {id: '5678', name: 'task2'},
        ],
      },
    });
    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element} = render(<Details entity={config} />);
    expect(element).toHaveTextContent('Deprecatedyes');
  });
});
