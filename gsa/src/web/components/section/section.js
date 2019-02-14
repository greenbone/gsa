/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import {withFolding, withFoldToggle} from 'web/components/folding/folding';

import FoldIcon from 'web/components/icon/foldstateicon';

import Layout from 'web/components/layout/layout';

import SectionHeader from './header.js';

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
          grow="1"
          foldState={foldState}
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

// vim: set ts=2 sw=2 tw=80:
