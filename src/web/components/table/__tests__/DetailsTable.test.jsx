/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import DetailsTable from 'web/components/table/DetailsTable';
import TableRow from 'web/components/table/Row';

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
