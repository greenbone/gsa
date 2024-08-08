/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {describe, test, expect} from '@gsa/testing';

import PageTitle from 'web/components/layout/pagetitle';

import {render} from 'web/utils/testing';

describe('PageTitle tests', () => {
  test('should render', () => {
    const {element} = render(<PageTitle />);
    expect(element).toMatchSnapshot();
  });

  test('Should render default title', () => {
    const defaultTitle = 'Greenbone Security Assistant';
    render(<PageTitle />);

    expect(global.window.document.title).toBe(defaultTitle);
  });

  test('Should render custom title', () => {
    const title = 'foo';
    const defaultTitle = 'Greenbone Security Assistant';
    render(<PageTitle title={title} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title);
  });

  test('should update value', () => {
    const title1 = 'foo';
    const title2 = 'bar';
    const defaultTitle = 'Greenbone Security Assistant';
    const {rerender} = render(<PageTitle title={title1} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title1);

    rerender(<PageTitle title={title2} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title2);
  });
});
