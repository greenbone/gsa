/* Greenbone Security Assistant
 * $Id$
 * Description: Headers for GSA's OMP communication module.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@greenbone.net>
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

char * clone_omp (credentials_t *, params_t *);

char * create_report_omp (credentials_t *, params_t *);
char * create_task_omp (credentials_t *, params_t *);
char * delete_task_omp (credentials_t *, params_t *);
char * delete_trash_task_omp (credentials_t *, params_t *);
char * edit_task_omp (credentials_t *, params_t *);
char * new_task_omp (credentials_t *, params_t *);
char * save_task_omp (credentials_t *, params_t *);
char * save_container_task_omp (credentials_t *, params_t *);
char * pause_task_omp (credentials_t *, params_t *);
char * resume_paused_task_omp (credentials_t *, params_t *);
char * resume_stopped_task_omp (credentials_t *, params_t *);
char * start_task_omp (credentials_t *, params_t *);
char * stop_task_omp (credentials_t *, params_t *);

char * get_task_omp (credentials_t *, params_t *);
char * get_tasks_omp (credentials_t *, params_t *);
char * export_task_omp (credentials_t *, params_t *, enum content_type *,
                        char **, gsize *);
char * export_tasks_omp (credentials_t *, params_t *, enum content_type *,
                         char **, gsize *);

char * delete_report_omp (credentials_t *, params_t *);
char * get_report_omp (credentials_t *, params_t *, gsize *, gchar **, char **);

char * get_result_omp (credentials_t *, params_t *);

char * create_alert_omp (credentials_t *, params_t *);
char * delete_alert_omp (credentials_t *, params_t *);
char * delete_trash_alert_omp (credentials_t *, params_t *);
char * test_alert_omp (credentials_t *, params_t *);
char * get_alert_omp (credentials_t *, params_t *);
char * get_alerts_omp (credentials_t *, params_t *);

int export_lsc_credential_omp (credentials_t *, params_t *, gsize *, char **,
                               char **);
char * get_lsc_credential_omp (credentials_t *, params_t *);
char * get_lsc_credentials_omp (credentials_t *, params_t *);
char * create_lsc_credential_omp (credentials_t *, params_t *);
char * delete_lsc_credential_omp (credentials_t *, params_t *);
char * delete_trash_lsc_credential_omp (credentials_t *, params_t *);
char * edit_lsc_credential_omp (credentials_t *, params_t *);
char * save_lsc_credential_omp (credentials_t *, params_t *);

char * new_agent_omp (credentials_t *, params_t *);
char * get_agent_omp (credentials_t *, params_t *);
char * get_agents_omp (credentials_t *, params_t *);
int download_agent_omp (credentials_t *, params_t *, gsize *, char **, char **);
char * create_agent_omp (credentials_t *, params_t *);
char * delete_agent_omp (credentials_t *, params_t *);
char * delete_trash_agent_omp (credentials_t *, params_t *);
char * verify_agent_omp (credentials_t *, params_t *);
char * export_agent_omp (credentials_t *, params_t *, enum content_type *,
                            char **, gsize *);
char * export_agents_omp (credentials_t *, params_t *, enum content_type *,
                            char **, gsize *);


char * create_schedule_omp (credentials_t *, params_t *);
char * new_schedule_omp (credentials_t *, params_t *);
char * delete_schedule_omp (credentials_t *, params_t *);
char * delete_trash_schedule_omp (credentials_t *, params_t *);
char * edit_schedule_omp (credentials_t *, params_t *);
char * get_schedule_omp (credentials_t *, params_t *);
char * get_schedules_omp (credentials_t *, params_t *);
char * save_schedule_omp (credentials_t *, params_t *);
char * export_schedule_omp (credentials_t *, params_t *, enum content_type *,
                            char **, gsize *);
char * export_schedules_omp (credentials_t *, params_t *, enum content_type *,
                            char **, gsize *);

char * edit_target_omp (credentials_t *, params_t *);
char * get_target_omp (credentials_t *, params_t *);
char * get_targets_omp (credentials_t *, params_t *);
char * export_targets_omp (credentials_t *, params_t *, enum content_type *,
                           char **, gsize *);
char * export_target_omp (credentials_t *, params_t *, enum content_type *,
                          char **, gsize *);
char * create_target_omp (credentials_t *, params_t *);
char * delete_target_omp (credentials_t *, params_t *);
char * delete_trash_target_omp (credentials_t *, params_t *);
char * new_target_omp (credentials_t *, params_t *);
char * save_target_omp (credentials_t *, params_t *);

char * edit_config_omp (credentials_t *, params_t *);
char * get_config_omp (credentials_t *, params_t *);
char * get_configs_omp (credentials_t *, params_t *);
char * save_config_omp (credentials_t *, params_t *);
char * edit_config_family_omp (credentials_t *, params_t *);
char * get_config_family_omp (credentials_t *, params_t *);
char * save_config_family_omp (credentials_t *, params_t *);
char * edit_config_nvt_omp (credentials_t *, params_t *);
char * get_config_nvt_omp (credentials_t *, params_t *);
char * save_config_nvt_omp (credentials_t *, params_t *);
char * create_config_omp (credentials_t *, params_t *);
char * import_config_omp (credentials_t *, params_t *);
char * delete_config_omp (credentials_t *, params_t *);
char * delete_trash_config_omp (credentials_t *, params_t *);
char * export_config_omp (credentials_t *, params_t *, enum content_type*,
                          char **, gsize *);

char * export_preference_file_omp (credentials_t *, params_t *,
                                   enum content_type *, char **, gsize *);
char * export_report_format_omp (credentials_t *, params_t *,
                                 enum content_type *, char **, gsize *);
char * export_report_formats_omp (credentials_t *, params_t *, 
                                  enum content_type *, char **, gsize *);

char * get_notes_omp (credentials_t *, params_t *);
char * get_note_omp (credentials_t *, params_t *);
char * new_note_omp (credentials_t *, params_t *);
char * create_note_omp (credentials_t *, params_t *);
char * delete_note_omp (credentials_t *, params_t *);
char * delete_trash_note_omp (credentials_t *, params_t *);
char * edit_note_omp (credentials_t *, params_t *);
char * save_note_omp (credentials_t *, params_t *);
char * export_note_omp (credentials_t *, params_t *, enum content_type *,
                        char **, gsize *);
char * export_notes_omp (credentials_t *, params_t *, enum content_type *,
                         char **, gsize *);

char * create_port_list_omp (credentials_t *, params_t *);
char * create_port_range_omp (credentials_t *, params_t *);
char * get_port_list_omp (credentials_t *, params_t *);
char * get_port_lists_omp (credentials_t *, params_t *);
char * delete_port_list_omp (credentials_t *, params_t *);
char * delete_trash_port_list_omp (credentials_t *, params_t *);
char * delete_port_range_omp (credentials_t *, params_t *);
char * export_port_list_omp (credentials_t *, params_t *, enum content_type *,
                             char **, gsize *);
char * import_port_list_omp (credentials_t *, params_t *);

char * get_overrides_omp (credentials_t *, params_t *);
char * get_override_omp (credentials_t *, params_t *);
char * new_override_omp (credentials_t *, params_t *);
char * create_override_omp (credentials_t *, params_t *);
char * delete_override_omp (credentials_t *, params_t *);
char * delete_trash_override_omp (credentials_t *, params_t *);
char * edit_override_omp (credentials_t *, params_t *);
char * save_override_omp (credentials_t *, params_t *);
char * export_override_omp (credentials_t *, params_t *, enum content_type *,
                            char **, gsize *);
char * export_overrides_omp (credentials_t *, params_t *, enum content_type *,
                             char **, gsize *);

char * get_slave_omp (credentials_t *, params_t *);
char * get_slaves_omp (credentials_t *, params_t *);
char * create_slave_omp (credentials_t *, params_t *);
char * new_slave_omp (credentials_t *, params_t *);
char * save_slave_omp (credentials_t *, params_t *);
char * delete_slave_omp (credentials_t *, params_t *);
char * delete_trash_slave_omp (credentials_t *, params_t *);
char * edit_slave_omp (credentials_t *, params_t *);
char * export_slave_omp (credentials_t *, params_t *, enum content_type *,
                            char **, gsize *);
char * export_slaves_omp (credentials_t *, params_t *, enum content_type *,
                            char **, gsize *);

char * get_system_reports_omp (credentials_t *, params_t *);
char * get_system_report_omp (credentials_t *, const char *, const char *,
                              const char *, enum content_type*, char **,
                              gsize *);

char * get_report_format_omp (credentials_t *, params_t *);
char * get_report_formats_omp (credentials_t *, params_t *);
char * new_report_format_omp (credentials_t *, params_t *);
char * delete_report_format_omp (credentials_t *, params_t *);
char * delete_trash_report_format_omp (credentials_t *, params_t *);
char * edit_report_format_omp (credentials_t *, params_t *);
char * import_report_format_omp (credentials_t *, params_t *);
char * save_report_format_omp (credentials_t *, params_t *);
char * verify_report_format_omp (credentials_t *, params_t *);

char * create_filter_omp (credentials_t *, params_t *);
char * delete_filter_omp (credentials_t *, params_t *);
char * delete_trash_filter_omp (credentials_t *, params_t *);
char * edit_filter_omp (credentials_t *, params_t *);
char * export_filter_omp (credentials_t *, params_t *, enum content_type *,
                          char **, gsize *);
char * export_filters_omp (credentials_t *, params_t *, enum content_type *,
                           char **, gsize *);
char * get_filter_omp (credentials_t *, params_t *);
char * get_filters_omp (credentials_t *, params_t *);
char * new_filter_omp (credentials_t *, params_t *);
char * save_filter_omp (credentials_t *, params_t *);

char * run_wizard_omp (credentials_t *, params_t *);
char * wizard_omp (credentials_t *, params_t *);

char * get_trash_omp (credentials_t *, params_t *params);
char * restore_omp (credentials_t *, params_t *);
char * empty_trashcan_omp (credentials_t *, params_t *);

char * edit_my_settings_omp (credentials_t *, params_t *);
char * get_my_settings_omp (credentials_t *, params_t *);
char * save_my_settings_omp (credentials_t *, params_t *, char **, char **);

int authenticate_omp (const gchar *, const gchar *, gchar **, gchar **,
                      gchar **);

char * get_info_omp (credentials_t *, params_t *);
char * get_nvts_omp (credentials_t *, params_t *);
char * get_info (credentials_t *, params_t *, const char *);

#endif /* not _GSAD_OMP_H */
