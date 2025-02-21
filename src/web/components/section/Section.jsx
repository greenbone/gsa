/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import {withFolding, withFoldToggle} from 'web/components/folding/Folding';
import FoldIcon from 'web/components/icon/FoldStateIcon';
import Layout from 'web/components/layout/Layout';
import SectionHeader from 'web/components/section/Header';
import PropTypes from 'web/utils/PropTypes';


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
  onFoldToggle,
  onFoldStepEnd,
}) => {
  if (!isDefined(header)) {
    header = (
      <SectionHeader img={img} title={title}>
        <Layout flex align={['space-between', 'center']}>
          {extra}
          {foldable && (
            <FoldLayout>
              <FoldIcon
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
    <section className={className}>
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

Section.propTypes = {
  className: PropTypes.string,
  extra: PropTypes.element,
  foldState: PropTypes.string,
  foldable: PropTypes.bool,
  header: PropTypes.element,
  img: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  title: PropTypes.string,
  onFoldStepEnd: PropTypes.func,
  onFoldToggle: PropTypes.func,
};

export default withFoldToggle(Section);
