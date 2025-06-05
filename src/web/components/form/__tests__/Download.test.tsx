/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Download from 'web/components/form/Download';
import {render} from 'web/testing';

describe('Download tests', () => {
  test('should render', () => {
    const {element} = render(<Download />);
    expect(element).toBeInTheDocument();
  });

  test('should render with filename', () => {
    const {element} = render(<Download filename="foo.bar" />);
    expect(element).toBeInTheDocument();
  });
});
