/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import PropTypes from 'web/utils/PropTypes';
import {get_img_url} from 'web/utils/Urls';

const Img = ({alt = '', src, ...other}) => {
  const img_path = get_img_url(src);
  return <img {...other} alt={alt} src={img_path} />;
};

Img.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string.isRequired,
};

export default Img;
