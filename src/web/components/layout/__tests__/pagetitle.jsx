/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import PageTitle from 'web/components/layout/pagetitle';

import {rendererWith} from 'web/utils/testing';

const gmp = {
  settings: {
    vendorLabel: 'someVendorLabel',
  },
};

describe('PageTitle tests', () => {
  test('Should render default title', () => {
    const {render} = rendererWith({gmp});

    const defaultTitle = 'Greenbone Security Assistant';
    render(<PageTitle />);

    expect(global.window.document.title).toBe(defaultTitle);
  });

  test('Should render custom title', () => {
    const {render} = rendererWith({gmp});

    const title = 'foo';
    const defaultTitle = 'Greenbone Security Assistant';
    render(<PageTitle title={title} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title);
  });

  test('should update value', () => {
    const {render} = rendererWith({gmp});

    const title1 = 'foo';
    const title2 = 'bar';
    const defaultTitle = 'Greenbone Security Assistant';
    const {rerender} = render(<PageTitle title={title1} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title1);

    rerender(<PageTitle title={title2} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title2);
  });
  test('should render appliance model title', () => {
    const {render} = rendererWith({
      gmp: {
        settings: {
          vendorLabel: 'gsm-150_label.svg',
        },
      },
    });
    render(<PageTitle />);

    expect(global.window.document.title).toBe('Greenbone - 150');
  });
});
