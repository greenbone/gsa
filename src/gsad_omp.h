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
 * @file gsad_omp.h
 * @brief Headers for GSA's OMP communication module.
 */

#ifndef _GSAD_OMP_H
#define _GSAD_OMP_H

#include <glib.h> /* for gboolean */
#include <openvas/misc/openvas_server.h> /* for openvas_connection_t */

#include "gsad_base.h" /* for credentials_t */

void omp_init (const gchar *, const gchar *, int);

int manager_connect (credentials_t *, openvas_connection_t *,
                     cmd_response_data_t *);
char * logout (credentials_t *, const gchar *, cmd_response_data_t *);

void cmd_response_data_init (cmd_response_data_t*);
void cmd_response_data_reset (cmd_response_data_t*);

char * clone_omp (openvas_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t*);

char * create_report_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * upload_report_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * import_report_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * create_container_task_omp (openvas_connection_t *, credentials_t *,
                                  params_t *, cmd_response_data_t *);
char * create_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_trash_task_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * edit_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * new_container_task_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * new_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * save_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * save_container_task_omp (openvas_connection_t *, credentials_t *,
                                params_t *, cmd_response_data_t*);
char * resume_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * start_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * stop_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * move_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);

char * get_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * get_tasks_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * get_tasks_chart_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * export_task_omp (openvas_connection_t *, credentials_t *, params_t *,
                        enum content_type *, char **, gsize *,
                        cmd_response_data_t*);
char * export_tasks_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);

char * delete_report_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * get_report_omp (openvas_connection_t *, credentials_t *, params_t *,
                       gsize *, gchar **, char **, cmd_response_data_t*);
char * get_reports_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);

char * get_report_section_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);

char * download_ssl_cert (openvas_connection_t *, credentials_t *, params_t *,
                          gsize *, cmd_response_data_t*);
char * download_ca_pub (openvas_connection_t *, credentials_t *, params_t *,
                        gsize *, cmd_response_data_t*);
char * download_key_pub (openvas_connection_t *, credentials_t *, params_t *,
                         gsize *, cmd_response_data_t*);

char * export_result_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type *, char **, gsize *,
                          cmd_response_data_t*);
char * export_results_omp (openvas_connection_t *, credentials_t *, params_t *,
                           enum content_type *, char **, gsize *,
                           cmd_response_data_t*);
char * get_result_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * get_results_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);

char * new_alert_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * create_alert_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_alert_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_trash_alert_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * test_alert_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * get_alert_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * edit_alert_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * save_alert_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * get_alerts_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * export_alert_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);
char * export_alerts_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type *, char **, gsize *,
                          cmd_response_data_t*);

int download_credential_omp (openvas_connection_t *, credentials_t *,
                             params_t *, gsize *, char **, char **,
                             cmd_response_data_t*);

char * export_credential_omp (openvas_connection_t *, credentials_t *,
                              params_t *, enum content_type *, char **, gsize *,
                              cmd_response_data_t*);
char * export_credentials_omp (openvas_connection_t *, credentials_t *,
                               params_t *, enum content_type *, char **,
                               gsize *, cmd_response_data_t*);
char * get_credential_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * get_credentials_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * new_credential_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * create_credential_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * delete_credential_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * delete_trash_credential_omp (openvas_connection_t *, credentials_t *,
                                    params_t *, cmd_response_data_t*);
char * edit_credential_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * save_credential_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);

char * new_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * get_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * get_agents_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
int download_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                        gsize *, char **, char **, cmd_response_data_t*);
char * edit_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * save_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * create_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_trash_agent_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * verify_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * export_agent_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);
char * export_agents_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type *, char **, gsize *,
                          cmd_response_data_t*);

char * get_aggregate_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);

char * create_scanner_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * new_scanner_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * get_scanner_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * get_scanners_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * save_scanner_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_scanner_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * delete_trash_scanner_omp (openvas_connection_t *, credentials_t *,
                                 params_t *, cmd_response_data_t*);
char * edit_scanner_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * export_scanner_omp (openvas_connection_t *, credentials_t *, params_t *,
                           enum content_type *, char **, gsize *,
                           cmd_response_data_t*);
char * export_scanners_omp (openvas_connection_t *, credentials_t *, params_t *,
                            enum content_type *, char **, gsize *,
                            cmd_response_data_t*);
char * verify_scanner_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);

char * create_schedule_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * new_schedule_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_schedule_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * delete_trash_schedule_omp (openvas_connection_t *, credentials_t *,
                                  params_t *, cmd_response_data_t*);
char * edit_schedule_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * get_schedule_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * get_schedules_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * save_schedule_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * export_schedule_omp (openvas_connection_t *, credentials_t *, params_t *,
                            enum content_type *, char **, gsize *,
                            cmd_response_data_t*);
char * export_schedules_omp (openvas_connection_t *, credentials_t *,
                             params_t *, enum content_type *, char **, gsize *,
                             cmd_response_data_t*);

char * create_tag_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * delete_tag_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * delete_trash_tag_omp (openvas_connection_t *, credentials_t *,
                             params_t *, cmd_response_data_t*);
