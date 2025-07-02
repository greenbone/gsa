/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {render, screen, userEvent} from 'web/testing';
import MultiValueTextField from 'web/components/form/MultiValueTextField';

describe('MultiValueTextField', () => {
    test('should render input and tags', () => {
        render(
            <MultiValueTextField
                name="kdcs"
                title="KDCs"
                value={['example.com', '192.168.1.1']}
                onChange={testing.fn()}
            />,
        );

        expect(screen.getByTestId('form-multi-input')).toBeInTheDocument();
        expect(screen.getByText('example.com')).toBeVisible();
        expect(screen.getByText('192.168.1.1')).toBeVisible();
    });

    test('should call onChange when a value is added', async () => {
        const onChange = testing.fn();

        render(
            <MultiValueTextField
                name="kdcs"
                title="KDCs"
                value={[]}
                onChange={onChange}
            />,
        );

        const input = screen.getByTestId('form-multi-input');
        await userEvent.type(input, 'myhost.com{enter}');

        expect(onChange).toHaveBeenCalledWith(['myhost.com'], 'kdcs');
    });

    test('should filter out invalid input using validate prop', async () => {
        const onChange = testing.fn();
        const validate = (val: string) => !val.includes(' ');

        render(
            <MultiValueTextField
                name="kdcs"
                title="KDCs"
                validate={validate}
                value={[]}
                onChange={onChange}
            />,
        );

        const input = screen.getByTestId('form-multi-input');
        await userEvent.type(input, 'invalid host{enter}');

        expect(onChange).not.toHaveBeenCalledWith(['duplicate'], 'kdcs');
    });

    test('should not add duplicate values', async () => {
        const onChange = testing.fn();

        render(
            <MultiValueTextField
                name="kdcs"
                title="KDCs"
                value={['duplicate']}
                onChange={onChange}
            />,
        );

        const input = screen.getByTestId('form-multi-input');
        await userEvent.type(input, 'duplicate{enter}');

        expect(onChange).not.toHaveBeenCalled();
    });

    test('should remove a tag when close button is clicked', async () => {
        const onChange = testing.fn();

        render(
            <MultiValueTextField
                name="kdcs"
                title="KDCs"
                value={['one', 'two']}
                onChange={onChange}
            />,
        );

        // Find the tag with the label 'two'
        const tag = screen.getByText('two').closest('[data-disabled="false"]') ?? screen.getByText('two').parentElement;
        expect(tag).toBeTruthy();

        const removeButton = tag?.querySelector('button');
        expect(removeButton).toBeTruthy();
        if (!removeButton) {
            throw new Error('Remove button not found');
        }

        await userEvent.click(removeButton);

        expect(onChange).toHaveBeenCalledWith(['one'], 'kdcs');
    });
});
