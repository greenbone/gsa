/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, fireEvent, render, screen} from 'web/testing';
import SaveDialog from 'web/components/dialog/SaveDialog';
import NumberField from 'web/components/form/NumberField';
import TextField from 'web/components/form/TextField';
import Checkbox from 'web/components/form/Checkbox';
import {useState} from 'react';

interface TestDialogProps {
  onClose: () => void;
  onSave: (values: {foo?: string; bar: number}) => void;
  foo?: string;
  onFooChange?: (value: string, name?: string) => void;
}

const TestDialog = ({onClose, onSave, foo, onFooChange}: TestDialogProps) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const handleIsEnabledChange = (value: boolean) => {
    setIsEnabled(value);
  };
  return (
    <SaveDialog<{foo?: string; isEnabled: boolean}, {bar: number}>
      defaultValues={{bar: 42}}
      title="Some Dialog"
      values={{foo, isEnabled}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <TextField name="foo" value={values.foo} onChange={onFooChange} />
          <NumberField name="bar" value={values.bar} onChange={onValueChange} />
          <Checkbox<boolean>
            checked={values.isEnabled}
            name="isEnabled"
            onChange={handleIsEnabledChange}
          />
        </>
      )}
    </SaveDialog>
  );
};

describe('SaveDialog component tests', () => {
  test('should render a SaveDialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    render(<TestDialog onClose={handleClose} onSave={handleSave} />);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
  });

  test('should call onClose when dialog is closed', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    render(<TestDialog onClose={handleClose} onSave={handleSave} />);

    const button = screen.getDialogCloseButton();
    fireEvent.click(button);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should call onSave when save button is clicked', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    render(<TestDialog onClose={handleClose} onSave={handleSave} />);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled();
  });

  test('should update value in TextField', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleFooChange = testing.fn();
    const {rerender} = render(
      <TestDialog
        foo="something"
        onClose={handleClose}
        onFooChange={handleFooChange}
        onSave={handleSave}
      />,
    );

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      foo: 'something',
      bar: 42,
    });

    const textField = screen.getByName('foo');
    changeInputValue(textField, 'test value');
    expect(handleFooChange).toHaveBeenCalledWith('test value', 'foo');

    handleSave.mockClear();

    rerender(
      <TestDialog
        foo="test value"
        onClose={handleClose}
        onFooChange={handleFooChange}
        onSave={handleSave}
      />,
    );

    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      foo: 'test value',
      bar: 42,
    });
  });
});
