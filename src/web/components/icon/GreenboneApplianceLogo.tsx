/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  DynamicIcon,
  type DynamicIconProps,
} from 'web/components/icon/DynamicIcon';

type ApplianceIconProps = Omit<DynamicIconProps, 'icon'>;

const LazyIconWrapper = ({
  importPath,
  testId,
  ...props
}: {
  importPath: () => Promise<{
    default: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
  testId: string;
} & ApplianceIconProps) => {
  const [Icon, setIcon] = React.useState<React.ComponentType<
    React.SVGProps<SVGSVGElement>
  > | null>(null);

  React.useEffect(() => {
    void importPath().then(module => {
      setIcon(() => module.default);
    });
  }, [importPath]);

  if (!Icon) {
    return <div>Loading...</div>;
  }

  return (
    <DynamicIcon
      dataTestId={testId}
      icon={Icon}
      size={['150px', '150px']}
      {...props}
    />
  );
};

const createEnterpriseComponent = (
  importPath: () => Promise<{
    default: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>,
  testId: string,
) => {
  return function EnterpriseComponent(props: ApplianceIconProps) {
    return (
      <LazyIconWrapper importPath={importPath} testId={testId} {...props} />
    );
  };
};

export const GreenboneWhiteLogo = createEnterpriseComponent(
  () => import('web/components/icon/svg/Greenbone_white_logo.svg?react'),
  'GreenboneWhiteLogo',
);
export const Enterprise150 = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_150.svg?react'),
  'Enterprise150',
);
export const Enterprise400 = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_400.svg?react'),
  'Enterprise400',
);
export const Enterprise450 = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_450.svg?react'),
  'Enterprise450',
);
export const Enterprise600 = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_600.svg?react'),
  'Enterprise600',
);
export const Enterprise650 = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_650.svg?react'),
  'Enterprise650',
);
export const Enterprise5400 = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_5400.svg?react'),
  'Enterprise5400',
);
export const Enterprise6500 = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_6500.svg?react'),
  'Enterprise6500',
);
export const EnterpriseCeno = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_CENO.svg?react'),
  'EnterpriseCeno',
);
export const EnterpriseDeca = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_DECA.svg?react'),
  'EnterpriseDeca',
);
export const EnterpriseExa = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_EXA.svg?react'),
  'EnterpriseExa',
);
export const EnterprisePeta = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_PETA.svg?react'),
  'EnterprisePeta',
);
export const EnterpriseTera = createEnterpriseComponent(
  () => import('web/components/icon/svg/Enterprise_TERA.svg?react'),
  'EnterpriseTera',
);
