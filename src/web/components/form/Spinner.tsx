/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {forwardRef} from 'react';
import NumberField, {NumberFieldProps} from 'web/components/form/NumberField';

interface SpinnerProps
  extends Omit<
    NumberFieldProps,
    'fixedDecimalScale' | 'hideControls' | 'onChange'
  > {
  onChange: (value: number, name?: string) => void;
}

const Spinner = forwardRef<HTMLInputElement, SpinnerProps>(
  ({onChange, ...props}, ref) => (
    <NumberField
      {...props}
      ref={ref}
      allowEmpty={false}
      fixedDecimalScale={true}
      hideControls={false}
      /* @ts-expect-error */
      onChange={onChange}
    />
  ),
);
export default Spinner;
