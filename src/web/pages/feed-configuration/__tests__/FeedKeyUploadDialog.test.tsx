/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import FeedKeyUploadDialog from 'web/pages/feed-configuration/FeedKeyUploadDialog';

const createGmp = (overrides: Record<string, unknown> = {}) => ({
  feedkey: {
    get: testing.fn().mockResolvedValue(null),
    delete: testing.fn().mockResolvedValue({status: 'success', message: 'ok'}),
    save: testing.fn().mockResolvedValue({status: 'success', message: 'ok'}),
  },
  settings: {
    jwt: 'test-jwt-token',
    manualUrl: 'http://foo.bar',
  },
  ...overrides,
});

describe('FeedKeyUploadDialog', () => {
  test('should render the upload dialog', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(
      <FeedKeyUploadDialog
        onClose={testing.fn()}
        onError={testing.fn()}
        onSuccess={testing.fn()}
      />,
    );

    screen.getByText('Upload Feed Key');
    screen.getByText('Key File');
    screen.getByText('Please upload your feed key file', {exact: false});
  });

  test('should have an Upload button', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(
      <FeedKeyUploadDialog
        onClose={testing.fn()}
        onError={testing.fn()}
        onSuccess={testing.fn()}
      />,
    );

    const uploadButton = screen.getByTestId('dialog-save-button');
    expect(uploadButton).toHaveTextContent('Upload');
  });

  test('should call onClose when cancel button is clicked', () => {
    const onClose = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(
      <FeedKeyUploadDialog
        onClose={onClose}
        onError={testing.fn()}
        onSuccess={testing.fn()}
      />,
    );

    const cancelButton = screen.getByTestId('dialog-close-button');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('should show error when trying to save without a file', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(
      <FeedKeyUploadDialog
        onClose={testing.fn()}
        onError={testing.fn()}
        onSuccess={testing.fn()}
      />,
    );

    const uploadButton = screen.getByTestId('dialog-save-button');
    fireEvent.click(uploadButton);

    await screen.findByText('Please select a key file to upload');
  });

  test('should render the file input field', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(
      <FeedKeyUploadDialog
        onClose={testing.fn()}
        onError={testing.fn()}
        onSuccess={testing.fn()}
      />,
    );

    screen.getByTestId('file-input');
  });
});
