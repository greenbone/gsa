/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import {
  withFolding,
  withFoldToggle,
  FoldState,
} from 'web/components/folding/Folding';
import FoldStateIcon from 'web/components/icon/FoldStateIcon';
import Layout from 'web/components/layout/Layout';
import SectionHeader from 'web/components/section/Header';

interface SectionProps {
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
  extra?: React.ReactNode;
  foldable?: boolean;
  header?: React.ReactNode;
  img?: React.ReactNode;
  title?: string;
}

interface SectionPropsWithFoldToggle extends SectionProps {
  foldState: keyof typeof FoldState;
  onFoldToggle: () => void;
  onFoldStepEnd: () => void;
}

const FoldableLayout = withFolding(Layout);

const FoldLayout = styled(Layout)`
  margin-left: 3px;
  margin-top: -2px;
`;

const Section = ({
  children,
  className,
  extra,
  foldable,
  foldState,
  header,
  img,
  title,
  ['data-testid']: dataTestId,
  onFoldToggle,
  onFoldStepEnd,
}: SectionPropsWithFoldToggle) => {
  if (!isDefined(header)) {
    header = (
      <SectionHeader img={img} title={title}>
        <Layout flex align={['space-between', 'center']}>
          {extra}
          {foldable && (
            <FoldLayout>
              <FoldStateIcon
                className="section-fold-icon"
                foldState={foldState}
                onClick={onFoldToggle}
              />
            </FoldLayout>
          )}
        </Layout>
      </SectionHeader>
    );
  }
  return (
    <section className={className} data-testid={dataTestId}>
      {header}
      {foldable ? (
        <FoldableLayout
          foldState={foldState}
          grow="1"
          onFoldStepEnd={onFoldStepEnd}
        >
          {children}
        </FoldableLayout>
      ) : (
        children
      )}
    </section>
  );
};

export default withFoldToggle(Section) as React.ComponentType<SectionProps>;
