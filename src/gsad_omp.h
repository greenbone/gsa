/* Greenbone Security Assistant
 * $Id$
 * Description: Headers for GSA's OMP communication module.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@intevation.de>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@intevation.de>
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
 * @file gsad_omp.h
 * @brief Headers for GSA's OMP communication module.
 */

#ifndef _GSAD_OMP_H
#define _GSAD_OMP_H

#include <glib.h> /* for gboolean */

#include "gsad_base.h" /* for credentials_t */

void omp_init (const gchar *, int);

char * create_task_omp (credentials_t *, char *, char *, char *, char *,
                        const char *, const char *, const char *);
char * delete_task_omp (credentials_t *, const char *, int, const char *);
char * edit_task_omp (credentials_t *, const char *, const char *, const char *,
                      const char *, const char *, int);
char * new_task_omp (credentials_t *, const char *, int);
char * save_task_omp (credentials_t *, const char *, const char *, const char *,
                      const char *, const char *, const char *, const char *,
                      const char *, const char *, int);
char * pause_task_omp (credentials_t *, const char *, int, const char *);
char * resume_paused_task_omp (credentials_t *, const char *, int, const char *);
char * resume_stopped_task_omp (credentials_t *, const char *, int, const char *);
char * start_task_omp (credentials_t *, const char *, int, const char *);
char * stop_task_omp (credentials_t *, const char *, int, const char *);

char * get_tasks_omp (credentials_t *, const char *, const char *,
                      const char *, const char*, int);

char * delete_report_omp (credentials_t *, const char *, const char *);
char * get_report_omp (credentials_t *, const char *, const char *,
                       gsize *, const unsigned int,
                       const unsigned int, const char *, const char *,
                       const char *, const char *, const char *, const char *,
                       const char *, const char *, gchar **, char **);

char * create_escalator_omp (credentials_t *, char *, char *, const char *,
                             GArray *, const char *, GArray *, const char *,
                             GArray *);
char * delete_escalator_omp (credentials_t *, const char *);
char * test_escalator_omp (credentials_t *, const char *, const char *,
                           const char *);
char * get_escalator_omp (credentials_t *, const char *, const char *,
                          const char *);
char * get_escalators_omp (credentials_t *, const char *, const char *);

char * get_lsc_credential_omp (credentials_t *, const char *, const char *,
                            const char *);
int get_lsc_credentials_omp (credentials_t *, const char *, const char *,
                             gsize *, const char *, const char *, char **,
                             char **);
char * create_lsc_credential_omp (credentials_t *, char *, char *,
                                  const char *, const char *, const char *);
char * delete_lsc_credential_omp (credentials_t *, const char *);

int get_agents_omp (credentials_t *, const char *, const char *,
                    gsize *, const char *, const char *, char **, char **);
char * create_agent_omp (credentials_t *, const char *, const char *,
                         const char *, int,
                         const char *,
                         const char *, int,
                         const char *, int,
                         const char *, int);
char * delete_agent_omp (credentials_t *, const char *);

char * create_schedule_omp (credentials_t *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *, const char *);

char * delete_schedule_omp (credentials_t *, const char *);
char * get_schedule_omp (credentials_t *, const char *, const char *,
                         const char *);
char * get_schedules_omp (credentials_t *, const char *, const char *);

char * get_target_omp (credentials_t *, const char *, const char *,
                       const char *);
char * get_targets_omp (credentials_t *, const char *, const char *);
char * create_target_omp (credentials_t *, char *, char *, char *,
                          const char *, const char*, const char*, const char*);
char * delete_target_omp (credentials_t *, const char *);

char * get_config_omp (credentials_t *, const char *, int);
char * get_configs_omp (credentials_t *, const char *, const char *);
char * save_config_omp (credentials_t *, const char *, const char *,
                        const char *, const char *, GArray *, GArray *,
                        GArray *, const char *);
char * get_config_family_omp (credentials_t *, const char *, const char *,
                              const char *, const char *, const char *, int);
char * save_config_family_omp (credentials_t *, const char *, const char *,
                               const char *, const char *, const char *,
                               GArray *);
