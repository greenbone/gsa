/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {forwardRef} from 'react';
import NumberField from 'web/components/form/NumberField';

const Spinner = forwardRef((props, ref) => {
  return <NumberField {...props} ref={ref} hideControls={false} />;
});
export default Spinner;
