/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import type {FileInputProps} from '@mantine/core';
import {FileInput} from '@greenbone/ui-lib';
import {isDefined} from 'gmp/utils/identity';
import useTranslation from 'web/hooks/useTranslation';

interface FileFieldProps extends Omit<FileInputProps, 'label' | 'onChange'> {
  disabled?: boolean;
  grow?: number | string;
  name?: string;
  title?: string;
  onChange?: (file: File | undefined, name?: string) => void;
}

const FileField = ({
  disabled,
  grow,
  name,
  title,
  value,
  onChange,
  ...props
}: FileFieldProps) => {
  const [_] = useTranslation();
  const handleChange = useCallback(
    (file: File) => {
      if (!disabled && isDefined(onChange)) {
        onChange(file ?? undefined, name);
      }
    },
    [onChange, disabled, name],
  );

  return (
    <FileInput
      data-testid="file-input"
      {...props}
      clearButtonProps={{title: _('Clear input')}}
      clearable={true}
      disabled={disabled}
      label={title}
      name={name}
      styles={{root: {flexGrow: grow}}}
      value={value ?? null}
      onChange={handleChange}
    />
  );
};

export default FileField;
