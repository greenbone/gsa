/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import Download from '../download';

describe('Download tests', () => {
  test('should render', () => {
    const {element} = render(<Download />);
    expect(element).toMatchSnapshot();
  });

  test('should render with filename', () => {
    const {element} = render(<Download filename="foo.bar" />);
    expect(element).toMatchSnapshot();
  });
});
