/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/* eslint-disable react/prop-types */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, wait, screen, fireEvent} from 'web/utils/testing';

import {useGetSetting, useGetSettings, useLazyGetSettings} from '../settings';
import {
  createGetSettingQueryMock,
  createGetSettingsQueryMock,
  createGetSettingsQueryErrorMock,
} from '../__mocks__/settings';

const TestUseSetting = ({settingId}) => {
  const {setting, loading: isLoading} = useGetSetting(settingId);
  if (isLoading) {
    return <div data-testid="loading" />;
  }
  return (
    <div data-testid="setting">
      <div data-testid="id">{setting.id}</div>
      <div data-testid="comment">{setting.comment}</div>
      <div data-testid="name">{setting.name}</div>
      <div data-testid="value">{setting.value}</div>
    </div>
  );
};

describe('useGetSetting tests', () => {
  test('should load setting', async () => {
    const id = 'id-1';
    const comment = 'A comment';
    const name = 'foo';
    const value = 'bar';

    const [mock, resultFunc] = createGetSettingQueryMock(id, {
      comment,
      name,
      value,
    });

    const {render} = rendererWith({
      queryMocks: [mock],
    });

    render(<TestUseSetting settingId={id} />);

    let loading = screen.getByTestId('loading');
    expect(loading).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    loading = screen.queryByTestId('loading');
    expect(loading).not.toBeInTheDocument();

    const settingId = screen.getByTestId('id');
    const settingComment = screen.getByTestId('comment');
    const settingName = screen.getByTestId('name');
    const settingValue = screen.getByTestId('value');

    expect(settingId).toHaveTextContent(id);
    expect(settingComment).toHaveTextContent(comment);
    expect(settingName).toHaveTextContent(name);
    expect(settingValue).toHaveTextContent(value);
  });
});

const TestGetSettings = () => {
  const {settings, loading, error} = useGetSettings();
  if (loading) {
    return <div data-testid="loading">Loading</div>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {settings && (
        <div data-testid="settings">
          {settings.map((setting, i) => (
            <div data-testid="setting" key={i}>
              <div data-testid="name">{setting.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

describe('useGetSettings tests', () => {
  test('should load settings', async () => {
    const [queryMock, resultFunc] = createGetSettingsQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<TestGetSettings />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    expect(screen.getByTestId('settings')).toBeInTheDocument();

    const settings = screen.getAllByTestId('setting');
    expect(settings.length).toEqual(2);
  });

  test('should return error if loading failed', async () => {
    const [queryMock] = createGetSettingsQueryErrorMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<TestGetSettings />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(screen.queryByTestId('settings')).not.toBeInTheDocument();

    expect(screen.queryByTestId('error')).toHaveTextContent(
      'An error occurred.',
    );
  });
});

const GetLazySettingsComponent = () => {
  const [getSettings, {settings, loading}] = useLazyGetSettings();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getSettings()} />
      {isDefined(settings) ? (
        settings.map(setting => {
          return (
            <div key={setting.id} data-testid="setting">
              {setting.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-settings" />
      )}
    </div>
  );
};

describe('useLazyGetSettings tests', () => {
  test('should query settings after user interaction', async () => {
    const [mock, resultFunc] = createGetSettingsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazySettingsComponent />);

    let settingElements = screen.queryAllByTestId('setting');
    expect(settingElements).toHaveLength(0);

    expect(screen.queryByTestId('no-settings')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    settingElements = screen.getAllByTestId('setting');
    expect(settingElements).toHaveLength(2);

    expect(settingElements[0]).toHaveTextContent('1');
    expect(settingElements[1]).toHaveTextContent('2');

    expect(screen.queryByTestId('no-settings')).not.toBeInTheDocument();
  });
});
