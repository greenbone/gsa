/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import PageTitle from 'web/components/layout/PageTitle';
import {applianceTitle} from 'web/utils/applianceData';

const gmp = {
  settings: {
    vendorLabel: undefined,
  },
};

describe('PageTitle tests', () => {
  test('Should render default title', () => {
    const {render} = rendererWith({gmp});

    render(<PageTitle />);

    expect(global.window.document.title).toBe(
      applianceTitle['defaultVendorLabel'],
    );
  });

  test('Should render custom page title', () => {
    const {render} = rendererWith({gmp});

    const title = 'foo';
    render(<PageTitle title={title} />);

    expect(global.window.document.title).toBe(
      applianceTitle['defaultVendorLabel'] + ' - ' + title,
    );
  });

  test('should update page title', () => {
    const {render} = rendererWith({gmp});

    const title1 = 'foo';
    const title2 = 'bar';
    const {rerender} = render(<PageTitle title={title1} />);

    expect(global.window.document.title).toBe(
      applianceTitle['defaultVendorLabel'] + ' - ' + title1,
    );

    rerender(<PageTitle title={title2} />);

    expect(global.window.document.title).toBe(
      applianceTitle['defaultVendorLabel'] + ' - ' + title2,
    );
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

    expect(global.window.document.title).toBe(
      applianceTitle['gsm-150_label.svg'],
    );
  });

  test('should render vendor title', () => {
    const {render} = rendererWith({
      gmp: {
        settings: {
          vendorTitle: 'Custom Vendor Title',
        },
      },
    });

    render(<PageTitle />);

    expect(global.window.document.title).toBe('Custom Vendor Title');
  });

  test('should render prefer vendor title over vendor label', () => {
    const {render} = rendererWith({
      gmp: {
        settings: {
          vendorLabel: 'gsm-150_label.svg',
          vendorTitle: 'Custom Vendor Title',
        },
      },
    });

    render(<PageTitle />);

    expect(global.window.document.title).toBe('Custom Vendor Title');
  });
});