char * edit_tag_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * export_tags_omp (openvas_connection_t *, credentials_t *, params_t *,
                        enum content_type *, char **, gsize *,
                        cmd_response_data_t*);
char * export_tag_omp (openvas_connection_t *, credentials_t *, params_t *,
                       enum content_type *, char **, gsize *,
                       cmd_response_data_t*);
char * get_tag_omp (openvas_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t*);
char * get_tags_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * new_tag_omp (openvas_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t*);
char * save_tag_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * toggle_tag_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);

char * edit_target_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * get_target_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * get_targets_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * export_targets_omp (openvas_connection_t *, credentials_t *, params_t *,
                           enum content_type *, char **, gsize *,
                           cmd_response_data_t*);
char * export_target_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type *, char **, gsize *,
                          cmd_response_data_t*);
char * create_target_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * delete_target_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * delete_trash_target_omp (openvas_connection_t *, credentials_t *,
                                params_t *, cmd_response_data_t*);
char * new_target_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * save_target_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);

char * edit_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * get_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * get_configs_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * new_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * upload_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * save_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * edit_config_family_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * get_config_family_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * save_config_family_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * edit_config_nvt_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * get_config_nvt_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * save_config_nvt_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * create_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * import_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * delete_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * delete_trash_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                                cmd_response_data_t*);
char * sync_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * export_config_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type*, char **, gsize *,
                          cmd_response_data_t*);
char * export_configs_omp (openvas_connection_t *, credentials_t *, params_t *,
                           enum content_type *, char **, gsize *,
                           cmd_response_data_t*);

char * export_preference_file_omp (openvas_connection_t *, credentials_t *,
                                   params_t *, enum content_type *, char **,
                                   gsize *, cmd_response_data_t*);
char * export_report_format_omp (openvas_connection_t *, credentials_t *,
                                 params_t *, enum content_type *, char **,
                                 gsize *, cmd_response_data_t*);
char * export_report_formats_omp (openvas_connection_t *, credentials_t *,
                                  params_t *, enum content_type *, char **,
                                  gsize *, cmd_response_data_t*);

char * create_group_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_group_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_trash_group_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * edit_group_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * export_group_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);
char * export_groups_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type *, char **, gsize *,
                          cmd_response_data_t*);
char * get_group_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * get_groups_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * new_group_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * save_group_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);

char * get_notes_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * get_note_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * new_note_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * create_note_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_note_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_trash_note_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * edit_note_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * save_note_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * export_note_omp (openvas_connection_t *, credentials_t *, params_t *,
                        enum content_type *, char **, gsize *,
                        cmd_response_data_t*);
char * export_notes_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);

char * create_permission_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * create_permissions_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * delete_permission_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * delete_trash_permission_omp (openvas_connection_t *, credentials_t *,
                                    params_t *, cmd_response_data_t*);
char * edit_permission_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * export_permission_omp (openvas_connection_t *, credentials_t *,
                              params_t *, enum content_type *, char **, gsize *,
                              cmd_response_data_t*);
char * export_permissions_omp (openvas_connection_t *, credentials_t *,
                               params_t *, enum content_type *, char **,
                               gsize *, cmd_response_data_t*);
char * get_permission_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * get_permissions_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * new_permission_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * new_permissions_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * save_permission_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);

char * create_port_list_omp (openvas_connection_t *, credentials_t *,
                             params_t *, cmd_response_data_t*);
char * create_port_range_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * new_port_list_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * new_port_range_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * upload_port_list_omp (openvas_connection_t *, credentials_t *,
                             params_t *, cmd_response_data_t*);
char * get_port_list_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * edit_port_list_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * save_port_list_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * get_port_lists_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);
char * delete_port_list_omp (openvas_connection_t *, credentials_t *,
                             params_t *, cmd_response_data_t*);
char * delete_trash_port_list_omp (openvas_connection_t *, credentials_t *,
                                   params_t *, cmd_response_data_t*);
char * delete_port_range_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * export_port_list_omp (openvas_connection_t *, credentials_t *,
                             params_t *, enum content_type *, char **, gsize *,
                             cmd_response_data_t*);
char * export_port_lists_omp (openvas_connection_t *, credentials_t *,
                              params_t *, enum content_type *, char **, gsize *,
                              cmd_response_data_t*);
char * import_port_list_omp (openvas_connection_t *, credentials_t *,
                             params_t *, cmd_response_data_t*);

char * create_role_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_role_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_trash_role_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * edit_role_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * export_role_omp (openvas_connection_t *, credentials_t *, params_t *,
                        enum content_type *, char **, gsize *,
                        cmd_response_data_t*);
char * export_roles_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);
char * get_role_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * get_roles_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * new_role_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * save_role_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);

char * get_overrides_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * get_override_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * new_override_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * create_override_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * delete_override_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * delete_trash_override_omp (openvas_connection_t *, credentials_t *,
                                  params_t *, cmd_response_data_t*);
