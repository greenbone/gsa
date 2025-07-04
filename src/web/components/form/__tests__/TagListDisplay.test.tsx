/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import TagListDisplay from 'web/components/form/TagListDisplay';

describe('TagListDisplay', () => {
  test('should render all values as tags', () => {
    render(<TagListDisplay values={['kdc1.example.com', '192.168.1.1']} />);

    expect(screen.getByText('kdc1.example.com')).toBeVisible();
    expect(screen.getByText('192.168.1.1')).toBeVisible();
  });

  test('should render nothing if values array is empty', () => {
    render(<TagListDisplay values={[]} />);
    expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
  });
});
