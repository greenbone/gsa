/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Override from 'gmp/models/override';
import {createSession} from 'gmp/testing';
import OverrideBox from 'web/entity/OverrideBox';

const override = Override.fromElement({
  _id: '123',
  severity: 5.0,
  new_severity: 10,
  text: 'foo',
  end_time: '2019-01-01T12:00:00Z',
  modification_time: '2019-02-02T12:00:00Z',
});

const createGmp = () => ({
  session: createSession({timezone: 'CET'}),
});

describe('OverrideBox tests', () => {
  test('should render with DetailsLink', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createGmp(),
    });

    const {element} = render(
      <OverrideBox detailsLink={true} override={override} />,
    );

    const link = screen.getByTestId('details-link');
    const header = element.querySelector('h3');

    expect(header).toHaveTextContent(
      'Override from Severity > 0.0 to 10: Critical',
    );
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toEqual('/override/123');
    expect(element).toHaveTextContent(
      'ModifiedSat, Feb 2, 2019 1:00 PM Central European Standard',
    );
    expect(element).toHaveTextContent(
      'Active untilTue, Jan 1, 2019 1:00 PM Central European Standard',
    );
    expect(element).toHaveTextContent('foo');
  });

  test('should render without DetailsLink', () => {
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createGmp(),
    });

    const {element} = render(
      <OverrideBox detailsLink={false} override={override} />,
    );

    const link = element.querySelector('a');

    expect(link).toEqual(null);
    expect(element).toHaveTextContent('foo');
    expect(element).not.toHaveTextContent('details.svg');
    expect(element).toHaveTextContent(
      'ModifiedSat, Feb 2, 2019 1:00 PM Central European Standard',
    );
    expect(element).toHaveTextContent(
      'Active untilTue, Jan 1, 2019 1:00 PM Central European Standard',
    );
  });
});
