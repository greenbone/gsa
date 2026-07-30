/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getImageURL} from 'web/utils/image-url';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const Image = ({alt = '', src, ...other}: ImageProps) => {
  const imgURL = getImageURL(src);
  return <img {...other} alt={alt} src={imgURL} />;
};

export default Image;
