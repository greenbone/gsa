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

import {is_string} from '../utils.js';

import Layout from './layout.js';
import PropTypes from './proptypes.js';
import {withFolding, withFoldToggle} from './folding.js';

import Icon from './icons/icon.js';
import FoldIcon from './icons/foldicon.js';

import './css/section.css';

const FoldableLayout = withFolding(Layout);

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
            <Layout>
              <FoldIcon
                className="section-fold-icon"
                foldState={foldState}
                onClick={onFoldToggle}/>
            </Layout>
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

export const SectionHeader = ({children, title, img}) => {
  return (
    <Layout
      flex
      align={['space-between', 'end']}
      className="section-header">
      <h2>
        {is_string(img) ?
          <Icon size="large" img={img}/> : img
        }
        {title}
      </h2>
      {children}
    </Layout>
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