char * edit_override_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * save_override_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * export_override_omp (openvas_connection_t *, credentials_t *, params_t *,
                            enum content_type *, char **, gsize *,
                            cmd_response_data_t*);
char * export_overrides_omp (openvas_connection_t *, credentials_t *,
                             params_t *, enum content_type *, char **, gsize *,
                             cmd_response_data_t*);

char * get_slave_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * get_slaves_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * create_slave_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * new_slave_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * save_slave_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * delete_slave_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * delete_trash_slave_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * edit_slave_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * export_slave_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);
char * export_slaves_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type *, char **, gsize *,
                          cmd_response_data_t*);

char * get_system_reports_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * get_system_report_omp (openvas_connection_t *, credentials_t *,
                              const char *, params_t *, enum content_type*,
                              gsize *, cmd_response_data_t*);

char * get_report_format_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * get_report_formats_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * new_report_format_omp (openvas_connection_t *, credentials_t *,
                              params_t *, cmd_response_data_t*);
char * delete_report_format_omp (openvas_connection_t *, credentials_t *,
                                 params_t *, cmd_response_data_t*);
char * delete_trash_report_format_omp (openvas_connection_t *, credentials_t *,
                                       params_t *, cmd_response_data_t*);
char * edit_report_format_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * import_report_format_omp (openvas_connection_t *, credentials_t *,
                                 params_t *, cmd_response_data_t*);
char * save_report_format_omp (openvas_connection_t *, credentials_t *,
                               params_t *, cmd_response_data_t*);
char * verify_report_format_omp (openvas_connection_t *, credentials_t *,
                                 params_t *, cmd_response_data_t*);

char * get_feeds_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * sync_feed_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * sync_scap_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * sync_cert_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);

char * create_filter_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * delete_filter_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);
char * delete_trash_filter_omp (openvas_connection_t *, credentials_t *,
                                params_t *, cmd_response_data_t*);
char * edit_filter_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * export_filter_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type *, char **, gsize *,
                          cmd_response_data_t*);
char * export_filters_omp (openvas_connection_t *, credentials_t *, params_t *,
                           enum content_type *, char **, gsize *,
                           cmd_response_data_t*);
char * get_filter_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * get_filters_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * new_filter_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * save_filter_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);

char * create_user_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_user_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_user_confirm_omp (openvas_connection_t *, credentials_t *,
                                params_t *, cmd_response_data_t*);
char * edit_user_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * export_user_omp (openvas_connection_t *, credentials_t *, params_t *,
                        enum content_type *, char **, gsize *,
                        cmd_response_data_t*);
char * export_users_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);
char * get_user_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * get_users_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * new_user_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * save_user_omp (openvas_connection_t *, credentials_t *, params_t *,
                      char **, char **, int*, cmd_response_data_t*);
char * save_auth_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * save_chart_preference_omp (openvas_connection_t *, credentials_t *,
                                  params_t *, gchar **, gchar **,
                                  cmd_response_data_t*);
char * auth_settings_omp (openvas_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t*);

char * process_bulk_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);
char * bulk_delete_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);

char * run_wizard_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * wizard_omp (openvas_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t*);
char * wizard_get_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);

char * cvss_calculator (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * dashboard (openvas_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t*);

char * get_trash_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * restore_omp (openvas_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t*);
char * empty_trashcan_omp (openvas_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t*);

char * get_protocol_doc_omp (openvas_connection_t *, credentials_t *,
                             params_t *, cmd_response_data_t*);
char * export_omp_doc_omp (openvas_connection_t *, credentials_t *, params_t *,
                           enum content_type *, char **, gsize *,
                           cmd_response_data_t*);

char * edit_my_settings_omp (openvas_connection_t *, credentials_t *,
                             params_t *, cmd_response_data_t*);
char * get_my_settings_omp (openvas_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t*);
char * save_my_settings_omp (openvas_connection_t *, credentials_t *,
                             params_t *, const char *, char **, char **,
                             char **, char **, cmd_response_data_t*);

int authenticate_omp (const gchar *, const gchar *, gchar **, gchar **,
                      gchar **, gchar **, gchar **, gchar **, GTree **,
                      gchar **);

char * get_info_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * get_nvts_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * get_info (openvas_connection_t*, credentials_t *, params_t *,
                 const char *, cmd_response_data_t*);

char * new_host_omp (openvas_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t*);
char * create_asset_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * create_host_omp (openvas_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t*);
char * delete_asset_omp (openvas_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t*);
char * edit_asset_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * save_asset_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * get_assets_omp (openvas_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t*);
char * get_asset_omp (openvas_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t*);
char * export_asset_omp (openvas_connection_t *, credentials_t *, params_t *,
                         enum content_type *, char **, gsize *,
                         cmd_response_data_t*);
char * export_assets_omp (openvas_connection_t *, credentials_t *, params_t *,
                          enum content_type *, char **, gsize *,
                          cmd_response_data_t*);
char * get_assets_chart_omp (openvas_connection_t *, credentials_t *,
                             params_t *, cmd_response_data_t*);

#endif /* not _GSAD_OMP_H */
