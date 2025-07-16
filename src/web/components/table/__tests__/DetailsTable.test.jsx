/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import DetailsTable from 'web/components/table/DetailsTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';

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
