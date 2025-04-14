/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {forwardRef} from 'react';
import NumberField, {NumberFieldProps} from 'web/components/form/NumberField';

const Spinner = forwardRef<
  HTMLInputElement,
  Omit<NumberFieldProps, 'fixedDecimalScale' | 'hideControls'>
>((props, ref) => (
  <NumberField
    {...props}
    ref={ref}
    allowEmpty={false}
    fixedDecimalScale={true}
    hideControls={false}
  />
));
export default Spinner;
