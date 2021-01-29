/* Copyright (C) 2009-2021 Greenbone Networks GmbH
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
 * @file gsad_gmp.h
 * @brief Headers for GSA's GMP communication module.
 */

#ifndef _GSAD_GMP_H
#define _GSAD_GMP_H

#include "gsad_cmd.h"          /* for cmd_response_data_t */
#include "gsad_content_type.h" /* for content_type */
#include "gsad_http.h"         /* for http_connection_t */
#include "gsad_user.h"         /* for credentials_t */

#include <glib.h>                 /* for gboolean */
#include <gvm/util/serverutils.h> /* for gvm_connection_t */

void
gmp_init (const gchar *, const gchar *, int);

int
manager_connect (credentials_t *, gvm_connection_t *, cmd_response_data_t *);

char *
clone_gmp (gvm_connection_t *, credentials_t *, params_t *,
           cmd_response_data_t *);

char *
create_report_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
create_container_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t *);
char *
create_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
delete_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
save_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
save_container_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t *);
char *
resume_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
start_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
stop_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
move_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);

char *
get_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
              cmd_response_data_t *);
char *
get_tasks_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
get_tasks_chart_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
export_task_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
export_tasks_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);

char *
delete_report_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
get_report_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_reports_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);

char *
report_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);

char *
download_ssl_cert (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
download_ca_pub (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
download_key_pub (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);

char *
export_result_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
export_results_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
get_result_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_results_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);

char *
new_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
create_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
delete_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
test_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
edit_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
save_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_alerts_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
export_alert_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
export_alerts_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);

int
download_credential_gmp (gvm_connection_t *, credentials_t *, params_t *,
                         char **, char **, cmd_response_data_t *);

char *
export_credential_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
export_credentials_gmp (gvm_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t *);
char *
get_credential_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
get_credentials_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
create_credential_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
delete_credential_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
save_credential_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);

char *
get_aggregate_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);

char *
create_scanner_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
get_scanner_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
get_scanners_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
save_scanner_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
delete_scanner_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
export_scanner_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
export_scanners_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
verify_scanner_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);

char *
create_schedule_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
delete_schedule_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
get_schedule_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
get_schedules_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
save_schedule_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
export_schedule_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
export_schedules_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);

char *
create_tag_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
create_tags_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
delete_tag_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
export_tags_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
export_tag_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_tag_gmp (gvm_connection_t *, credentials_t *, params_t *,
             cmd_response_data_t *);
char *
get_tags_gmp (gvm_connection_t *, credentials_t *, params_t *,
              cmd_response_data_t *);
char *
save_tag_gmp (gvm_connection_t *, credentials_t *, params_t *,
              cmd_response_data_t *);
char *
toggle_tag_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);

char *
get_target_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_targets_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
export_targets_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
export_target_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
create_target_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
delete_target_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
save_target_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);

char *
get_config_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_configs_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
save_config_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
edit_config_family_gmp (gvm_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t *);
char *
get_config_family_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
save_config_family_gmp (gvm_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t *);
char *
get_config_nvt_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
save_config_nvt_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
create_config_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
import_config_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
delete_config_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
export_config_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
export_configs_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);

char *
export_preference_file_gmp (gvm_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t *);
char *
export_report_format_gmp (gvm_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t *);
char *
export_report_formats_gmp (gvm_connection_t *, credentials_t *, params_t *,
                           cmd_response_data_t *);

char *
create_group_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
delete_group_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
export_group_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
export_groups_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
get_group_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
get_groups_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
save_group_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);

char *
get_notes_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
get_note_gmp (gvm_connection_t *, credentials_t *, params_t *,
              cmd_response_data_t *);
char *
create_note_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
delete_note_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
save_note_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
export_note_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
export_notes_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);

char *
get_nvt_families_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);

char *
create_permission_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
create_permissions_gmp (gvm_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t *);
char *
delete_permission_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
export_permission_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
export_permissions_gmp (gvm_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t *);
char *
get_permission_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
get_permissions_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
save_permission_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
create_port_list_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);
char *
create_port_range_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
get_port_list_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
save_port_list_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
get_port_lists_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
delete_port_list_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);
char *
delete_port_range_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
export_port_list_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);
char *
export_port_lists_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
import_port_list_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);

