/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import Image from 'web/components/img/Image';
import Cpe from 'web/utils/Cpe';

interface CpeIconProps {
  name: string;
}

const CpeIcon = ({name}: CpeIconProps) => {
  const cpe = Cpe.find(name);

  const icon = isDefined(cpe) ? cpe.icon : 'cpe/other.svg';

  return <Image data-testid="cpe-icon" src={icon} width="16px" />;
};

export default CpeIcon;
