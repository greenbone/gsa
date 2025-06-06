/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {FileInput} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';

interface FileFieldProps
  extends React.ComponentPropsWithoutRef<typeof FileInput> {
  disabled?: boolean;
  grow?: number | string;
  name?: string;
  title?: string;
  onChange?: (file: File, name?: string) => void;
}

const FileField = ({
  disabled,
  grow,
  name,
  title,
  onChange,
  ...props
}: FileFieldProps) => {
  const handleChange = useCallback(
    (file: File) => {
      if (!disabled && isDefined(onChange)) {
        onChange(file, name);
      }
    },
    [onChange, disabled, name],
  );

  return (
    <FileInput
      data-testid="file-input"
      {...props}
      disabled={disabled}
      label={title}
      name={name}
      styles={{root: {flexGrow: grow}}}
      onChange={handleChange}
    />
  );
};

export default FileField;
