/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file gsad_settings.c
 * @brief Global settings for GSA
 */

#include "gsad_settings.h"

/**
 * @brief Version from vendor, or NULL.
 */
gchar *vendor_version = NULL;

/**
 * @brief Guest username.
 */
gchar *guest_username = NULL;

/**
 * @brief Guest password.
 */
gchar *guest_password = NULL;

/**
 * @brief Maximum number of minutes of user idle time.
 */
int session_timeout;

/**
 * @brief Current value for HTTP header "X-Frame-Options"
 */
const gchar *http_x_frame_options;

/**
 * @brief Current value for HTTP header "Content-Security-Policy"
 */
const gchar *http_content_security_policy;

/**
 * @brief Current guest chart specific value for HTTP header "X-Frame-Options"
 */
const gchar *http_guest_chart_x_frame_options;

/**
 * @brief Current guest chart value for HTTP header "Content-Security-Policy"
 */
const gchar *http_guest_chart_content_security_policy;

/**
 * @brief Current value of for HTTP header "Strict-Transport-Security"
 */
const gchar *http_strict_transport_security;

/**
 * @brief Current value of for HTTP header "Access-Control-Allow-Origin"
 */
const gchar *http_cors_origin;

/**
 * @brief Current preference for using X_Real_IP from HTTP header
 */
gboolean ignore_http_x_real_ip;

/**
 * @brief Current maximum number of connection per IP address.
 */
int per_ip_connection_limit;

/**
 * @brief Unix socket to listen on.
 */
int unix_socket = 0;

/**
 * @brief Whether to use a secure cookie.
 *
 * This is always true when using HTTPS.
 */
int use_secure_cookie = 1;

/**
 * @brief Set the vendor version.
 *
 * @param[in]  version  Vendor version.
 */
void
vendor_version_set (const gchar *version)
{
  g_free (vendor_version);
  vendor_version = g_strdup (version);
}

/**
 * @brief Get the vendor version.
 *
 * @return Vendor version.
 */
const gchar *
vendor_version_get ()
{
  return vendor_version ? vendor_version : "";
}

void
set_guest_username (const gchar *username)
{
  guest_username = g_strdup (username);
}

const gchar *
get_guest_username ()
{
  return guest_username;
}

void
set_guest_password (const gchar *password)
{
  guest_password = g_strdup (password);
}

const gchar *
get_guest_password ()
{
  return guest_password;
}

void
set_session_timeout (int timeout)
{
  session_timeout = timeout;
}

int
get_session_timeout ()
{
  return session_timeout;
}

void
set_use_secure_cookie (int secure)
{
  use_secure_cookie = secure;
}

gboolean
is_use_secure_cookie ()
{
  return use_secure_cookie;
}

void
set_http_content_security_policy (const gchar *policy)
{
  http_content_security_policy = policy;
}

const gchar *
get_http_content_security_policy ()
{
  return http_content_security_policy;
}

void
set_http_x_frame_options (const gchar *options)
{
  http_x_frame_options = options;
}

const gchar *
get_http_x_frame_options ()
{
  return http_x_frame_options;
}

void
set_http_cors_origin (const gchar *origin)
{
  http_cors_origin = origin;
}

const gchar *
get_http_cors_origin ()
{
  return http_cors_origin;
}

void
set_http_guest_chart_x_frame_options (const gchar *options)
{
  http_guest_chart_x_frame_options = options;
}

const gchar *
get_http_guest_chart_x_frame_options ()
{
  return http_guest_chart_x_frame_options;
}

void
set_http_guest_chart_content_security_policy (const gchar *policy)
{
  http_guest_chart_content_security_policy = policy;
}

const gchar *
get_http_guest_chart_content_security_policy ()
{
  return http_guest_chart_content_security_policy;
}

void
set_http_strict_transport_security (const gchar *policy)
{
  http_strict_transport_security = policy;
}

const gchar *
get_http_strict_transport_security ()
{
  return http_strict_transport_security;
}

void
set_ignore_http_x_real_ip (gboolean ignore)
{
  ignore_http_x_real_ip = ignore;
}

gboolean
is_ignore_http_x_real_ip ()
{
  return ignore_http_x_real_ip;
}

void
set_per_ip_connection_limit (int limit)
{
  if (limit >= 0)
    per_ip_connection_limit = limit;
  else
    per_ip_connection_limit = 0;
}

int
get_per_ip_connection_limit ()
{
  return per_ip_connection_limit;
}

void
set_unix_socket (int socket)
{
  unix_socket = socket;
}

gboolean
is_unix_socket ()
{
  return unix_socket > 0;
}
