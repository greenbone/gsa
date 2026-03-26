/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {get_img_url} from 'web/utils/Urls';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const Image = ({alt = '', src, ...other}: ImageProps) => {
  const img_path = get_img_url(src);
  return <img {...other} alt={alt} src={img_path} />;
};

export default Image;
