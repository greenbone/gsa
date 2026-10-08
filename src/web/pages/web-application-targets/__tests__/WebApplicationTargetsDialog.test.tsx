/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, changeInputValue, rendererWith} from 'web/testing';
import Response from 'gmp/http/response';
import {createSession} from 'gmp/testing';
import WebApplicationTargetsDialog from 'web/pages/web-application-targets/WebApplicationTargetsDialog';

const createGmp = () => ({
  settings: {
    reloadInterval: 0,
    reloadIntervalActive: 0,
    reloadIntervalInactive: 0,
  },
  session: createSession({token: 'test-token'}),
  credentials: {
    getAll: testing.fn().mockResolvedValue(new Response([])),
  },
});

describe('WebApplicationTargetsDialog tests', () => {
  test('should render with default title and fields', () => {
    const {render} = rendererWith({gmp: createGmp(), capabilities: true});
    render(<WebApplicationTargetsDialog />);
    expect(screen.getByText('New Web Application Target')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByText('URLs')).toBeInTheDocument();
    expect(screen.getByText('Credential')).toBeInTheDocument();
    expect(screen.getByText('Reverse Lookup Only')).toBeInTheDocument();
    expect(screen.getByText('Reverse Lookup Unify')).toBeInTheDocument();
  });

  test('should render with custom title', () => {
    const {render} = rendererWith({gmp: createGmp(), capabilities: true});
    render(<WebApplicationTargetsDialog title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('should call onClose when close button is clicked', () => {
    const onClose = testing.fn();
    const {render} = rendererWith({gmp: createGmp(), capabilities: true});
    render(<WebApplicationTargetsDialog onClose={onClose} />);
    fireEvent.click(screen.getDialogCloseButton());
    expect(onClose).toHaveBeenCalled();
  });

  test('should call onSave when save button is clicked', () => {
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp(), capabilities: true});
    render(<WebApplicationTargetsDialog onSave={onSave} />);
    fireEvent.click(screen.getDialogSaveButton());
    expect(onSave).toHaveBeenCalled();
  });

  test('should allow changing name and comment', () => {
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp(), capabilities: true});
    render(<WebApplicationTargetsDialog onSave={onSave} />);
    changeInputValue(screen.getByName('name'), 'My Target');
    changeInputValue(screen.getByName('comment'), 'Some comment');
    fireEvent.click(screen.getDialogSaveButton());
    expect(onSave).toHaveBeenCalledWith({
      comment: 'Some comment',
      credentialId: '',
      excludeUrls: [],
      inUse: false,
      name: 'My Target',
      reverseLookupOnly: false,
      reverseLookupUnify: false,
      urls: [],
    });
  });

  test('should allow changing url', () => {
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp(), capabilities: true});
    render(
      <WebApplicationTargetsDialog
        urls={['https://example.com']}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getDialogSaveButton());
    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      credentialId: '',
      excludeUrls: [],
      inUse: false,
      name: 'Unnamed',
      reverseLookupOnly: false,
      reverseLookupUnify: false,
      urls: ['https://example.com'],
    });
  });
});
