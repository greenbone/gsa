/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  rendererWith,
  screen,
  waitFor,
  userEvent,
  fireEvent,
  wait,
} from 'web/testing';
import Filter from 'gmp/models/filter';
import PortList from 'gmp/models/portlist';
import EntitiesContainer from 'web/entities/EntitiesContainer';

const currentSettingsResponse = {
  data: {
    listexportfilename: {
      id: 'a6ac88c5-729c-41ba-ac0a-deea4a3441f2',
      name: 'List Export File Name',
      value: '%T-%U',
    },
  },
};

const onDownloaded = testing.fn();
const notify = testing.fn();
const updateFilter = testing.fn();
const reload = testing.fn();
const showError = testing.fn();
const showErrorMessage = testing.fn();
const showSuccessMessage = testing.fn();
const onDownload = testing.fn();

const setup = gmp => {
  const {render} = rendererWith({gmp, store: true, router: true});
  const initialFilter = new Filter();
  render(
    <EntitiesContainer
      entities={[new PortList()]}
      filter={initialFilter}
      gmp={gmp}
      gmpName="portlist"
      isLoading={false}
      notify={notify}
      reload={reload}
      showError={showError}
      showErrorMessage={showErrorMessage}
      showSuccessMessage={showSuccessMessage}
      updateFilter={updateFilter}
      onDownload={onDownload}
    >
      {({onDownloadBulk}) => (
        <button data-testid="button" onClick={() => onDownloadBulk()}>
          Download Bulk
        </button>
      )}
    </EntitiesContainer>,
  );
  return screen.getByRole('button', {name: /Download Bulk/i});
};

describe('EntitiesContainer', () => {
  test('should allow downloading entities in bulk', async () => {
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const downloadedData = {id: '123'};
    const gmp = {
      portlists: {
        exportByFilter: testing.fn().mockResolvedValue({data: downloadedData}),
      },
      user: {currentSettings},
    };

    const downloadButton = setup(gmp);
    await userEvent.click(downloadButton);

    await waitFor(() => expect(screen.getByText('Bulk download started.')));
    expect(onDownload).toHaveBeenCalledWith({
      filename: 'portlists-list.xml',
      data: downloadedData,
    });
    await waitFor(() => expect(screen.getByText('Bulk download completed.')));
  });

  test('should call onDownloadError when downloading entities in bulk fails', async () => {
    const currentSettings = testing
      .fn()
      .mockResolvedValue(currentSettingsResponse);
    const error = 'mock error';
    const gmp = {
      portlists: {exportByFilter: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };

    const originalConsoleError = console.error;
    console.error = testing.fn();

    const downloadButton = setup(gmp);
    fireEvent.click(downloadButton);

    await wait();

    expect(showError).toHaveBeenCalledWith(error);
    expect(onDownloaded).not.toHaveBeenCalled();

    console.error = originalConsoleError;
  });
});
