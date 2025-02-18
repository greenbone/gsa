/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/Testing';

import TableBody from '../Body';
import TableData from '../Data';
import DetailsTable from '../DetailsTable';
import TableRow from '../Row';

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
