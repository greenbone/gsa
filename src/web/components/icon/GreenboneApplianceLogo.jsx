/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SvgIconWrapper from './SvgIconWrapper';
import Enterprise150Svg from 'web/components/icon/svg/Enterprise_150.svg';
import Enterprise400Svg from 'web/components/icon/svg/Enterprise_400.svg';
import Enterprise450Svg from 'web/components/icon/svg/Enterprise_450.svg';
import Enterprise600Svg from 'web/components/icon/svg/Enterprise_600.svg';
import Enterprise650Svg from 'web/components/icon/svg/Enterprise_650.svg';
import Enterprise5400Svg from 'web/components/icon/svg/Enterprise_5400.svg';
import Enterprise6500Svg from 'web/components/icon/svg/Enterprise_6500.svg';
import EnterpriseCenoSvg from 'web/components/icon/svg/Enterprise_CENO.svg';
import EnterpriseDecaSvg from 'web/components/icon/svg/Enterprise_DECA.svg';
import EnterpriseExaSvg from 'web/components/icon/svg/Enterprise_EXA.svg';
import EnterprisePetaSvg from 'web/components/icon/svg/Enterprise_PETA.svg';
import EnterpriseTeraSvg from 'web/components/icon/svg/Enterprise_TERA.svg';

const createEnterpriseComponent = Component => () => (
  <SvgIconWrapper size={['150px', '150px']} component={Component} />
);

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
