/* Greenbone Security Assistant
 * $Id$
 * Description: A printf like macro for tracing.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2009 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * or, at your option, any later version as published by the Free
 * Software Foundation
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
 * @file tracef.h
 * @brief A printf like macro for tracing.
 */

#ifndef GSAD_TRACE_H
#define GSAD_TRACE_H

/**
 * @brief GLib log domain.
 *
 * Libraries can override this by setting it after including tracef.h.
 */
#undef G_LOG_DOMAIN
#define G_LOG_DOMAIN "gsad main"

#include <strings.h>
#include <glib.h>

/**
 * @brief Flag with all Glib log levels.
 */
#define ALL_LOG_LEVELS  (G_LOG_LEVEL_MASK       \
                         | G_LOG_FLAG_FATAL     \
                         | G_LOG_FLAG_RECURSION)

/**
 * @brief Trace text flag.
 *
 * 0 to turn off echoing of actual data transfered (requires TRACE).
 */
#define TRACE_TEXT 1

/**
 * @brief Verbose output flag.
 */
extern int verbose;

/**
 * @brief Logging parameters, as passed to setup_log_handlers.
 */
extern GSList *log_config;

#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>

/**
 * @brief Formatted trace output.
 *
 * Print the printf style \a args to stderr, preceded by the process ID.
 */
#define tracef(args...)                                          \
  do {                                                           \
    if (verbose)                                                 \
      {                                                          \
        gchar* iso = g_strdup_printf (args);                     \
        g_log (G_LOG_DOMAIN, G_LOG_LEVEL_DEBUG, "%s", iso);      \
        g_free (iso);                                            \
      }                                                          \
  } while (0)

#endif
