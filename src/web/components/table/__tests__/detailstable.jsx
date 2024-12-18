/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/testing';

import TableBody from '../body';
import TableData from '../data';
import DetailsTable from '../detailstable';
import TableRow from '../row';

describe('DetailsTable tests', () => {
  test('should render', () => {
    const {element} = render(
      <DetailsTable>
        <TableBody>
          <TableRow>
            <TableData>foo</TableData>
            <TableData>bar</TableData>
          </TableRow>
        </TableBody>
      </DetailsTable>,
    );

    expect(element).toBeVisible();
  });
});
