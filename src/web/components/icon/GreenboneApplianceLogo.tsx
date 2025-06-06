/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {FC} from 'react';
import {DynamicIcon, DynamicIconProps} from 'web/components/icon/DynamicIcon';
import Enterprise150Svg from 'web/components/icon/svg/Enterprise_150.svg?react';
import Enterprise400Svg from 'web/components/icon/svg/Enterprise_400.svg?react';
import Enterprise450Svg from 'web/components/icon/svg/Enterprise_450.svg?react';
import Enterprise5400Svg from 'web/components/icon/svg/Enterprise_5400.svg?react';
import Enterprise600Svg from 'web/components/icon/svg/Enterprise_600.svg?react';
import Enterprise650Svg from 'web/components/icon/svg/Enterprise_650.svg?react';
import Enterprise6500Svg from 'web/components/icon/svg/Enterprise_6500.svg?react';
import EnterpriseCenoSvg from 'web/components/icon/svg/Enterprise_CENO.svg?react';
import EnterpriseDecaSvg from 'web/components/icon/svg/Enterprise_DECA.svg?react';
import EnterpriseExaSvg from 'web/components/icon/svg/Enterprise_EXA.svg?react';
import EnterprisePetaSvg from 'web/components/icon/svg/Enterprise_PETA.svg?react';
import EnterpriseTeraSvg from 'web/components/icon/svg/Enterprise_TERA.svg?react';

type ApplianceIconProps = Omit<DynamicIconProps, 'icon'>;

const createEnterpriseComponent =
  (
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  ): FC<ApplianceIconProps> =>
  props => <DynamicIcon icon={Icon} size={['150px', '150px']} {...props} />;

export const Enterprise150 = createEnterpriseComponent(Enterprise150Svg);
export const Enterprise400 = createEnterpriseComponent(Enterprise400Svg);
export const Enterprise450 = createEnterpriseComponent(Enterprise450Svg);
export const Enterprise600 = createEnterpriseComponent(Enterprise600Svg);
export const Enterprise650 = createEnterpriseComponent(Enterprise650Svg);
export const Enterprise5400 = createEnterpriseComponent(Enterprise5400Svg);
export const Enterprise6500 = createEnterpriseComponent(Enterprise6500Svg);
export const EnterpriseCeno = createEnterpriseComponent(EnterpriseCenoSvg);
export const EnterpriseDeca = createEnterpriseComponent(EnterpriseDecaSvg);
export const EnterpriseExa = createEnterpriseComponent(EnterpriseExaSvg);
export const EnterprisePeta = createEnterpriseComponent(EnterprisePetaSvg);
export const EnterpriseTera = createEnterpriseComponent(EnterpriseTeraSvg);