char * get_config_nvt_omp (credentials_t *, const char *, const char *,
                           const char *, const char *, const char *,
                           const char *, int);
char * save_config_nvt_omp (credentials_t *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, GArray *, GArray *, GArray *,
                            const char *);
char * create_config_omp (credentials_t *, char *, char *, const char *);
char * import_config_omp (credentials_t *, char *);
char * delete_config_omp (credentials_t *, const char *);
char * export_config_omp (credentials_t *, const char *, enum content_type*,
                          char **, gsize *);

char * export_preference_file_omp (credentials_t *, const char *, const char *,
                                   const char *, enum content_type *, char **,
                                   gsize *);
char * export_report_format_omp (credentials_t *, const char *,
                                 enum content_type *, char **, gsize *);

char * get_notes_omp (credentials_t *);
char * get_note_omp (credentials_t *, const char *);
char * new_note_omp (credentials_t *, const char *, const char *, const char *,
                     const char *, const char *, const char *, const char *,
                     const char *, const char *, const char *, const char *,
                     const char *, const char *, const char *, const char *,
                     const char *, const char *, const char *);
char * create_note_omp (credentials_t *, const char *, const char *,
                        const char *, const char *, const char *, const char *,
                        const char *, const char *, const unsigned int,
                        const unsigned int, const char *, const char *,
                        const char *, const char *, const char *, const char *,
                        const char *, const char *);
char * delete_note_omp (credentials_t *, const char *, const char *,
                        const char *, const unsigned int, const unsigned int,
                        const char *, const char *, const char *, const char *,
                        const char *, const char *, const char *, const char *,
                        const char *, const char *);
char * edit_note_omp (credentials_t *, const char *, const char *,
                      const char *, const unsigned int, const unsigned int,
                      const char *, const char *, const char *, const char *,
                      const char *, const char *, const char *, const char *,
                      const char *, const char *);
char * save_note_omp (credentials_t *, const char *, const char *, const char *,
                      const char *, const char *, const char *, const char *,
                      const char *, const char *, const unsigned int,
                      const unsigned int, const char *, const char *,
                      const char *, const char *, const char *, const char *,
                      const char *, const char *, const char *, const char *);

char * get_overrides_omp (credentials_t *);
char * get_override_omp (credentials_t *, const char *);
char * new_override_omp (credentials_t *, const char *, const char *,
                         const char *, const char *, const char *, const char *,
                         const char *, const char *, const char *, const char *,
                         const char *, const char *, const char *, const char *,
                         const char *, const char *, const char *, const char *);
char * create_override_omp (credentials_t *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *,
                            const unsigned int, const unsigned int,
                            const char *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *);
char * delete_override_omp (credentials_t *, const char *, const char *,
                            const char *, const unsigned int,
                            const unsigned int, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *, const char *,
                            const char *, const char *);
char * edit_override_omp (credentials_t *, const char *, const char *,
                          const char *, const unsigned int, const unsigned int,
                          const char *, const char *, const char *,
                          const char *, const char *, const char *,
                          const char *, const char *, const char *,
                          const char *);
char * save_override_omp (credentials_t *, const char *, const char *,
                          const char *, const char *, const char *,
                          const char *, const char *, const char *,
                          const char *, const char *, const unsigned int,
                          const unsigned int, const char *, const char *,
                          const char *, const char *, const char *,
                          const char *, const char *, const char *,
                          const char *, const char *);

char * get_system_reports_omp (credentials_t *, const char *);
char * get_system_report_omp (credentials_t *, const char *, const char *,
                              enum content_type*, char **, gsize *);

char * get_report_format_omp (credentials_t *, const char *, const char *,
                              const char *);
char * get_report_formats_omp (credentials_t *, const char *, const char *);
char * delete_report_format_omp (credentials_t *, const char *);
char * import_report_format_omp (credentials_t *, char *);
char * verify_report_format_omp (credentials_t *, const char *);

gboolean is_omp_authenticated (gchar *, gchar *);

char * get_nvts_omp (credentials_t *, const char *);

#endif /* not _GSAD_OMP_H */
