/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {is_string} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import {withFolding, withFoldToggle} from '../folding/folding.js';

import Icon from '../icon/icon.js';
import FoldIcon from '../icon/foldicon.js';

import Layout, {withLayout} from '../layout/layout.js';

const FoldableLayout = withFolding(Layout);

const FoldLayout = glamorous(Layout)({
  marginLeft: '3px',
});

const Section = ({
    children,
    className,
    extra,
    foldable,
    foldState,
    img,
    title,
    onFoldToggle,
    onFoldStepEnd,
  }) => {

  return (
    <section className={className}>
      <SectionHeader
        img={img}
        title={title}>
        <Layout
          flex
          align={['space-between', 'center']}>
          {extra}
          {foldable &&
            <FoldLayout>
              <FoldIcon
                className="section-fold-icon"
                foldState={foldState}
                onClick={onFoldToggle}/>
            </FoldLayout>
          }
        </Layout>
      </SectionHeader>
      <FoldableLayout
        grow="1"
        foldState={foldState}
        onFoldStepEnd={onFoldStepEnd}>
        {children}
      </FoldableLayout>
    </section>
  );
};

Section.propTypes = {
  className: PropTypes.string,
  foldable: PropTypes.bool,
  foldState: PropTypes.string,
  img: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  title: PropTypes.string.isRequired,
  extra: PropTypes.element,
  onFoldToggle: PropTypes.func,
  onFoldStepEnd: PropTypes.func,
};

const HeaderLayout = glamorous(Layout)(
  'section-header',
  {
    margin: '10px 0px',
    borderBottom: '2px solid black',
    position: 'relative',
  },
);

const HeaderHeading = withLayout(glamorous.h2({
  margin: '0 0 1px 0',
}));

const HeaderIconLayout = glamorous(Layout)({
  marginRight: '5px',
});

export const SectionHeader = ({children, title, img}) => {
  return (
    <HeaderLayout
      flex
      align={['space-between', 'end']}
      className="section-header">
      <HeaderHeading flex align={['start', 'stretch']}>
        <HeaderIconLayout flex>
          {is_string(img) ?
            <Icon size="large" img={img}/> : img
          }
        </HeaderIconLayout>
        <Layout flex align={['start', 'end']}>
          {title}
        </Layout>
      </HeaderHeading>
      {children}
    </HeaderLayout>
  );
};

SectionHeader.propTypes = {
  img: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  title: PropTypes.string.isRequired,
};

export default withFoldToggle(Section);

// vim: set ts=2 sw=2 tw=80:
