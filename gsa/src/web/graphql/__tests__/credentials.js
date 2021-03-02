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

/* eslint-disable react/prop-types */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, screen, wait, fireEvent} from 'web/utils/testing';

import {useLazyGetCredentials, useCreateCredential} from '../credentials';
import {
  createGetCredentialsQueryMock,
  createCreateCredentialQueryMock,
} from '../__mocks__/credentials';

const GetLazyCredentialsComponent = () => {
  const [
    getCredentials,
    {counts, loading, credentials},
  ] = useLazyGetCredentials();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getCredentials()} />
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
      {isDefined(credentials) ? (
        credentials.map(credential => {
          return (
            <div key={credential.id} data-testid="credential">
              {credential.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-credential" />
      )}
    </div>
  );
};

describe('useLazyGetCredentials tests', () => {
  test('should query credentials after user interaction', async () => {
    const [mock, resultFunc] = createGetCredentialsQueryMock();

    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyCredentialsComponent />);

    let credentialElements = screen.queryAllByTestId('credential');
    expect(credentialElements).toHaveLength(0);

    let noCredentials = screen.queryByTestId('no-credential');
    expect(noCredentials).toBeInTheDocument();
    const noCounts = screen.queryByTestId('no-counts');
    expect(noCounts).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    credentialElements = screen.getAllByTestId('credential');
    expect(credentialElements).toHaveLength(2);

    expect(credentialElements[0]).toHaveTextContent('credential 1');
    expect(credentialElements[1]).toHaveTextContent('credential 2');

    noCredentials = screen.queryByTestId('no-credential');
    expect(noCredentials).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});

const CreateCredentialComponent = ({data}) => {
  const [createCredential, {id: credentialId}] = useCreateCredential();
  return (
    <div>
      {credentialId && <span data-testid="credential">{credentialId}</span>}
      <button data-testid="create" onClick={() => createCredential(data)} />
    </div>
  );
};

describe('useCreateCredential tests', () => {
  test('should create a credential after user interaction', async () => {
    const data = {
      name: 'credential 1',
      comment: 'foo',
    };

    const [mock, resultFunc] = createCreateCredentialQueryMock(
      data,
      'credential 1',
    );
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CreateCredentialComponent data={data} />);

    const button = screen.getByTestId('create');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('credential')).toHaveTextContent('credential 1');
  });
});
