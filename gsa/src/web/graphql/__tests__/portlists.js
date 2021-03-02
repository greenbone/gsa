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

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, screen, wait, fireEvent} from 'web/utils/testing';
import {
  useLazyGetPortLists,
  useCreatePortList,
  useModifyPortList,
} from '../portlists';
import {
  createGetPortListsQueryMock,
  createCreatePortListQueryMock,
  createPortListInput,
  modifyPortListInput,
  createModifyPortListQueryMock,
} from '../__mocks__/portlists';

const GetLazyPortListsComponent = () => {
  const [loadPortLists, {counts, loading, portLists}] = useLazyGetPortLists({
    filterString: 'foo',
  });

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => loadPortLists()} />
      {isDefined(counts) ? (
        <div data-testid="counts">
          <span data-testid="total">{counts.all}</span>
          <span data-testid="filtered">{counts.filtered}</span>
          <span data-testid="first">{counts.first}</span>
          <span data-testid="limit">{counts.rows}</span>
          <span data-testid="length">{counts.length}</span>
        </div>
      ) : (
        <div data-testid="no-counts" />
      )}
      {isDefined(portLists) ? (
        portLists.map(portList => {
          return (
            <div key={portList.id} data-testid="portlist">
              {portList.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-portlist" />
      )}
    </div>
  );
};

describe('useLazyGetPortLists tests', () => {
  test('should query portList after user interaction', async () => {
    const [mock, resultFunc] = createGetPortListsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyPortListsComponent />);

    let portListElements = screen.queryAllByTestId('portlist');
    expect(portListElements).toHaveLength(0);

    let noPortLists = screen.queryByTestId('no-portlist');
    expect(noPortLists).toBeInTheDocument();
    const noCounts = screen.queryByTestId('no-counts');
    expect(noCounts).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    portListElements = screen.getAllByTestId('portlist');
    expect(portListElements).toHaveLength(2);

    expect(portListElements[0]).toHaveTextContent('ports galore');
    expect(portListElements[1]).toHaveTextContent('moar ports');

    noPortLists = screen.queryByTestId('no-portlist');
    expect(noPortLists).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});

const CreateModifyPortListComponent = () => {
  const [notification, setNotification] = useState('');

  const [createPortList] = useCreatePortList();
  const [modifyPortList] = useModifyPortList();

  const handleCreateResult = id => {
    setNotification(`Portlist created with id ${id}.`);
  };

  const handleModifyResult = () => {
    setNotification('Portlist modified.');
  };

  return (
    <div>
      <button
        data-testid="create"
        title={'Create portlist'}
        onClick={() =>
          createPortList(createPortListInput).then(handleCreateResult)
        }
      />
      <button
        data-testid="modify"
        title={'Modify portlist'}
        onClick={() =>
          modifyPortList(modifyPortListInput).then(handleModifyResult)
        }
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

describe('Portlist mutation tests', () => {
  test('should create a portlist', async () => {
    const [queryMock, resultFunc] = createCreatePortListQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<CreateModifyPortListComponent />);

    const button = screen.getByTestId('create');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Portlist created with id 58989.',
    );
  });
  test('should modify a portlist', async () => {
    const [queryMock, resultFunc] = createModifyPortListQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<CreateModifyPortListComponent />);

    const button = screen.getByTestId('modify');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Portlist modified.',
    );
  });
});
