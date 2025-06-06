/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor, userEvent} from 'web/testing';
import EntitiesContainer from 'web/entities/Container';

const currentSettingsResponse = {
  data: {
    listexportfilename: {
      id: 'a6ac88c5-729c-41ba-ac0a-deea4a3441f2',
      name: 'List Export File Name',
      value: '%T-%U',
    },
  },
};

const entity = {id: '123'};

const onDownloaded = testing.fn();
const onDownloadError = testing.fn();
const onInteraction = testing.fn();
const onDeleteError = testing.fn();
const onChanged = testing.fn();
const notify = testing.fn();
const updateFilter = testing.fn();
const reload = testing.fn();
const showError = testing.fn();
const showErrorMessage = testing.fn();
const showSuccessMessage = testing.fn();
const onDelete = testing.fn();
const onDownload = testing.fn();
const onError = testing.fn();

const setup = gmp => {
  const {render} = rendererWith({gmp, store: true, router: true});
  render(
    <EntitiesContainer
      entities={[{entityType: 'port_list'}]}
      gmp={gmp}
      gmpname="port_list"
      isLoading={false}
      notify={notify}
      reload={reload}
      showError={showError}
      showErrorMessage={showErrorMessage}
      showSuccessMessage={showSuccessMessage}
      updateFilter={updateFilter}
      onChanged={onChanged}
      onDelete={onDelete}
      onDeleteError={onDeleteError}
      onDownload={onDownload}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onError={onError}
      onInteraction={onInteraction}
    >
      {({onDownloadBulk}) => (
        <button data-testid="button" onClick={() => onDownloadBulk(entity)}>
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
      port_lists: {
        exportByFilter: testing.fn().mockResolvedValue({data: downloadedData}),
      },
      user: {currentSettings},
    };

    const downloadButton = setup(gmp);
    await userEvent.click(downloadButton);

    await waitFor(() => expect(screen.getByText('Bulk download started.')));
    expect(onDownload).toHaveBeenCalledWith({
      filename: 'port_lists-list.xml',
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
      port_lists: {exportByFilter: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };

    const originalConsoleError = console.error;
    console.error = testing.fn();

    const downloadButton = setup(gmp);
    await userEvent.click(downloadButton);

    expect(showError).toHaveBeenCalledWith(error);
    expect(onDownloaded).not.toHaveBeenCalled();

    console.error = originalConsoleError;
  });
});
