/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Search as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const SearchIcon = withSvgIcon()(props => (
  <IconWithStrokeWidth
    {...props}
    IconComponent={Icon}
    data-testid="search-icon"
  />
));

export default SearchIcon;
