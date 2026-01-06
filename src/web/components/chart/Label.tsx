/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {forwardRef} from 'react';
import Theme from 'web/utils/Theme';

type LabelProps = React.SVGProps<SVGTextElement>;

const Label = forwardRef<SVGElement, LabelProps>(
  (props: LabelProps, ref?: React.Ref<SVGElement>) => (
    <text
      ref={ref as React.Ref<SVGTextElement>}
      className="pie-label"
      dy=".33em"
      fill={Theme.dialogGray} // to have labels a bit visible on white background
      fontSize={Theme.Font.default}
      fontWeight="bold"
      textAnchor="middle"
      {...props}
    />
  ),
);

export default Label;
