/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useState} from 'react';
import Filter from 'gmp/models/filter';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';
import usePagination from '../usePagination';

const refetch = jest.fn();
const filter = Filter.fromString('sort=name first=1 rows=7');
const simpleFilter = filter.withoutView();
const pageInfo = {
  startCursor: 'start',
  endCursor: 'end',
  lastPageCursor: 'last',
};

const PaginationComponent = () => {
  const [message, setMessage] = useState('Not called');

  const [getFirst, getLast, getNext, getPrevious] = usePagination({
    simpleFilter,
    filter,
    pageInfo,
    refetch,
  });

  return (
    <div>
      <button
        data-testid="get-first"
        onClick={() => {
          getFirst();
          setMessage('getFirst called!');
        }}
      />
      <button
        data-testid="get-last"
        onClick={() => {
          getLast();
          setMessage('getLast called!');
        }}
      />
      <button
        data-testid="get-next"
        onClick={() => {
          getNext();
          setMessage('getNext called!');
        }}
      />
      <button
        data-testid="get-previous"
        onClick={() => {
          getPrevious();
          setMessage('getPrevious called!');
        }}
      />
      <span data-testid="message">{message}</span>
    </div>
  );
};

describe('usePagination tests', () => {
  test('should call correct functions upon user interaction', async () => {
    const {render} = rendererWith({store: true});

    const {getByTestId} = render(<PaginationComponent selectionType="0" />);

    const message = getByTestId('message');

    expect(message).toHaveTextContent('Not called');

    const button = screen.getByTestId('get-first');
    fireEvent.click(button);

    await wait();

    expect(message).toHaveTextContent('getFirst called!');
    expect(refetch).toHaveBeenCalledWith({
      after: undefined,
      before: undefined,
      filterString: 'sort=name',
      first: 7,
      last: undefined,
    });

    const button2 = screen.getByTestId('get-last');
    fireEvent.click(button2);

    await wait();

    expect(message).toHaveTextContent('getLast called!');
    expect(refetch).toHaveBeenCalledWith({
      after: 'last',
      before: undefined,
      filterString: 'sort=name',
      first: 7,
      last: undefined,
    });

    const button3 = screen.getByTestId('get-next');
    fireEvent.click(button3);

    await wait();

    expect(message).toHaveTextContent('getNext called!');
    expect(refetch).toHaveBeenCalledWith({
      after: 'end',
      before: undefined,
      filterString: 'sort=name',
      first: 7,
      last: undefined,
    });

    const button4 = screen.getByTestId('get-previous');
    fireEvent.click(button4);

    await wait();

    expect(message).toHaveTextContent('getPrevious called!');
    expect(refetch).toHaveBeenCalledWith({
      after: undefined,
      before: 'start',
      filterString: 'sort=name',
      first: undefined,
      last: 7,
    });
  });
});
