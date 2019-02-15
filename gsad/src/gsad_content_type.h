/* Copyright (C) 2016-2018 Greenbone Networks GmbH
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

/**
 * @file gsad_content_type.h
 * @brief Headers for content type
 */

#ifndef _GSAD_CONTENT_TYPE_H
#define _GSAD_CONTENT_TYPE_H

/**
 * @brief Content types.
 */
enum content_type
{
  GSAD_CONTENT_TYPE_APP_DEB,
  GSAD_CONTENT_TYPE_APP_EXE,
  GSAD_CONTENT_TYPE_APP_XHTML,
  GSAD_CONTENT_TYPE_APP_KEY,
  GSAD_CONTENT_TYPE_APP_NBE,
  GSAD_CONTENT_TYPE_APP_PDF,
  GSAD_CONTENT_TYPE_APP_RPM,
  GSAD_CONTENT_TYPE_APP_XML,
  GSAD_CONTENT_TYPE_DONE,   ///< Special marker.
  GSAD_CONTENT_TYPE_STRING, ///< Special marker for using content type string.
  GSAD_CONTENT_TYPE_IMAGE_PNG,
  GSAD_CONTENT_TYPE_TEXT_CSS,
  GSAD_CONTENT_TYPE_TEXT_HTML,
  GSAD_CONTENT_TYPE_TEXT_JS,
  GSAD_CONTENT_TYPE_TEXT_PLAIN,
  GSAD_CONTENT_TYPE_OCTET_STREAM,
  GSAD_CONTENT_TYPE_IMAGE_SVG,
  GSAD_CONTENT_TYPE_IMAGE_GIF,
  GSAD_CONTENT_TYPE_APP_JSON,
};

typedef enum content_type content_type_t;

#endif /* _GSAD_CONTENT_TYPE_H */
