/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Policy from 'gmp/models/policy';
import PolicyDetailsPageToolBarIcons from 'web/pages/policies/PolicyDetailsPageToolBarIcons';

const manualUrl = 'test/';

const families = [
  {
    name: 'family1',
    nvt_count: '1',
    max_nvt_count: '1',
    growing: 1,
  },
  {
    name: 'family2',
    nvt_count: '2',
    max_nvt_count: '4',
    growing: 0,
  },
  {
    name: 'family3',
    nvt_count: '0',
    max_nvt_count: '2',
    growing: 0,
  },
];

const preferences = {
  preference: [
    {
      name: 'preference0',
      hr_name: 'preference0',
      id: 0,
      value: 'yes',
      type: 'checkbox',
      default: 'no',
      nvt: {
        _oid: '0',
        name: 'nvt0',
      },
    },
    {
      name: 'preference1',
      hr_name: 'preference1',
      id: 1,
      value: 'value2',
      type: 'radio',
      default: 'value1',
      alt: ['value2', 'value3'],
      nvt: {
        _oid: '1',
        name: 'nvt1',
      },
    },
    {
      name: 'preference2',
      hr_name: 'preference2',
      id: 2,
      type: 'entry',
      value: 'foo',
      default: 'bar',
      nvt: {
        _oid: '2',
        name: 'nvt2',
      },
    },
    {
      name: 'scannerpref0',
      hr_name: 'Scanner Preference 1',
      value: 0,
      default: 0,
      nvt: {},
    },
  ],
};

const policy = Policy.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'Some Comment',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: 1,
  in_use: 0,
  family_count: {__text: '', growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {_id: '1234', name: 'audit1'},
      {_id: '5678', name: 'audit2'},
    ],
  },
});

describe('PolicyDetailsPageToolBarIcons tests', () => {
  test('should render', () => {
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();
    const gmp = {settings: {manualUrl}};
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <PolicyDetailsPageToolBarIcons
        entity={policy}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    expect(screen.getByTitle('Help: Policies')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-policies',
    );

    expect(screen.getByTitle('Policies List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/policies',
    );
  });

  test('should call click handlers', () => {
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <PolicyDetailsPageToolBarIcons
        entity={policy}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(handlePolicyCloneClick).toHaveBeenCalledWith(policy);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Policy');
    fireEvent.click(editIcon);
    expect(handlePolicyEditClick).toHaveBeenCalledWith(policy);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Policy to trashcan');
    fireEvent.click(deleteIcon);
    expect(handlePolicyDeleteClick).toHaveBeenCalledWith(policy);

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Policy as XML');
    fireEvent.click(downloadIcon);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy);
  });

  test('should not call click handlers without permission', () => {
    const policy = Policy.fromElement({
      _id: '12345',
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      owner: {name: 'user'},
      writable: 1,
      in_use: 0,
      family_count: {__text: '', growing: 1},
      families: {family: families},
      preferences: preferences,
      permissions: {permission: [{name: 'get_config'}]},
      scanner: {name: 'scanner', type: '42'},
      tasks: {
        task: [
          {_id: '1234', name: 'audit1'},
          {_id: '5678', name: 'audit2'},
        ],
      },
    });
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();
    const gmp = {settings: {manualUrl}};
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <PolicyDetailsPageToolBarIcons
        entity={policy}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Policy denied',
    );
    fireEvent.click(cloneIcon);
    expect(handlePolicyCloneClick).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Policy denied',
    );
    fireEvent.click(editIcon);
    expect(handlePolicyEditClick).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Policy to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handlePolicyDeleteClick).not.toHaveBeenCalled();

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Policy as XML');
    fireEvent.click(downloadIcon);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy);
  });

  test('should (not) call click handlers if policy is in use', () => {
    const policy = Policy.fromElement({
      _id: '12345',
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      owner: {name: 'user'},
      writable: 1,
      in_use: 1,
      family_count: {__text: '', growing: 1},
      families: {family: families},
      preferences: preferences,
      permissions: {permission: [{name: 'everything'}]},
      scanner: {name: 'scanner', type: '42'},
      tasks: {
        task: [
          {_id: '1234', name: 'audit1'},
          {_id: '5678', name: 'audit2'},
        ],
      },
    });
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();
    const gmp = {settings: {manualUrl}};
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <PolicyDetailsPageToolBarIcons
        entity={policy}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(handlePolicyCloneClick).toHaveBeenCalledWith(policy);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Policy');
    fireEvent.click(editIcon);
    expect(handlePolicyEditClick).toHaveBeenCalledWith(policy);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Policy is still in use');
    fireEvent.click(deleteIcon);
    expect(handlePolicyDeleteClick).not.toHaveBeenCalled();

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Policy as XML');
    fireEvent.click(downloadIcon);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy);
  });

  test('should (not) call click handlers if policy is not writable', () => {
    const policy = Policy.fromElement({
      _id: '12345',
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      owner: {name: 'user'},
      writable: 0,
      in_use: 0,
      family_count: {__text: '', growing: 1},
      families: {family: families},
      preferences: preferences,
      permissions: {permission: [{name: 'everything'}]},
      scanner: {name: 'scanner', type: '42'},
      tasks: {
        task: [
          {_id: '1234', name: 'audit1'},
          {_id: '5678', name: 'audit2'},
        ],
      },
    });
    const handlePolicyCloneClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();
    const gmp = {settings: {manualUrl}};
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <PolicyDetailsPageToolBarIcons
        entity={policy}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(handlePolicyCloneClick).toHaveBeenCalledWith(policy);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Policy is not writable');
    fireEvent.click(editIcon);
    expect(handlePolicyEditClick).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Policy is not writable');
    fireEvent.click(deleteIcon);
    expect(handlePolicyDeleteClick).not.toHaveBeenCalled();

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Policy as XML');
    fireEvent.click(downloadIcon);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy);
  });
});