char *
create_role_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
delete_role_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
export_role_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
export_roles_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
get_role_gmp (gvm_connection_t *, credentials_t *, params_t *,
              cmd_response_data_t *);
char *
get_roles_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
save_role_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);

char *
get_overrides_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
get_override_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
create_override_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
delete_override_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
save_override_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
export_override_gmp (gvm_connection_t *, credentials_t *, params_t *,
                     cmd_response_data_t *);
char *
export_overrides_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);

char *
get_slave_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
get_slaves_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
create_slave_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
save_slave_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
delete_slave_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
export_slave_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
export_slaves_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);

char *
get_system_reports_gmp (gvm_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t *);
char *
get_system_report_gmp (gvm_connection_t *, credentials_t *, const char *,
                       params_t *, cmd_response_data_t *);

char *
get_report_format_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
get_report_formats_gmp (gvm_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t *);
char *
delete_report_format_gmp (gvm_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t *);
char *
import_report_format_gmp (gvm_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t *);
char *
save_report_format_gmp (gvm_connection_t *, credentials_t *, params_t *,
                        cmd_response_data_t *);

char *
get_feeds_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
sync_feed_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
sync_scap_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
sync_cert_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);

char *
create_filter_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
delete_filter_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
export_filter_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
export_filters_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);
char *
get_filter_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_filters_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
save_filter_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);

char *
create_user_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
delete_user_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
export_user_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
export_users_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
get_user_gmp (gvm_connection_t *, credentials_t *, params_t *,
              cmd_response_data_t *);
char *
get_users_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
save_user_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
get_vulns_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
save_auth_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);

char *
bulk_delete_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
bulk_export_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);

char *
run_wizard_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
wizard_gmp (gvm_connection_t *, credentials_t *, params_t *,
            cmd_response_data_t *);
char *
wizard_get_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);

char *
cvss_calculator (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);

char *
get_trash_gmp (gvm_connection_t *, credentials_t *, params_t *params,
               cmd_response_data_t *);
char *
restore_gmp (gvm_connection_t *, credentials_t *, params_t *,
             cmd_response_data_t *);
char *
delete_from_trash_gmp (gvm_connection_t *, credentials_t *, params_t *,
                       cmd_response_data_t *);
char *
empty_trashcan_gmp (gvm_connection_t *, credentials_t *, params_t *,
                    cmd_response_data_t *);

char *
get_settings_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
save_my_settings_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      const gchar *, cmd_response_data_t *);
char *
get_setting_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
save_setting_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
auth_settings_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);

char *
get_info_gmp (gvm_connection_t *, credentials_t *, params_t *,
              cmd_response_data_t *);
char *
get_info (gvm_connection_t *, credentials_t *, params_t *, const char *,
          cmd_response_data_t *);

char *
create_asset_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
create_host_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
delete_asset_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
save_asset_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_assets_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
get_asset_gmp (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *);
char *
export_asset_gmp (gvm_connection_t *, credentials_t *, params_t *,
                  cmd_response_data_t *);
char *
export_assets_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
get_assets_chart_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);

char *
get_tickets_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
get_ticket_gmp (gvm_connection_t *, credentials_t *, params_t *,
                cmd_response_data_t *);
char *
create_ticket_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
save_ticket_gmp (gvm_connection_t *, credentials_t *, params_t *,
                 cmd_response_data_t *);
char *
delete_ticket_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);

char *
get_tls_certificates_gmp (gvm_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t *);
char *
get_tls_certificate_gmp (gvm_connection_t *, credentials_t *, params_t *,
                         cmd_response_data_t *);
char *
create_tls_certificate_gmp (gvm_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t *);
char *
save_tls_certificate_gmp (gvm_connection_t *, credentials_t *, params_t *,
                          cmd_response_data_t *);
char *
delete_tls_certificate_gmp (gvm_connection_t *, credentials_t *, params_t *,
                            cmd_response_data_t *);

char *
get_capabilities_gmp (gvm_connection_t *, credentials_t *, params_t *,
                      cmd_response_data_t *);

char *
renew_session_gmp (gvm_connection_t *, credentials_t *, params_t *,
                   cmd_response_data_t *);
char *
ping_gmp (gvm_connection_t *, credentials_t *, params_t *,
          cmd_response_data_t *);

int
login (http_connection_t *con, params_t *params,
       cmd_response_data_t *response_data, const char *client_address);

#endif /* not _GSAD_GMP_H */
