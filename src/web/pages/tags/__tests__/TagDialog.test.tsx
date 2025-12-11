/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
  wait,
} from 'web/testing';
import Response from 'gmp/http/response';
import ResourceName from 'gmp/models/resource-name';
import TagDialog, {SELECT_MAX_RESOURCES} from 'web/pages/tags/TagDialog';

const createGmp = ({
  getResourceNamesResponse = new Response([
    new ResourceName({id: '123', name: 'Task', type: 'task'}),
  ]),
  getResourceNames = testing.fn().mockResolvedValue(getResourceNamesResponse),
} = {}) => ({
  settings: {},
  resourcenames: {
    getAll: getResourceNames,
    get: getResourceNames,
  },
});

describe('TagDialog tests', () => {
  test('should render', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(<TagDialog />);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('New Tag');

    expect(screen.getDialogCloseButton()).toHaveTextContent('Cancel');
    expect(screen.getDialogSaveButton()).toHaveTextContent('Save');

    expect(screen.getByLabelText('Name')).toHaveValue('default:unnamed');
    expect(screen.getByLabelText('Comment')).toHaveValue('');
    expect(screen.getByLabelText('Value')).toHaveValue('');

    expect(screen.getByName('resourceType')).toHaveValue(undefined);
    expect(screen.getByName('resourceIds')).toHaveValue('');
    expect(screen.getByName('resourceIdText')).toHaveValue('');
    const activeOptions = screen.getAllByName('active');
    expect(activeOptions[0]).toBeChecked();
    expect(activeOptions[1]).not.toBeChecked();
  });

  test('should allow to close the dialog', () => {
    const onClose = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(<TagDialog onClose={onClose} />);

    fireEvent.click(screen.getDialogCloseButton());

    expect(onClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', async () => {
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(
      <TagDialog
        comment="New Tag"
        name="Some Tag"
        resourceIds={['123']}
        resourceType="task"
        resourceTypes={['task', 'report']}
        value="Some Value"
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      active: true,
      comment: 'New Tag',
      name: 'Some Tag',
      resourceIds: ['123'],
      resourceType: 'task',
      value: 'Some Value',
    });
  });

  test('should allow to change the name, comment and value', async () => {
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(<TagDialog comment="" name="" value="" onSave={onSave} />);

    const nameField = screen.getByLabelText('Name');
    changeInputValue(nameField, 'Changed Name');
    const commentField = screen.getByLabelText('Comment');
    changeInputValue(commentField, 'Changed Comment');
    const valueField = screen.getByLabelText('Value');
    changeInputValue(valueField, 'Changed Value');

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      active: true,
      comment: 'Changed Comment',
      name: 'Changed Name',
      resourceIds: [],
      resourceType: undefined,
      value: 'Changed Value',
    });
  });

  test('should allow to change the resource type', async () => {
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(
      <TagDialog
        resourceType="task"
        resourceTypes={['task', 'report']}
        onSave={onSave}
      />,
    );

    const resourceTypeSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Resource Type',
    });
    const resourceTypeOptions =
      await getSelectItemElementsForSelect(resourceTypeSelect);
    expect(resourceTypeOptions).toHaveLength(2);
    fireEvent.click(resourceTypeOptions[1]); // select 'report'

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      active: true,
      comment: '',
      name: 'default:unnamed',
      resourceIds: [],
      resourceType: 'report',
      value: '',
    });
  });

  test('should allow to change the resource IDs', async () => {
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(
      <TagDialog
        resourceType="task"
        resourceTypes={['task', 'report']}
        onSave={onSave}
      />,
    );

    // Wait for resource names to be loaded
    await wait();

    const resourceIdsSelect = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Select Resource',
    });
    const resourceIdOptions =
      await getSelectItemElementsForSelect(resourceIdsSelect);
    expect(resourceIdOptions.length).toBeGreaterThan(0);
    fireEvent.click(resourceIdOptions[0]); // select first option

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      active: true,
      comment: '',
      name: 'default:unnamed',
      resourceIds: ['123'],
      resourceType: 'task',
      value: '',
    });
  });

  test('should allow to change the active state', async () => {
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(
      <TagDialog
        active={true}
        comment="New Tag"
        name="Some Tag"
        value="Some Value"
        onSave={onSave}
      />,
    );
    const inactiveOption = screen.getByLabelText('No');
    fireEvent.click(inactiveOption);
    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      active: false,
      comment: 'New Tag',
      name: 'Some Tag',
      resourceIds: [],
      resourceType: undefined,
      value: 'Some Value',
    });
  });

  test('should allow to add a resource uuid by text input', async () => {
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(
      <TagDialog
        resourceType="task"
        resourceTypes={['task', 'report']}
        onSave={onSave}
      />,
    );

    const resourceIdTextField = screen.getByLabelText('Add Resource by ID');
    changeInputValue(resourceIdTextField, '123');

    // let the change propagate
    await wait();

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      active: true,
      comment: '',
      name: 'default:unnamed',
      resourceIds: ['123'],
      resourceType: 'task',
      value: '',
    });
  });

  test('should show message when too many resources are selected', async () => {
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(
      <TagDialog
        resourceCount={SELECT_MAX_RESOURCES + 1}
        resourceType="task"
        resourceTypes={['task', 'report']}
        onSave={onSave}
      />,
    );

    expect(screen.getByText('Too many resources to list.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Resource Type')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Select Resource')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Add Resource by ID'),
    ).not.toBeInTheDocument();
  });

  test('should not allow to change resources if fixed', async () => {
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    render(
      <TagDialog
        fixed={true}
        resourceType="task"
        resourceTypes={['task', 'report']}
        onSave={onSave}
      />,
    );

    await wait();

    expect(screen.getByName('resourceType')).toBeDisabled();
    expect(screen.getByName('resourceIds')).toBeDisabled();
    expect(screen.getByLabelText('Add Resource by ID')).toBeDisabled();
  });
});
