/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import ReportConfig from 'gmp/models/reportconfig';
import {rendererWith} from 'web/utils/testing';

import {mockReportConfig} from '../__mocks__/mockreportconfig';
import Details from '../details';

describe('Report Config Details tests', () => {
  test('should render full Details', () => {
    const config = ReportConfig.fromElement(mockReportConfig);

    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element, getAllByTestId} = render(<Details entity={config} />);

    expect(element).toHaveTextContent('StringParam');
    expect(element).toHaveTextContent('StringValue');

    expect(element).toHaveTextContent('TextParam');
    const preElements = element.querySelectorAll('pre');
    expect(preElements[0]).toHaveTextContent('TextValue');

    expect(element).toHaveTextContent('IntegerParam');
    expect(element).toHaveTextContent('12');
    expect(element).toHaveTextContent('SelectionParam');
    expect(element).toHaveTextContent('OptionB');
    expect(element).toHaveTextContent('ReportFormatListParam');
    expect(element).toHaveTextContent('non-configurable');

    const detailsLinks = getAllByTestId('details-link');

    // Report format of the config
    expect(detailsLinks[0]).toHaveTextContent('example-configurable-1');
    expect(detailsLinks[0]).toHaveAttribute('href', '/reportformat/123456');

    // Report format params
    expect(detailsLinks[1]).toHaveTextContent('non-configurable-1');
    expect(detailsLinks[1]).toHaveAttribute('href', '/reportformat/654321');

    expect(detailsLinks[2]).toHaveTextContent('non-configurable-2');
    expect(detailsLinks[2]).toHaveAttribute('href', '/reportformat/7654321');

    // Alerts
    expect(detailsLinks[3]).toHaveTextContent('ABC');
    expect(detailsLinks[3]).toHaveAttribute('href', '/alert/321');

    expect(detailsLinks[4]).toHaveTextContent('XYZ');
    expect(detailsLinks[4]).toHaveAttribute('href', '/alert/789');
  });

  test('should render orphaned config details', () => {
    const config = ReportConfig.fromElement({
      _id: '123',
      name: 'foo',
      comment: 'bar',
      orphan: '1',
    });

    const caps = new Capabilities(['everything']);

    const {render} = rendererWith({capabilities: caps, router: true});

    const {element} = render(<Details entity={config} />);

    expect(element).toHaveTextContent(
      'not available for orphaned report configs',
    );
  });
});
