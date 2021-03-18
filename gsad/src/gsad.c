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
 * @file gsad.c
 * @brief Main module of Greenbone Security Assistant daemon
 *
 * This file contains the core of the GSA server process that
 * handles HTTPS requests and communicates with Greenbone Vulnerability Manager
 * via the GMP protocol.
 */

/**
 * \mainpage
 * \section Introduction
 * \verbinclude README.md
 *
 * \section Installation
 * \verbinclude INSTALL
 *
 * \section copying License
 * \verbinclude LICENSE
 */

/**
 * @brief The Glib fatal mask, redefined to leave out G_LOG_FLAG_RECURSION.
 */

#define _GNU_SOURCE /* for strcasecmp */

#include <arpa/inet.h>
#include <assert.h>
#include <errno.h>
#include <gcrypt.h>
#include <glib.h>
#include <gnutls/gnutls.h>
#include <grp.h> /* for setgroups */
#include <netinet/in.h>
#include <pthread.h>
#include <pwd.h> /* for getpwnam */
#include <signal.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#if __linux
#include <sys/prctl.h>
#endif
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/un.h>
#include <unistd.h>
/* This must follow the system includes. */
#include "gsad_base.h"
#include "gsad_credentials.h"
#include "gsad_gmp.h"
#include "gsad_gmp_auth.h" /* for authenticate_gmp */
#include "gsad_http.h"
#include "gsad_http_handler.h" /* for init_http_handlers */
#include "gsad_i18n.h"
#include "gsad_params.h"
#include "gsad_session.h" /* for session_init */
#include "gsad_settings.h"
#include "gsad_user.h"
#include "utils.h" /* for str_equal */
#include "validator.h"

#include <gvm/base/logging.h>
#include <gvm/base/networking.h> /* for ipv6_is_enabled */
#include <gvm/base/pidfile.h>
#include <gvm/util/fileutils.h>
#include <microhttpd.h>

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad main"

#undef G_LOG_FATAL_MASK
#define G_LOG_FATAL_MASK G_LOG_LEVEL_ERROR

/*
 * define MHD_USE_INTERNAL_POLLING_THREAD for libmicrohttp < 0.9.53
 */
#if MHD_VERSION < 0x00095300
#define MHD_USE_INTERNAL_POLLING_THREAD 0
#endif

/**
 * @brief Fallback GSAD port for HTTPS.
 */
#define DEFAULT_GSAD_HTTPS_PORT 443

/**
 * @brief Fallback GSAD port for HTTP.
 */
#define DEFAULT_GSAD_HTTP_PORT 80

/**
 * @brief Fallback unprivileged GSAD port.
 */
#define DEFAULT_GSAD_PORT 9392

/**
 * @brief Fallback GSAD port.
 */
#define DEFAULT_GSAD_REDIRECT_PORT 80

/**
 * @brief Fallback Manager port.
 */
#define DEFAULT_GVM_PORT 9390

/**
 * @brief Max number of minutes between activity in a session.
 */
#define SESSION_TIMEOUT 15

/**
 * @brief Upper limit of minutes for a session timeout. Currently 4 weeks.
 */
#define MAX_SESSION_TIMEOUT 40320

/**
 * @brief Default value for client_watch_interval
 */
#define DEFAULT_CLIENT_WATCH_INTERVAL 1

/**
 * @brief Default directory for web content.
 */
#define DEFAULT_WEB_DIRECTORY "web"

/**
 * @brief Default value for HTTP header "X-Frame-Options"
 */
#define DEFAULT_GSAD_X_FRAME_OPTIONS "SAMEORIGIN"

/**
 * @brief Default value for HTTP header "Content-Security-Policy"
 */
#define DEFAULT_GSAD_CONTENT_SECURITY_POLICY \
  "default-src 'self' 'unsafe-inline';"      \
  " img-src 'self' blob:;"                   \
  " frame-ancestors 'self'"

/**
 * @brief Default "max-age" for HTTP header "Strict-Transport-Security"
 */
#define DEFAULT_GSAD_HSTS_MAX_AGE 31536000

/**
 * @brief Default value for the maximum number of connection per IP address.
 */
#define DEFAULT_GSAD_PER_IP_CONNECTION_LIMIT 30

#define COPYRIGHT                                                        \
  "Copyright (C) 2010 - 2020 Greenbone Networks GmbH\n"                  \
  "License: AGPL-3.0-or-later\n"                                         \
  "This is free software: you are free to change and redistribute it.\n" \
  "There is NO WARRANTY, to the extent permitted by law.\n\n"

/**
 * @brief Flag for signal handler.
 */
volatile int termination_signal = 0;

/**
 * @brief Libgcrypt thread callback definition for libgcrypt < 1.6.0.
 */
#if GCRYPT_VERSION_NUMBER < 0x010600
GCRY_THREAD_OPTION_PTHREAD_IMPL;
#endif

/**
 * @brief The handle on the embedded HTTP daemon.
 */
struct MHD_Daemon *gsad_daemon;

/**
 * @brief The IP addresses of this program, "the GSAD".
 */
GSList *address_list = NULL;

/**
 * @brief Location for redirection server.
 */
gchar *redirect_location = NULL;

/**
 * @brief PID of redirect child in parent, 0 in child.
 */
pid_t redirect_pid = 0;

/**
 * @brief PID of unix socket child in parent, 0 in child.
 */
pid_t unix_pid = 0;

/** @todo Ensure the accesses to these are thread safe. */

/**
 * @brief Logging parameters, as passed to setup_log_handlers.
 */
GSList *log_config = NULL;

/**
 * @brief Whether chroot is used
 */
int chroot_state = 0;

/**
 * @brief Interval in seconds to check whether client connection was closed.
 */
int client_watch_interval = DEFAULT_CLIENT_WATCH_INTERVAL;

/**
 * @brief Parameter validator.
 */
validator_t validator;

/**
 * @brief Initialise the parameter validator.
 */
void
init_validator ()
{
  validator = gvm_validator_new ();

  gvm_validator_add (validator, "cmd",
                     "^((bulk_delete)"
                     "|(bulk_export)"
                     "|(clone)"
                     "|(create_asset)"
                     "|(create_config)"
                     "|(create_container_task)"
                     "|(create_credential)"
                     "|(create_alert)"
                     "|(create_filter)"
                     "|(create_group)"
                     "|(create_host)"
                     "|(create_note)"
                     "|(create_override)"
                     "|(create_permission)"
                     "|(create_permissions)"
                     "|(create_port_list)"
                     "|(create_port_range)"
                     "|(create_report)"
                     "|(create_role)"
                     "|(create_scanner)"
                     "|(create_schedule)"
                     "|(create_tag)"
                     "|(create_tags)"
                     "|(create_target)"
                     "|(create_task)"
                     "|(create_ticket)"
                     "|(create_tls_certificate)"
                     "|(create_user)"
                     "|(cvss_calculator)"
                     "|(delete_asset)"
                     "|(delete_config)"
                     "|(delete_credential)"
                     "|(delete_alert)"
                     "|(delete_filter)"
                     "|(delete_from_trash)"
                     "|(delete_group)"
                     "|(delete_note)"
                     "|(delete_override)"
                     "|(delete_permission)"
                     "|(delete_port_list)"
                     "|(delete_port_range)"
                     "|(delete_report)"
                     "|(delete_report_format)"
                     "|(delete_role)"
                     "|(delete_scanner)"
                     "|(delete_schedule)"
                     "|(delete_tag)"
                     "|(delete_target)"
                     "|(delete_task)"
                     "|(delete_ticket)"
                     "|(delete_tls_certificate)"
                     "|(delete_user)"
                     "|(download_credential)"
                     "|(download_ssl_cert)"
                     "|(download_ca_pub)"
                     "|(download_key_pub)"
                     "|(edit_alert)"
                     "|(edit_config_family)"
                     "|(auth_settings)"
                     "|(empty_trashcan)"
                     "|(export_alert)"
                     "|(export_alerts)"
                     "|(export_asset)"
                     "|(export_assets)"
                     "|(export_config)"
                     "|(export_configs)"
                     "|(export_credential)"
                     "|(export_credentials)"
                     "|(export_filter)"
                     "|(export_filters)"
                     "|(export_group)"
                     "|(export_groups)"
                     "|(export_note)"
                     "|(export_notes)"
                     "|(export_omp_doc)"
                     "|(export_override)"
                     "|(export_overrides)"
                     "|(export_permission)"
                     "|(export_permissions)"
                     "|(export_port_list)"
                     "|(export_port_lists)"
                     "|(export_preference_file)"
                     "|(export_report_format)"
                     "|(export_report_formats)"
                     "|(export_result)"
                     "|(export_results)"
                     "|(export_role)"
                     "|(export_roles)"
                     "|(export_scanner)"
                     "|(export_scanners)"
                     "|(export_schedule)"
                     "|(export_schedules)"
                     "|(export_tag)"
                     "|(export_tags)"
                     "|(export_target)"
                     "|(export_targets)"
                     "|(export_task)"
                     "|(export_tasks)"
                     "|(export_user)"
                     "|(export_users)"
                     "|(get_aggregate)"
                     "|(get_alert)"
                     "|(get_alerts)"
                     "|(get_asset)"
                     "|(get_assets)"
                     "|(get_capabilities)"
                     "|(get_config)"
                     "|(get_config_family)"
                     "|(get_config_nvt)"
                     "|(get_configs)"
                     "|(get_credential)"
                     "|(get_credentials)"
                     "|(get_feeds)"
                     "|(get_filter)"
                     "|(get_filters)"
                     "|(get_group)"
                     "|(get_groups)"
                     "|(get_info)"
                     "|(get_note)"
                     "|(get_notes)"
                     "|(get_nvt_families)"
                     "|(get_override)"
                     "|(get_overrides)"
                     "|(get_permission)"
                     "|(get_permissions)"
                     "|(get_port_list)"
                     "|(get_port_lists)"
                     "|(get_report)"
                     "|(get_reports)"
                     "|(get_report_format)"
                     "|(get_report_formats)"
                     "|(get_result)"
                     "|(get_results)"
                     "|(get_role)"
                     "|(get_roles)"
                     "|(get_scanner)"
                     "|(get_scanners)"
                     "|(get_schedule)"
                     "|(get_schedules)"
                     "|(get_setting)"
                     "|(get_settings)"
                     "|(get_system_reports)"
                     "|(get_tag)"
                     "|(get_tags)"
                     "|(get_target)"
                     "|(get_targets)"
                     "|(get_task)"
                     "|(get_tasks)"
                     "|(get_ticket)"
                     "|(get_tickets)"
                     "|(get_tls_certificate)"
                     "|(get_tls_certificates)"
                     "|(get_trash)"
                     "|(get_user)"
                     "|(get_users)"
                     "|(get_vulns)"
                     "|(import_config)"
                     "|(import_port_list)"
                     "|(import_report_format)"
                     "|(login)"
                     "|(move_task)"
                     "|(new_alert)"
                     "|(ping)"
                     "|(renew_session)"
                     "|(report_alert)"
                     "|(restore)"
                     "|(resume_task)"
                     "|(run_wizard)"
                     "|(test_alert)"
                     "|(save_alert)"
                     "|(save_asset)"
                     "|(save_auth)"
                     "|(save_setting)"
                     "|(save_config)"
                     "|(save_config_family)"
                     "|(save_config_nvt)"
                     "|(save_container_task)"
                     "|(save_credential)"
                     "|(save_filter)"
                     "|(save_group)"
                     "|(save_my_settings)"
                     "|(save_note)"
                     "|(save_override)"
                     "|(save_permission)"
                     "|(save_port_list)"
                     "|(save_report_format)"
                     "|(save_role)"
                     "|(save_scanner)"
                     "|(save_schedule)"
                     "|(save_tag)"
                     "|(save_target)"
                     "|(save_task)"
                     "|(save_ticket)"
                     "|(save_tls_certificate)"
                     "|(save_user)"
                     "|(start_task)"
                     "|(stop_task)"
                     "|(sync_feed)"
                     "|(sync_scap)"
                     "|(sync_cert)"
                     "|(sync_config)"
                     "|(toggle_tag)"
                     "|(verify_scanner)"
                     "|(wizard)"
                     "|(wizard_get))$");

  gvm_validator_add (validator, "action_message", "(?s)^.*$");
  gvm_validator_add (validator, "action_status", "(?s)^.*$");
  gvm_validator_add (validator, "active", "^(-1|-2|[0-9]+)$");
  gvm_validator_add (validator, "aggregate_mode", "^[a-z0-9_]+$");
  gvm_validator_add (
    validator, "aggregate_type",
    "^(alert|config|credential|filter|group|host|nvt|note|os|override|"
    "permission|port_list|report|report_format|result|role|scanner|schedule|"
    "tag|target|task|user|cve|cpe|ovaldef|cert_bund_adv|dfn_cert_adv|"
    "vuln|tls_certificate)$");
  gvm_validator_add (
    validator, "alive_tests",
    "^(Scan Config Default|ICMP Ping|TCP-ACK Service Ping|TCP-SYN Service "
    "Ping|ARP Ping|ICMP & TCP-ACK Service Ping|ICMP & ARP Ping|TCP-ACK Service "
    "& ARP Ping|ICMP, TCP-ACK Service & ARP Ping|Consider Alive)$");
  gvm_validator_add (validator, "apply_filter", "^(no|no_pagination|full)$");
  gvm_validator_add (validator, "asset_name", "(?s)^.*$");
  gvm_validator_add (validator, "asset_type", "^(host|os)$");
  gvm_validator_add (validator, "asset_id",
                     "^([[:alnum:]-_.:\\/~()']|&amp;)+$");
  gvm_validator_add (validator, "auth_algorithm", "^(md5|sha1)$");
  gvm_validator_add (validator, "auth_method", "^(0|1|2)$");
  /* Defined in RFC 2253. */
  gvm_validator_add (validator, "authdn", "^.{0,200}%s.{0,200}$");
  gvm_validator_add (validator, "auto_delete", "^(no|keep)$");
  gvm_validator_add (validator, "auto_delete_data", "^.*$");
  gvm_validator_add (validator, "boolean", "^(0|1)$");
  gvm_validator_add (validator, "bulk_selected:name", "^.*$");
  gvm_validator_add (validator, "bulk_selected:value", "(?s)^.*$");
  gvm_validator_add (validator, "caller", "^.*$");
  gvm_validator_add (validator, "certificate", "(?s)^.*$");
  gvm_validator_add (validator, "chart_gen:name", "^.*$");
  gvm_validator_add (validator, "chart_gen:value", "(?s)^.*$");
  gvm_validator_add (validator, "chart_init:name", "^.*$");
  gvm_validator_add (validator, "chart_init:value", "(?s)^.*$");
  gvm_validator_add (validator, "setting_value", "^.*$");
  gvm_validator_add (validator, "setting_name", "^.*$");
  gvm_validator_add (validator, "comment",
                     "^[-_;':()@[:alnum:]äüöÄÜÖß, \\./]*$");
  gvm_validator_add (validator, "config_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "osp_config_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "condition", "^[[:alnum:] ]*$");
  gvm_validator_add (validator, "credential_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "create_credentials_type", "^(gen|pass|key)$");
  gvm_validator_add (validator, "credential_type",
                     "^(cc|up|usk|smime|pgp|snmp|pw)$");
  gvm_validator_add (validator, "credential_login", "^[-_[:alnum:]\\.@\\\\]*$");
  gvm_validator_add (validator, "condition_data:name", "^.*$");
  gvm_validator_add (validator, "condition_data:value", "(?s)^.*$");
  gvm_validator_add (validator, "cvss_av", "^(L|A|N)$");
  gvm_validator_add (validator, "cvss_ac", "^(H|M|L)$");
  gvm_validator_add (validator, "cvss_au", "^(M|S|N)$");
  gvm_validator_add (validator, "cvss_c", "^(N|P|C)$");
  gvm_validator_add (validator, "cvss_i", "^(N|P|C)$");
  gvm_validator_add (validator, "cvss_a", "^(N|P|C)$");
  gvm_validator_add (
    validator, "cvss_vector",
    "^AV:(L|A|N)/AC:(H|M|L)/A(u|U):(M|S|N)/C:(N|P|C)/I:(N|P|C)/A:(N|P|C)$");
  gvm_validator_add (validator, "min_qod", "^(|100|[1-9]?[0-9]|)$");
  gvm_validator_add (validator, "day_of_month", "^(0??[1-9]|[12][0-9]|30|31)$");
  gvm_validator_add (validator, "days", "^(-1|[0-9]+)$");
  gvm_validator_add (validator, "data_column", "^[_[:alnum:]]+$");
  gvm_validator_add (validator, "data_columns:name", "^[0123456789]{1,5}$");
  gvm_validator_add (validator, "data_columns:value", "^[_[:alnum:]]+$");
  gvm_validator_add (validator, "default_severity",
                     "^(|10\\.0|[0-9]\\.[0-9])$");
  gvm_validator_add (validator, "delta_states", "^(c|g|n|s){0,4}$");
  gvm_validator_add (validator, "details_fname",
                     "^([[:alnum:]_-]|%[%CcDFMmNTtUu])+$");
  gvm_validator_add (validator, "domain", "^[-[:alnum:]\\.]+$");
  gvm_validator_add (validator, "email", "^[^@ ]{1,150}@[^@ ]{1,150}$");
  gvm_validator_add (
    validator, "email_list",
    "^[^@ ]{1,150}@[^@ ]{1,150}(, *[^@ ]{1,150}@[^@ ]{1,150})*$");
  gvm_validator_add (validator, "alert_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "alert_id_optional", "^(--|[a-z0-9\\-]+)$");
  gvm_validator_add (validator, "event_data:name", "^.*$");
  gvm_validator_add (validator, "event_data:value", "(?s)^.*$");
  gvm_validator_add (validator, "family", "^[-_[:alnum:] :.]+$");
  gvm_validator_add (validator, "family_page", "^[-_[:alnum:] :.]+$");
  gvm_validator_add (validator, "exclude_file", "(?s)^.*$");
  gvm_validator_add (validator, "exclude_file:name",
                     "^.*[[0-9abcdefABCDEF\\-]*]:.*$");
  gvm_validator_add (validator, "exclude_file:value", "^yes$");
  gvm_validator_add (validator, "file", "(?s)^.*$");
  gvm_validator_add (validator, "file:name", "^.*[[0-9abcdefABCDEF\\-]*]:.*$");
  gvm_validator_add (validator, "file:value", "^yes$");
  gvm_validator_add (validator, "settings_changed:name", "^.*$");
  gvm_validator_add (validator, "settings_changed:value", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "settings_default:name", "^.*$");
  gvm_validator_add (validator, "settings_default:value", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "settings_filter:name", "^.*$");
  gvm_validator_add (validator, "settings_filter:value", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "first", "^[0-9]+$");
  gvm_validator_add (validator, "first_group", "^[0-9]+$");
  gvm_validator_add (validator, "first_result", "^[0-9]+$");
  gvm_validator_add (validator, "filter", "^.*$");
  gvm_validator_add (validator, "format_id", "^[a-z0-9\\-]+$");
  /* Validator for  save_auth group, e.g. "method:ldap_connect". */
  gvm_validator_add (validator, "group",
                     "^method:(ldap_connect|radius_connect)$");
  gvm_validator_add (validator, "group_column", "^[_[:alnum:]]+$");
  gvm_validator_add (validator, "max", "^(-?[0-9]+|)$");
  gvm_validator_add (validator, "max_results", "^[0-9]+$");
  gvm_validator_add (validator, "format", "^[-[:alnum:]]+$");
  gvm_validator_add (validator, "host", "^[[:alnum:]:\\.]+$");
  gvm_validator_add (validator, "hostport", "^[-[:alnum:]\\. :]+$");
  gvm_validator_add (validator, "hostpath", "^[-[:alnum:]\\. :/]+$");
  gvm_validator_add (validator, "hosts", "^[-[:alnum:],: \\./]+$");
  gvm_validator_add (validator, "hosts_allow", "^(0|1)$");
  gvm_validator_add (validator, "hosts_opt", "^[-[:alnum:],: \\./]*$");
  gvm_validator_add (validator, "hosts_ordering",
                     "^(sequential|random|reverse)$");
  gvm_validator_add (validator, "hour", "^([01]?[0-9]|2[0-3])$");
  gvm_validator_add (validator, "howto_use", "(?s)^.*$");
  gvm_validator_add (validator, "howto_install", "(?s)^.*$");
  gvm_validator_add (validator, "id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "id_optional", "^(--|[a-z0-9\\-]+)$");
  gvm_validator_add (validator, "optional_id", "^[a-z0-9\\-]*$");
  gvm_validator_add (validator, "id_or_empty", "^(|[a-z0-9\\-]+)$");
  gvm_validator_add (validator, "id_list:name", "^ *[0-9]+ *$");
  gvm_validator_add (validator, "id_list:value",
                     "^[[:alnum:]\\-_ ]+:[a-z0-9\\-]+$");
  gvm_validator_add (validator, "ifaces_allow", "^(0|1)$");
  gvm_validator_add (validator, "include_id_list:name", "^[[:alnum:]\\-_ ]+$");
  gvm_validator_add (validator, "include_id_list:value", "^(0|1)$");
  gvm_validator_add (validator, "installer_sig", "(?s)^.*$");
  gvm_validator_add (validator, "isodate", "^.*$");
  gvm_validator_add (validator, "lang",
                     "^(Browser Language|"
                     "([a-z]{2,3})(_[A-Z]{2})?(@[[:alnum:]_-]+)?"
                     "(:([a-z]{2,3})(_[A-Z]{2})?(@[[:alnum:]_-]+)?)*)$");
  gvm_validator_add (validator, "levels", "^(h|m|l|g|f){0,5}$");
  gvm_validator_add (validator, "list_fname",
                     "^([[:alnum:]_-]|%[%CcDFMmNTtUu])+$");
  /* Used for users, credentials, and scanner login name. */
  gvm_validator_add (validator, "login", "^[[:alnum:]-_@.]+$");
  gvm_validator_add (validator, "lsc_password", "^.*$");
  gvm_validator_add (validator, "max_result", "^[0-9]+$");
  gvm_validator_add (validator, "max_groups", "^-?[0-9]+$");
  gvm_validator_add (validator, "minute", "^[0-5]{0,1}[0-9]{1,1}$");
  gvm_validator_add (validator, "month", "^((0??[1-9])|1[012])$");
  gvm_validator_add (validator, "note_optional", "(?s)^(.)*$");
  gvm_validator_add (validator, "note_required", "(?s)^(.)+$");
  gvm_validator_add (validator, "note_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "override_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "name", "^[#-_[:alnum:], \\./]*$");
  gvm_validator_add (validator, "info_name", "(?s)^.*$");
  gvm_validator_add (validator, "info_type", "(?s)^.*$");
  gvm_validator_add (validator, "info_id", "^([[:alnum:]-_.:\\/~()']|&amp;)+$");
  gvm_validator_add (validator, "details", "^[0-1]$");
  /* Number is special cased in params_mhd_validate to remove the space. */
  gvm_validator_add (validator, "number", "^ *[0-9]+ *$");
  gvm_validator_add (validator, "optional_number", "^[0-9]*$");
  gvm_validator_add (validator, "oid", "^([0-9.]{1,80}|CVE-[-0-9]{1,14})$");
  gvm_validator_add (validator, "page", "^[_[:alnum:] ]+$");
  gvm_validator_add (validator, "package_format", "^(pem|key|rpm|deb|exe)$");
  gvm_validator_add (validator, "password", "^.*$");
  gvm_validator_add (validator, "password:value", "(?s)^.*$");
  gvm_validator_add (validator, "port", "^.*$");
  gvm_validator_add (validator, "port_range", "^((default)|([-0-9, TU:]+))$");
  gvm_validator_add (validator, "port_type", "^(tcp|udp)$");
  /** @todo Better regex. */
  gvm_validator_add (validator, "preference_name", "^.*$");
  gvm_validator_add (validator, "preference:name", "^([^:]*:[^:]*:.*){0,400}$");
  gvm_validator_add (validator, "preference:value", "(?s)^.*$");
  gvm_validator_add (validator, "prev_action", "(?s)^.*$");
  gvm_validator_add (validator, "privacy_algorithm", "^(aes|des|)$");
  gvm_validator_add (validator, "private_key", "(?s)^.*$");
  gvm_validator_add (validator, "public_key", "(?s)^.*$");
  gvm_validator_add (validator, "pw", "^[[:alnum:]]+$");
  gvm_validator_add (validator, "xml_file", "(?s)^.*$");
  gvm_validator_add (validator, "definitions_file", "(?s)^.*$");
  gvm_validator_add (validator, "ca_pub", "(?s)^.*$");
  gvm_validator_add (validator, "which_cert", "^(default|existing|new)$");
  gvm_validator_add (validator, "key_pub", "(?s)^.*$");
  gvm_validator_add (validator, "key_priv", "(?s)^.*$");
  gvm_validator_add (validator, "radiuskey", "^.*$");
  gvm_validator_add (validator, "range_type",
                     "^(duration|until_end|from_start|start_to_end)$");
  gvm_validator_add (validator, "related:name", "^.*$");
  gvm_validator_add (validator, "related:value", "^.*$");
  gvm_validator_add (validator, "report_fname",
                     "^([[:alnum:]_-]|%[%CcDFMmNTtUu])+$");
  gvm_validator_add (validator, "report_format_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "report_section",
                     "^(summary|results|hosts|ports"
                     "|closed_cves|os|apps|errors"
                     "|topology|ssl_certs|cves)$");
  gvm_validator_add (validator, "result_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "role", "^[[:alnum:] ]+$");
  gvm_validator_add (validator, "permission", "^([_a-z]+|Super)$");
  gvm_validator_add (validator, "permission_type", "^(read|write)$");
  gvm_validator_add (validator, "port_list_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "port_range_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (
    validator, "resource_type",
    "^(alert|asset|cert_bund_adv|config|cpe|credential|cve|dfn_cert_adv|"
    "filter|group|host|info|nvt|note|os|ovaldef|override|permission|port_list|"
    "report|report_format|result|role|scanner|schedule|tag|target|task|ticket|"
    "tls_certificate|user|vuln|)$");
  gvm_validator_add (validator, "resource_id", "^[[:alnum:]-_.:\\/~]*$");
  gvm_validator_add (validator, "resources_action", "^(|add|set|remove)$");
  gvm_validator_add (
    validator, "optional_resource_type",
    "^(alert|asset|cert_bund_adv|config|cpe|credential|cve|dfn_cert_adv|"
    "filter|group|host|info|nvt|note|os|ovaldef|override|permission|port_list|"
    "report|report_format|result|role|scanner|schedule|tag|target|task|ticket|"
    "tls_certificate|user|vuln|)?$");
  gvm_validator_add (validator, "select:value", "^.*$");
  gvm_validator_add (validator, "ssl_cert", "^.*$");
  gvm_validator_add (validator, "method_data:name", "^.*$");
  gvm_validator_add (validator, "method_data:value", "(?s)^.*$");
  gvm_validator_add (validator, "nvt:name", "(?s)^.*$");
  gvm_validator_add (validator, "restrict_credential_type", "^[a-z0-9\\_|]+$");
  gvm_validator_add (validator, "subject_type", "^(group|role|user)$");
  gvm_validator_add (validator, "summary", "^.*$");
  gvm_validator_add (validator, "tag_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "tag_name", "^[\\:\\-_[:alnum:], \\./]+$");
  gvm_validator_add (validator, "tag_value",
                     "^[\\-_@%[:alnum:], \\.\\/\\\\]*$");
  gvm_validator_add (validator, "target_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "task_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "term", "^.*");
  gvm_validator_add (validator, "text", "^.*");
  gvm_validator_add (validator, "text_columns:name", "^[0123456789]+$");
  gvm_validator_add (validator, "text_columns:value", "^[_[:alnum:]]+$");
  gvm_validator_add (validator, "threat",
                     "^(High|Medium|Low|Alarm|Log|False Positive|)$");
  gvm_validator_add (validator, "ticket_status", "^(Open|Fixed|Closed)$");
  gvm_validator_add (validator, "trend", "^(0|1)$");
  gvm_validator_add (validator, "trend:value", "^(0|1)$");
  gvm_validator_add (validator, "type", "^(assets)$");
  gvm_validator_add (validator, "search_phrase",
                     "^[[:alnum:][:punct:] äöüÄÖÜß]*$");
  gvm_validator_add (validator, "sort_field", "^[_[:alnum:] ]+$");
  gvm_validator_add (validator, "sort_order", "^(ascending|descending)$");
  gvm_validator_add (validator, "sort_stat", "^[_[:alnum:] ]+$");
  gvm_validator_add (validator, "sort_fields:name", "^[0123456789]+$");
  gvm_validator_add (validator, "sort_fields:value", "^[_[:alnum:] ]+$");
  gvm_validator_add (validator, "sort_orders:name", "^[0123456789]+$");
  gvm_validator_add (validator, "sort_orders:value",
                     "^(ascending|descending)$");
  gvm_validator_add (validator, "sort_stats:name", "^[0123456789]+$");
  gvm_validator_add (validator, "sort_stats:value", "^[_[:alnum:] ]+$");
  gvm_validator_add (validator, "target_source",
                     "^(asset_hosts|file|import|manual)$");
  gvm_validator_add (validator, "target_exclude_source", "^(file|manual)$");
  gvm_validator_add (validator, "timezone", "^.*$");
  gvm_validator_add (validator, "token", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "scanner_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "cve_scanner_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "osp_scanner_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "schedule_id", "^[a-z0-9\\-]+$");
  gvm_validator_add (validator, "severity",
                     "^(-1(\\.0)?|[0-9](\\.[0-9])?|10(\\.0)?)$");
  gvm_validator_add (validator, "severity_optional",
                     "^(-1(\\.0)?|[0-9](\\.[0-9])?|10(\\.0)?)?$");
  gvm_validator_add (validator, "source_iface", "^(.*){1,16}$");
  gvm_validator_add (validator, "uuid", "^[0-9abcdefABCDEF\\-]{1,40}$");
  gvm_validator_add (validator, "usage_type", "^(audit|policy|scan|)$");
  /* This must be "login" with space and comma. */
  gvm_validator_add (validator, "users", "^[[:alnum:]-_@., ]*$");
  gvm_validator_add (validator, "x_field", "^[\\[\\]_[:alnum:]]+$");
  gvm_validator_add (validator, "y_fields:name", "^[0-9]+$");
  gvm_validator_add (validator, "y_fields:value", "^[\\[\\]_[:alnum:]]+$");
  gvm_validator_add (validator, "year", "^[0-9]+$");
  gvm_validator_add (validator, "z_fields:name", "^[0-9]+$");
  gvm_validator_add (validator, "z_fields:value", "^[\\[\\]_[:alnum:]]+$");
  gvm_validator_add (validator, "calendar_unit",
                     "^(second|minute|hour|day|week|month|year|decade)$");
  gvm_validator_add (validator, "chart_title", "(?s)^.*$");
  gvm_validator_add (validator, "icalendar", "(?s)^BEGIN:VCALENDAR.+$");

  /* Binary data params that should not use no UTF-8 validation */
  gvm_validator_add_binary (validator, "certificate_bin");
  gvm_validator_add_binary (validator, "installer");
  gvm_validator_add_binary (validator, "method_data:pkcs12:");

  /* Beware, the rule must be defined before the alias. */

  gvm_validator_alias (validator, "optional_task_id", "optional_id");
  gvm_validator_alias (validator, "add_tag", "boolean");
  gvm_validator_alias (validator, "alert_id_2", "alert_id");
  gvm_validator_alias (validator, "alert_id_optional:name", "number");
  gvm_validator_alias (validator, "alert_id_optional:value",
                       "alert_id_optional");
  gvm_validator_alias (validator, "alerts", "optional_number");
  gvm_validator_alias (validator, "alert_ids:name", "number");
  gvm_validator_alias (validator, "alert_ids:value", "alert_id_optional");
  gvm_validator_alias (validator, "allow_insecure", "boolean");
  gvm_validator_alias (validator, "alterable", "boolean");
  gvm_validator_alias (validator, "apply_overrides", "boolean");
  gvm_validator_alias (validator, "autogenerate", "boolean");
  gvm_validator_alias (validator, "auto_cache_rebuild", "boolean");
  gvm_validator_alias (validator, "base", "name");
  gvm_validator_alias (validator, "build_filter", "boolean");
  /* the "bulk_[...].x" parameters are used to identify the image type
   *  form element used to submit the form for process_bulk */
  gvm_validator_alias (validator, "bulk_create.x", "number");
  gvm_validator_alias (validator, "bulk_delete.x", "number");
  gvm_validator_alias (validator, "bulk_export.x", "number");
  gvm_validator_alias (validator, "bulk_trash.x", "number");
  gvm_validator_alias (validator, "bulk_select", "number");
  gvm_validator_alias (validator, "change_community", "boolean");
  gvm_validator_alias (validator, "change_passphrase", "boolean");
  gvm_validator_alias (validator, "change_password", "boolean");
  gvm_validator_alias (validator, "change_privacy_password", "boolean");
  gvm_validator_alias (validator, "charts", "boolean");
  gvm_validator_alias (validator, "chart_type", "name");
  gvm_validator_alias (validator, "chart_template", "name");
  gvm_validator_alias (validator, "community", "lsc_password");
  gvm_validator_alias (validator, "closed_note", "note_optional");
  gvm_validator_alias (validator, "custom_severity", "boolean");
  gvm_validator_alias (validator, "current_user", "boolean");
  gvm_validator_alias (validator, "dashboard_name", "name");
  gvm_validator_alias (validator, "debug", "boolean");
  gvm_validator_alias (validator, "delta_state_changed", "boolean");
  gvm_validator_alias (validator, "delta_state_gone", "boolean");
  gvm_validator_alias (validator, "delta_state_new", "boolean");
  gvm_validator_alias (validator, "delta_state_same", "boolean");
  gvm_validator_alias (validator, "duration", "optional_number");
  gvm_validator_alias (validator, "duration_unit", "calendar_unit");
  gvm_validator_alias (validator, "dynamic_severity", "boolean");
  gvm_validator_alias (validator, "enable", "boolean");
  gvm_validator_alias (validator, "enable_stop", "boolean");
  gvm_validator_alias (validator, "end_time", "isodate");
  gvm_validator_alias (validator, "esxi_credential_id", "credential_id");
  gvm_validator_alias (validator, "filter_extra", "filter");
  gvm_validator_alias (validator, "filter_id", "id");
  gvm_validator_alias (validator, "filterbox", "boolean");
  gvm_validator_alias (validator, "fixed_note", "note_optional");
  gvm_validator_alias (validator, "from_file", "boolean");
  gvm_validator_alias (validator, "force_wizard", "boolean");
  gvm_validator_alias (validator, "get_name", "name");
  gvm_validator_alias (validator, "grant_full", "boolean");
  gvm_validator_alias (validator, "group_id", "id");
  gvm_validator_alias (validator, "group_ids:name", "number");
  gvm_validator_alias (validator, "group_ids:value", "id_optional");
  gvm_validator_alias (validator, "groups", "optional_number");
  gvm_validator_alias (validator, "hosts_manual", "hosts");
  gvm_validator_alias (validator, "hosts_filter", "filter");
  gvm_validator_alias (validator, "exclude_hosts", "hosts_opt");
  gvm_validator_alias (validator, "in_assets", "boolean");
  gvm_validator_alias (validator, "in_use", "boolean");
  gvm_validator_alias (validator, "include_related", "number");
  gvm_validator_alias (validator, "include_certificate_data", "boolean");
  gvm_validator_alias (validator, "inheritor_id", "id");
  gvm_validator_alias (validator, "ignore_pagination", "boolean");
  gvm_validator_alias (validator, "event", "condition");
  gvm_validator_alias (validator, "access_hosts", "hosts_opt");
  gvm_validator_alias (validator, "access_ifaces", "hosts_opt");
  gvm_validator_alias (validator, "max_checks", "number");
  gvm_validator_alias (validator, "max_hosts", "number");
  gvm_validator_alias (validator, "method", "condition");
  gvm_validator_alias (validator, "modify_password", "number");
  gvm_validator_alias (validator, "ldaphost", "hostport");
  gvm_validator_alias (validator, "lean", "boolean");
  gvm_validator_alias (validator, "level_high", "boolean");
  gvm_validator_alias (validator, "level_medium", "boolean");
  gvm_validator_alias (validator, "level_low", "boolean");
  gvm_validator_alias (validator, "level_log", "boolean");
  gvm_validator_alias (validator, "level_false_positive", "boolean");
  gvm_validator_alias (validator, "method_data:to_address:", "email_list");
  gvm_validator_alias (validator, "method_data:from_address:", "email");
  gvm_validator_alias (validator, "new_severity", "severity_optional");
  gvm_validator_alias (validator, "new_severity_from_list",
                       "severity_optional");
  gvm_validator_alias (validator, "new_threat", "threat");
  gvm_validator_alias (validator, "next", "page");
  gvm_validator_alias (validator, "next_next", "page");
  gvm_validator_alias (validator, "next_error", "page");
  gvm_validator_alias (validator, "next_id", "info_id");
  gvm_validator_alias (validator, "next_type", "resource_type");
  gvm_validator_alias (validator, "next_subtype", "info_type");
  gvm_validator_alias (validator, "next_xml", "boolean");
  gvm_validator_alias (validator, "note", "note_required");
  gvm_validator_alias (validator, "notes", "boolean");
  gvm_validator_alias (validator, "no_chart_links", "boolean");
  gvm_validator_alias (validator, "no_filter_history", "boolean");
  gvm_validator_alias (validator, "no_redirect", "boolean");
  gvm_validator_alias (validator, "nvt:value", "uuid");
  gvm_validator_alias (validator, "old_login", "login");
  gvm_validator_alias (validator, "old_password", "password");
  gvm_validator_alias (validator, "open_note", "note_optional");
  gvm_validator_alias (validator, "original_overrides", "boolean");
  gvm_validator_alias (validator, "owner", "name");
  gvm_validator_alias (validator, "passphrase", "lsc_password");
  gvm_validator_alias (validator, "password:name", "preference_name");
  gvm_validator_alias (validator, "permission", "name");
  gvm_validator_alias (validator, "permission_id", "id");
  gvm_validator_alias (validator, "permission_group_id", "id");
  gvm_validator_alias (validator, "permission_role_id", "id");
  gvm_validator_alias (validator, "permission_user_id", "id");
  gvm_validator_alias (validator, "port_manual", "port");
  gvm_validator_alias (validator, "port_range_end", "number");
  gvm_validator_alias (validator, "port_range_start", "number");
  gvm_validator_alias (validator, "pos", "number");
  gvm_validator_alias (validator, "privacy_password", "lsc_password");
  gvm_validator_alias (validator, "radiushost", "hostport");
  gvm_validator_alias (validator, "restrict_type", "resource_type");
  gvm_validator_alias (validator, "resource_ids:name", "number");
  gvm_validator_alias (validator, "resource_ids:value", "info_id");
  gvm_validator_alias (validator, "result_hosts_only", "boolean");
  gvm_validator_alias (validator, "report_format_ids:name", "number");
  gvm_validator_alias (validator, "report_format_ids:value",
                       "report_format_id");
  gvm_validator_alias (validator, "report_id", "id");
  gvm_validator_alias (validator, "_and_report_id", "id");
  gvm_validator_alias (validator, "delta_report_id", "id");
  gvm_validator_alias (validator, "result_task_id", "optional_task_id");
  gvm_validator_alias (validator, "result_uuid", "optional_id");
  gvm_validator_alias (validator, "report_result_id", "result_id");
  gvm_validator_alias (validator, "report_uuid", "result_id");
  gvm_validator_alias (validator, "replace_task_id", "boolean");
  gvm_validator_alias (validator, "reverse_lookup_only", "boolean");
  gvm_validator_alias (validator, "reverse_lookup_unify", "boolean");
  gvm_validator_alias (validator, "role_id", "id");
  gvm_validator_alias (validator, "role_ids:name", "number");
  gvm_validator_alias (validator, "role_ids:value", "id_optional");
  gvm_validator_alias (validator, "roles", "optional_number");
  gvm_validator_alias (validator, "period", "optional_number");
  gvm_validator_alias (validator, "period_unit", "calendar_unit");
  gvm_validator_alias (validator, "scanner_host", "hostpath");
  gvm_validator_alias (validator, "scanner_type", "number");
  gvm_validator_alias (validator, "schedules_only", "boolean");
  gvm_validator_alias (validator, "schedule_periods", "number");
  gvm_validator_alias (validator, "select:name", "family");
  gvm_validator_alias (validator, "setting_id", "id");
  gvm_validator_alias (validator, "show_all", "boolean");
  gvm_validator_alias (validator, "slave_id", "id");
  gvm_validator_alias (validator, "smb_credential_id", "credential_id");
  gvm_validator_alias (validator, "snmp_credential_id", "credential_id");
  gvm_validator_alias (validator, "ssh_credential_id", "credential_id");
  gvm_validator_alias (validator, "subgroup_column", "group_column");
  gvm_validator_alias (validator, "subject_id", "id");
  gvm_validator_alias (validator, "subject_id_optional", "id_optional");
  gvm_validator_alias (validator, "subtype", "asset_type");
  gvm_validator_alias (validator, "start_time", "isodate");
  gvm_validator_alias (validator, "task_uuid", "optional_id");
  gvm_validator_alias (validator, "ticket_id", "id");
  gvm_validator_alias (validator, "timeout", "boolean");
  gvm_validator_alias (validator, "tls_certificate_id", "id");
  gvm_validator_alias (validator, "trend:name", "family");
  gvm_validator_alias (validator, "trust", "boolean");
  gvm_validator_alias (validator, "user_id", "id");
  gvm_validator_alias (validator, "user_id_optional", "id_optional");
  gvm_validator_alias (validator, "xml", "boolean");
  gvm_validator_alias (validator, "esc_filter", "filter");
}

/**
 * @brief Set a content type from a format string.
 *
 * For example set the content type to GSAD_CONTENT_TYPE_APP_DEB when given
 * format "deb".
 *
 * @param[out]  content_type  Return location for the newly set content type,
 *                            defaults to GSAD_CONTENT_TYPE_OCTET_STREAM.
 * @param[in]   format        Lowercase format string as in the respective
 *                            GMP commands.
 */
static void
content_type_from_format_string (enum content_type *content_type,
                                 const char *format)
{
  if (!format)
    *content_type = GSAD_CONTENT_TYPE_OCTET_STREAM;

  else if (strcmp (format, "deb") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_DEB;
  else if (strcmp (format, "exe") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_EXE;
  else if (strcmp (format, "html") == 0)
    *content_type = GSAD_CONTENT_TYPE_TEXT_HTML;
  else if (strcmp (format, "key") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_KEY;
  else if (strcmp (format, "nbe") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_NBE;
  else if (strcmp (format, "pdf") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_PDF;
  else if (strcmp (format, "rpm") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_RPM;
  else if (strcmp (format, "xml") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_XML;
  else
    *content_type = GSAD_CONTENT_TYPE_OCTET_STREAM;
}

/**
 * @brief Free resources.
 *
 * Used as free callback for HTTP daemon.
 *
 * @param[in]  cls         Dummy parameter.
 * @param[in]  connection  Connection.
 * @param[in]  con_cls     Connection information.
 * @param[in]  toe         Dummy parameter.
 */
void
free_resources (void *cls, struct MHD_Connection *connection, void **con_cls,
                enum MHD_RequestTerminationCode toe)
{
  struct gsad_connection_info *con_info =
    (struct gsad_connection_info *) *con_cls;

  if (NULL == con_info)
    {
      g_debug ("con_info was NULL!\n");
      return;
    }

  g_debug ("connectiontype=%d\n", con_info->connectiontype);

  if (con_info->connectiontype == 1)
    {
      if (NULL != con_info->postprocessor)
        {
          MHD_destroy_post_processor (con_info->postprocessor);
        }
    }

  params_free (con_info->params);
  g_free (con_info->cookie);
  g_free (con_info->language);
  g_free (con_info);
  *con_cls = NULL;
}

/**
 * @brief Append a chunk to a request parameter.
 *
 * @param[in]   params        Request parameters.
 * @param[out]  name          Parameter.
 * @param[out]  filename      Filename if uploaded file.
 * @param[in]   chunk_data    Incoming chunk data.
 * @param[out]  chunk_size    Size of chunk.
 * @param[out]  chunk_offset  Offset into all data.
 *
 * @return MHD_YES on success, MHD_NO on error.
 */
int
params_append_mhd (params_t *params, const char *name, const char *filename,
                   const char *chunk_data, int chunk_size, int chunk_offset)
{
  if ((strncmp (name, "bulk_selected:", strlen ("bulk_selected:")) == 0)
      || (strncmp (name, "chart_gen:", strlen ("chart_gen:")) == 0)
      || (strncmp (name, "chart_init:", strlen ("chart_init:")) == 0)
      || (strncmp (name, "condition_data:", strlen ("condition_data:")) == 0)
      || (strncmp (name, "data_columns:", strlen ("data_columns:")) == 0)
      || (strncmp (name, "event_data:", strlen ("event_data:")) == 0)
      || (strncmp (name, "settings_changed:", strlen ("settings_changed:"))
          == 0)
      || (strncmp (name, "settings_default:", strlen ("settings_default:"))
          == 0)
      || (strncmp (name, "settings_filter:", strlen ("settings_filter:")) == 0)
      || (strncmp (name, "exclude_file:", strlen ("exclude_file:")) == 0)
      || (strncmp (name, "file:", strlen ("file:")) == 0)
      || (strncmp (name, "include_id_list:", strlen ("include_id_list:")) == 0)
      || (strncmp (name, "parameter:", strlen ("parameter:")) == 0)
      || (strncmp (name, "password:", strlen ("password:")) == 0)
      || (strncmp (name, "preference:", strlen ("preference:")) == 0)
      || (strncmp (name, "select:", strlen ("select:")) == 0)
      || (strncmp (name, "text_columns:", strlen ("text_columns:")) == 0)
      || (strncmp (name, "trend:", strlen ("trend:")) == 0)
      || (strncmp (name, "method_data:", strlen ("method_data:")) == 0)
      || (strncmp (name, "nvt:", strlen ("nvt:")) == 0)
      || (strncmp (name, "alert_id_optional:", strlen ("alert_id_optional:"))
          == 0)
      || (strncmp (name, "group_id_optional:", strlen ("group_id_optional:"))
          == 0)
      || (strncmp (name, "role_id_optional:", strlen ("role_id_optional:"))
          == 0)
      || (strncmp (name, "related:", strlen ("related:")) == 0)
      || (strncmp (name, "sort_fields:", strlen ("sort_fields:")) == 0)
      || (strncmp (name, "sort_orders:", strlen ("sort_orders:")) == 0)
      || (strncmp (name, "sort_stats:", strlen ("sort_stats:")) == 0)
      || (strncmp (name, "y_fields:", strlen ("y_fields:")) == 0)
      || (strncmp (name, "z_fields:", strlen ("z_fields:")) == 0))
    {
      param_t *param;
      const char *colon;
      gchar *prefix;

      colon = strchr (name, ':');

      /* Hashtable param, like for radios. */

      if ((colon - name) == (strlen (name) - 1))
        {
          /* name: "example:", value "abc". */

          params_append_bin (params, name, chunk_data, chunk_size,
                             chunk_offset);

          return MHD_YES;
        }

      /* name: "nvt:1.3.6.1.4.1.25623.1.0.105058", value "1". */

      prefix = g_strndup (name, 1 + colon - name);
      param = params_get (params, prefix);

      if (param == NULL)
        {
          param = params_add (params, prefix, "");
          param->values = params_new ();
        }
      else if (param->values == NULL)
        param->values = params_new ();

      g_free (prefix);

      params_append_bin (param->values, colon + 1, chunk_data, chunk_size,
                         chunk_offset);
      if (filename)
        param->filename = g_strdup (filename);

      return MHD_YES;
    }

  /*
   * Array param
   * Can be accessed like a hashtable param,with ascending numbers as the
   *  key, which are automatically generated instead of being part of the
   *  full name.
   * For example multiple instances of "x:" in the request
   *  become "x:1", "x:2", "x:3", etc.
   */
  if ((strcmp (name, "alert_ids:") == 0) || (strcmp (name, "role_ids:") == 0)
      || (strcmp (name, "group_ids:") == 0)
      || (strcmp (name, "report_format_ids:") == 0)
      || (strcmp (name, "id_list:") == 0)
      || (strcmp (name, "resource_ids:") == 0))
    {
      param_t *param;
      gchar *index_str;

      param = params_get (params, name);

      if (param == NULL)
        {
          param = params_add (params, name, "");
          param->values = params_new ();
        }
      else if (param->values == NULL)
        param->values = params_new ();

      if (chunk_offset == 0)
        param->array_len += 1;

      index_str = g_strdup_printf ("%d", param->array_len);

      params_append_bin (param->values, index_str, chunk_data, chunk_size,
                         chunk_offset);

      g_free (index_str);

      if (filename)
        param->filename = g_strdup (filename);

      return MHD_YES;
    }

  /* Single value param. */

  params_append_bin (params, name, chunk_data, chunk_size, chunk_offset);

  return MHD_YES;
}

/**
 * @brief Validate param values.
 *
 * @param[in]  parent_name  Name of the parent param.
 * @param[in]  params       Values.
 */
void
params_mhd_validate_values (const char *parent_name, void *params)
{
  params_iterator_t iter;
  param_t *param;
  gchar *name, *name_name, *value_name;

  name_name = g_strdup_printf ("%sname", parent_name);
  value_name = g_strdup_printf ("%svalue", parent_name);

  params_iterator_init (&iter, params);
  while (params_iterator_next (&iter, &name, &param))
    {
      gchar *item_name;

      if ((g_utf8_validate (name, -1, NULL) == FALSE))
        {
          param->original_value = param->value;
          param->value = NULL;
          param->value_size = 0;
          param->valid = 0;
          param->valid_utf8 = 0;
          item_name = NULL;
        }
      /* Item specific value validator like "method_data:to_adddress:". */
      else
        switch (gvm_validate (
          validator, (item_name = g_strdup_printf ("%s%s:", parent_name, name)),
          param->value))
          {
          case 0:
            param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
            break;
          case 1:
            /* General name validator for collection like "method_data:name". */
            if (gvm_validate (validator, name_name, name))
              {
                param->original_value = param->value;
                param->value = NULL;
                param->value_size = 0;
                param->valid = 0;
                param->valid_utf8 = 0;
              }
            /* General value validator like "method_data:value". */
            else if (gvm_validate (validator, value_name, param->value))
              {
                param->original_value = param->value;
                param->value = NULL;
                param->value_size = 0;
                param->valid = 0;
                param->valid_utf8 = 0;
              }
            else
              {
                const gchar *alias_for;

                param->valid = 1;
                param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);

                alias_for = gvm_validator_alias_for (validator, name);
                if ((param->value && (strcmp ((gchar *) name, "number") == 0))
                    || (alias_for
                        && (strcmp ((gchar *) alias_for, "number") == 0)))
                  /* Remove any leading or trailing space from numbers. */
                  param->value = g_strstrip (param->value);
              }
            break;
          case 2:
          default:
            {
              param->original_value = param->value;
              param->value = NULL;
              param->value_size = 0;
              param->valid = 0;
              param->valid_utf8 = 0;
            }
          }

      g_free (item_name);
    }

  g_free (name_name);
  g_free (value_name);
}

/**
 * @brief Validate params.
 *
 * @param[in]  params  Params.
 */
void
params_mhd_validate (void *params)
{
  GHashTableIter iter;
  gpointer name, value;

  g_hash_table_iter_init (&iter, params);
  while (g_hash_table_iter_next (&iter, &name, &value))
    {
      param_t *param;
      param = (param_t *) value;

      param->valid_utf8 =
        (g_utf8_validate (name, -1, NULL)
         && (param->value == NULL || g_utf8_validate (param->value, -1, NULL)));

      if ((!g_str_has_prefix (name, "osp_pref_")
           && gvm_validate (validator, name, param->value)))
        {
          param->original_value = param->value;
          param->value = NULL;
          param->valid = 0;
          param->valid_utf8 = 0;
        }
      else
        {
          const gchar *alias_for;

          param->valid = 1;

          alias_for = gvm_validator_alias_for (validator, name);
          if ((param->value && (strcmp ((gchar *) name, "number") == 0))
              || (alias_for && (strcmp ((gchar *) alias_for, "number") == 0)))
            /* Remove any leading or trailing space from numbers. */
            param->value = g_strstrip (param->value);
        }

      if (param->values)
        params_mhd_validate_values (name, param->values);
    }
}

/**
 * @brief Add else branch for an GMP operation.
 */
#define ELSE(name)                                  \
  else if (!strcmp (cmd, G_STRINGIFY (name))) res = \
    name##_gmp (&connection, credentials, con_info->params, response_data);

/**
 * @brief Handle a complete POST request.
 *
 * Ensures there is a command, then depending on the command validates
 * parameters and calls the appropriate GMP function (like
 * create_task_gmp).
 *
 * @param[in]   con             HTTP connection
 * @param[in]   con_info        Connection info.
 * @param[in]   client_address  Client address.
 *
 * @return MHD_YES on success, MHD_NO on error.
 */
int
exec_gmp_post (http_connection_t *con, gsad_connection_info_t *con_info,
               const char *client_address)
{
  int ret;
  user_t *user;
  credentials_t *credentials = NULL;
  gchar *res = NULL, *new_sid = NULL;
  const gchar *cmd, *caller, *language;
  gvm_connection_t connection;
  cmd_response_data_t *response_data = cmd_response_data_new ();

  params_mhd_validate (con_info->params);

  cmd = params_value (con_info->params, "cmd");

  if (!cmd)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);

      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred inside GSA daemon. "
                          "Diagnostics: Invalid command.",
                          response_data);
      return handler_create_response (con, res, response_data, new_sid);
    }

  if (str_equal (cmd, "login"))
    {
      return login (con, con_info->params, response_data, client_address);
    }

  /* Check the session. */

  if (params_value (con_info->params, "token") == NULL)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);

      if (params_given (con_info->params, "token") == 0)
        res = gsad_message (NULL, "Internal error", __func__, __LINE__,
                            "An internal error occurred inside GSA daemon. "
                            "Diagnostics: Token missing.",
                            response_data);
      else
        res = gsad_message (NULL, "Internal error", __func__, __LINE__,
                            "An internal error occurred inside GSA daemon. "
                            "Diagnostics: Token bad.",
                            response_data);

      return handler_create_response (con, res, response_data, NULL);
    }

  ret = user_find (con_info->cookie, params_value (con_info->params, "token"),
                   client_address, &user);
  if (ret == USER_BAD_TOKEN)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      res = gsad_message (NULL, "Internal error", __func__, __LINE__,
                          "An internal error occurred inside GSA daemon. "
                          "Diagnostics: Bad token.",
                          response_data);
      return handler_create_response (con, res, response_data, NULL);
    }

  if (ret == USER_EXPIRED_TOKEN)
    {
      caller = params_value (con_info->params, "caller");

      if (caller && g_utf8_validate (caller, -1, NULL) == FALSE)
        {
          caller = NULL;
          g_warning ("%s - caller is not valid UTF-8", __func__);
        }

      /* @todo Validate caller. */

      cmd_response_data_free (response_data);

      return handler_send_reauthentication (con, MHD_HTTP_UNAUTHORIZED,
                                            SESSION_EXPIRED);
    }

  if (ret == USER_BAD_MISSING_COOKIE || ret == USER_IP_ADDRESS_MISSMATCH)
    {
      cmd_response_data_free (response_data);

      return handler_send_reauthentication (con, MHD_HTTP_UNAUTHORIZED,
                                            BAD_MISSING_COOKIE);
    }

  if (ret == USER_GMP_DOWN)
    {
      cmd_response_data_free (response_data);

      return handler_send_reauthentication (con, MHD_HTTP_SERVICE_UNAVAILABLE,
                                            GMP_SERVICE_DOWN);
    }

  /* From here, the user is authenticated. */

  /* The caller of a POST is usually the caller of the page that the POST form
   * was on. */
  language =
    user_get_language (user) ?: con_info->language ?: DEFAULT_GSAD_LANGUAGE;

  credentials = credentials_new (user, language);

  credentials_start_cmd (credentials);

  new_sid = g_strdup (user_get_cookie (user));

  /* Set the timezone. */

  const gchar *timezone = user_get_timezone (user);
  if (timezone)
    {
      if (setenv ("TZ", timezone, 1) == -1)
        {
          g_critical ("%s: failed to set TZ\n", __func__);
          exit (EXIT_FAILURE);
        }
      tzset ();
    }

  /* Connect to manager */
  switch (manager_connect (credentials, &connection, response_data))
    {
    case 0:
      break;
    case 1: /* manager closed connection */
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not connect to manager daemon. "
                          "Manager closed the connection.",
                          response_data);
      break;
    case 2: /* auth failed */
      cmd_response_data_free (response_data);
      return handler_send_reauthentication (con, MHD_HTTP_UNAUTHORIZED,
                                            LOGIN_FAILED);
    case 3: /* timeout */
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not connect to manager daemon. "
                          "Connection timeout.",
                          response_data);
      break;
    case 4: /* can't connect to manager */
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_SERVICE_UNAVAILABLE);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not connect to manager daemon. "
                          "Could not open a connection.",
                          response_data);
      break;
    default: /* unknown error */
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not connect to manager daemon. "
                          "Unknown error.",
                          response_data);
    }

  if (res)
    {
      return handler_create_response (con, res, response_data, NULL);
    }

  /* always renew session for http post */
  user_renew_session (user);
  session_add_user (user_get_token (user), user);

  /* Handle the usual commands. */
  if (0)
    {
    }
  ELSE (bulk_delete)
  ELSE (bulk_export)
  ELSE (clone)
  ELSE (create_alert)
  ELSE (create_asset)
  ELSE (create_config)
  ELSE (create_container_task)
  ELSE (create_credential)
  ELSE (create_filter)
  ELSE (create_group)
  ELSE (create_host)
  ELSE (create_note)
  ELSE (create_override)
  ELSE (create_permission)
  ELSE (create_permissions)
  ELSE (create_port_list)
  ELSE (create_port_range)
  ELSE (create_report)
  ELSE (create_scanner)
  ELSE (create_schedule)
  ELSE (create_task)
  ELSE (create_tag)
  ELSE (create_target)
  ELSE (create_ticket)
  ELSE (create_tls_certificate)
  ELSE (create_user)
  ELSE (create_role)
  ELSE (delete_asset)
  ELSE (delete_alert)
  ELSE (delete_config)
  ELSE (delete_credential)
  ELSE (delete_filter)
  ELSE (delete_from_trash)
  ELSE (delete_group)
  ELSE (delete_note)
  ELSE (delete_override)
  ELSE (delete_permission)
  ELSE (delete_port_list)
  ELSE (delete_port_range)
  ELSE (delete_report)
  ELSE (delete_report_format)
  ELSE (delete_role)
  ELSE (delete_scanner)
  ELSE (delete_schedule)
  ELSE (delete_tag)
  ELSE (delete_target)
  ELSE (delete_task)
  ELSE (delete_ticket)
  ELSE (delete_tls_certificate)
  ELSE (delete_user)
  ELSE (empty_trashcan)
  ELSE (import_config)
  ELSE (import_port_list)
  ELSE (import_report_format)
  ELSE (move_task)
  ELSE (renew_session)
  ELSE (report_alert)
  ELSE (restore)
  ELSE (resume_task)
  ELSE (run_wizard)
  ELSE (save_alert)
  ELSE (save_asset)
  ELSE (save_auth)
  ELSE (save_setting)
  ELSE (save_config)
  ELSE (save_config_family)
  ELSE (save_config_nvt)
  ELSE (save_credential)
  ELSE (save_filter)
  ELSE (save_group)
  else if (!strcmp (cmd, "save_my_settings"))
  {
    res = save_my_settings_gmp (&connection, credentials, con_info->params,
                                con_info->language, response_data);
  }
  ELSE (save_note)
  ELSE (save_override)
  ELSE (save_permission)
  ELSE (save_port_list)
  ELSE (save_report_format)
  ELSE (save_role)
  ELSE (save_scanner)
  ELSE (save_schedule)
  ELSE (save_tag)
  ELSE (save_target)
  ELSE (save_task)
  ELSE (save_ticket)
  ELSE (save_container_task)
  ELSE (save_tls_certificate)
  ELSE (save_user)
  ELSE (start_task)
  ELSE (stop_task)
  ELSE (sync_feed)
  ELSE (sync_scap)
  ELSE (sync_cert)
  ELSE (test_alert)
  ELSE (toggle_tag)
  ELSE (verify_scanner)
  else
  {
    cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
    res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                        "An internal error occurred inside GSA daemon. "
                        "Diagnostics: Unknown command.",
                        response_data);
  }

  ret = handler_create_response (con, res, response_data, new_sid);

  user_free (user);
  credentials_free (credentials);
  gvm_connection_close (&connection);
  g_free (new_sid);

  return ret;
}

/**
 * @brief Add a param.
 *
 * @param[in]  params  Params.
 * @param[in]  kind    MHD header kind.
 * @param[in]  name    Name.
 * @param[in]  value   Value.
 */
#if MHD_VERSION < 0x00097002
int
#else
enum MHD_Result
#endif
params_mhd_add (void *params, enum MHD_ValueKind kind, const char *name,
                const char *value)
{
  if ((strncmp (name, "bulk_selected:", strlen ("bulk_selected:")) == 0)
      || (strncmp (name, "chart_gen:", strlen ("chart_gen:")) == 0)
      || (strncmp (name, "chart_init:", strlen ("chart_init:")) == 0)
      || (strncmp (name, "condition_data:", strlen ("condition_data:")) == 0)
      || (strncmp (name, "data_columns:", strlen ("data_columns:")) == 0)
      || (strncmp (name, "event_data:", strlen ("event_data:")) == 0)
      || (strncmp (name, "settings_changed:", strlen ("settings_changed:"))
          == 0)
      || (strncmp (name, "settings_default:", strlen ("settings_default:"))
          == 0)
      || (strncmp (name, "settings_filter:", strlen ("settings_filter:")) == 0)
      || (strncmp (name, "exclude_file:", strlen ("exclude_file:")) == 0)
      || (strncmp (name, "file:", strlen ("file:")) == 0)
      || (strncmp (name, "include_id_list:", strlen ("include_id_list:")) == 0)
      || (strncmp (name, "parameter:", strlen ("parameter:")) == 0)
      || (strncmp (name, "password:", strlen ("password:")) == 0)
      || (strncmp (name, "preference:", strlen ("preference:")) == 0)
      || (strncmp (name, "select:", strlen ("select:")) == 0)
      || (strncmp (name, "text_columns:", strlen ("text_columns:")) == 0)
      || (strncmp (name, "trend:", strlen ("trend:")) == 0)
      || (strncmp (name, "method_data:", strlen ("method_data:")) == 0)
      || (strncmp (name, "nvt:", strlen ("nvt:")) == 0)
      || (strncmp (name, "alert_id_optional:", strlen ("alert_id_optional:"))
          == 0)
      || (strncmp (name, "group_id_optional:", strlen ("group_id_optional:"))
          == 0)
      || (strncmp (name, "role_id_optional:", strlen ("role_id_optional:"))
          == 0)
      || (strncmp (name, "related:", strlen ("related:")) == 0)
      || (strncmp (name, "sort_fields:", strlen ("sort_fields:")) == 0)
      || (strncmp (name, "sort_orders:", strlen ("sort_orders:")) == 0)
      || (strncmp (name, "sort_stats:", strlen ("sort_stats:")) == 0)
      || (strncmp (name, "y_fields:", strlen ("y_fields:")) == 0)
      || (strncmp (name, "z_fields:", strlen ("z_fields:")) == 0))
    {
      param_t *param;
      const char *colon;
      gchar *prefix;

      /* Hashtable param, like for radios. */

      colon = strchr (name, ':');

      if ((colon - name) == (strlen (name) - 1))
        {
          params_append_bin (params, name, value, strlen (value), 0);

          return MHD_YES;
        }

      prefix = g_strndup (name, 1 + colon - name);
      param = params_get (params, prefix);

      if (param == NULL)
        {
          param = params_add (params, prefix, "");
          param->values = params_new ();
        }
      else if (param->values == NULL)
        param->values = params_new ();

      g_free (prefix);

      params_append_bin (param->values, colon + 1, value, strlen (value), 0);

      return MHD_YES;
    }

  /*
   * Array param (See params_append_mhd for a description)
   */
  if ((strcmp (name, "alert_ids:") == 0) || (strcmp (name, "role_ids:") == 0)
      || (strcmp (name, "group_ids:") == 0)
      || (strcmp (name, "report_format_ids:") == 0)
      || (strcmp (name, "id_list:") == 0))
    {
      param_t *param;
      gchar *index_str;

      param = params_get (params, name);

      if (param == NULL)
        {
          param = params_add (params, name, "");
          param->values = params_new ();
        }
      else if (param->values == NULL)
        param->values = params_new ();

      param->array_len += 1;

      index_str = g_strdup_printf ("%d", param->array_len);

      params_append_bin (param->values, index_str, value, strlen (value), 0);

      g_free (index_str);

      return MHD_YES;
    }

  /* Single value param. */

  params_add ((params_t *) params, name, value);
  return MHD_YES;
}

/*
 * Connection watcher thread data
 */
typedef struct
{
  int client_socket_fd;
  gvm_connection_t *gvm_connection;
  int connection_closed;
  pthread_mutex_t mutex;
} connection_watcher_data_t;

/**
 * @brief  Create a new connection watcher thread data structure.
 *
 * @param[in]  gvm_connection   GVM connection to close if client conn. closes.
 * @param[in]  client_socket_fd File descriptor of client connection to watch.
 *
 * @return  Newly allocated watcher thread data.
 */
static connection_watcher_data_t *
connection_watcher_data_new (gvm_connection_t *gvm_connection,
                             int client_socket_fd)
{
  connection_watcher_data_t *watcher_data;
  watcher_data = g_malloc (sizeof (connection_watcher_data_t));

  watcher_data->gvm_connection = gvm_connection;
  watcher_data->client_socket_fd = client_socket_fd;
  watcher_data->connection_closed = 0;
  pthread_mutex_init (&(watcher_data->mutex), NULL);

  return watcher_data;
}

/**
 * @brief   Thread start routine watching the client connection.
 *
 * @param[in] data  The connection data watcher struct.
 *
 * @return  Always NULL.
 */
static void *
watch_client_connection (void *data)
{
  int active;
  connection_watcher_data_t *watcher_data;

  pthread_setcancelstate (PTHREAD_CANCEL_DISABLE, NULL);
  watcher_data = (connection_watcher_data_t *) data;

  pthread_mutex_lock (&(watcher_data->mutex));
  active = 1;
  pthread_mutex_unlock (&(watcher_data->mutex));

  while (active)
    {
      pthread_setcancelstate (PTHREAD_CANCEL_ENABLE, NULL);
      sleep (client_watch_interval);
      pthread_setcancelstate (PTHREAD_CANCEL_DISABLE, NULL);

      pthread_mutex_lock (&(watcher_data->mutex));

      if (watcher_data->connection_closed)
        {
          active = 0;
          pthread_mutex_unlock (&(watcher_data->mutex));
          continue;
        }
      int ret;
      char buf[1];
      errno = 0;
      ret = recv (watcher_data->client_socket_fd, buf, 1, MSG_PEEK);

      if (ret >= 0)
        {
          if (watcher_data->connection_closed == 0)
            {
              watcher_data->connection_closed = 1;
              active = 0;
              g_debug ("%s: Client connection closed", __func__);

              if (watcher_data->gvm_connection->tls)
                {
                  gvm_connection_t *gvm_conn;
                  gvm_conn = watcher_data->gvm_connection;
                  gnutls_bye (gvm_conn->session, GNUTLS_SHUT_RDWR);
                }
              else
                {
                  gvm_connection_close (watcher_data->gvm_connection);
                }
            }
        }

      pthread_mutex_unlock (&(watcher_data->mutex));
    }

  return NULL;
}

#undef ELSE

/**
 * @brief Add else branch for an GMP operation.
 */
#define ELSE(name)                                  \
  else if (!strcmp (cmd, G_STRINGIFY (name))) res = \
    name##_gmp (&connection, credentials, params, response_data);

/**
 * @brief Handle a complete GET request.
 *
 * After some input checking, depending on the cmd parameter of the connection,
 * issue an gmp command (via *_gmp functions).
 *
 * @param[in]   con                  HTTP Connection
 * @param[in]   con_info             Connection info.
 * @param[in]   credentials          User credentials.
 *
 * @return MHD_YES on success, MHD_NO on error.
 */
int
exec_gmp_get (http_connection_t *con, gsad_connection_info_t *con_info,
              credentials_t *credentials)
{
  const char *cmd = NULL;
  const int CMD_MAX_SIZE = 27; /* delete_trash_lsc_credential */
  params_t *params = con_info->params;
  gvm_connection_t connection;
  char *res = NULL;
  gsize res_len = 0;
  http_response_t *response;
  cmd_response_data_t *response_data;
  pthread_t watch_thread;
  connection_watcher_data_t *watcher_data;

  response_data = cmd_response_data_new ();

  cmd = params_value (params, "cmd");

  if (gvm_validate (validator, "cmd", cmd))
    cmd = NULL;

  if ((cmd != NULL) && (strlen (cmd) <= CMD_MAX_SIZE))
    {
      g_debug ("cmd: [%s]\n", cmd);
    }
  else
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred inside GSA daemon. "
                          "Diagnostics: No valid command for gmp.",
                          response_data);
      return handler_create_response (con, res, response_data, NULL);
    }

  /* Set the timezone. */

  user_t *user = credentials_get_user (credentials);
  const gchar *timezone = user_get_timezone (user);

  if (timezone)
    {
      if (setenv ("TZ", timezone, 1) == -1)
        {
          g_critical ("%s: failed to set TZ\n", __func__);
          exit (EXIT_FAILURE);
        }
      tzset ();
    }

  /* Connect to manager */
  switch (manager_connect (credentials, &connection, response_data))
    {
    case 0:
      break;
    case 1: /* manager closed connection */
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not connect to manager daemon. "
                          "Manager closed the connection.",
                          response_data);
      break;
    case 2: /* auth failed */
      cmd_response_data_free (response_data);
      return handler_send_reauthentication (con, MHD_HTTP_UNAUTHORIZED,
                                            LOGIN_FAILED);
    case 3: /* timeout */
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not connect to manager daemon. "
                          "Connection timeout.",
                          response_data);
      break;
    case 4: /* can't connect to manager */
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_SERVICE_UNAVAILABLE);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not connect to manager daemon. "
                          "Could not open a connection.",
                          response_data);
      break;
    default: /* unknown error */
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not connect to manager daemon. "
                          "Unknown error.",
                          response_data);
    }

  if (res)
    {
      return handler_create_response (con, res, response_data, NULL);
    }

  /* Set page display settings */

  credentials_start_cmd (credentials);

  if (client_watch_interval)
    {
      const union MHD_ConnectionInfo *mhd_con_info;
      mhd_con_info =
        MHD_get_connection_info (con, MHD_CONNECTION_INFO_CONNECTION_FD);

      watcher_data =
        connection_watcher_data_new (&connection, mhd_con_info->connect_fd);

      pthread_create (&watch_thread, NULL, watch_client_connection,
                      watcher_data);
    }
  else
    {
      watcher_data = NULL;
    }

  /* Check cmd and precondition, start respective GMP command(s). */

  if (!strcmp (cmd, "cvss_calculator"))
    res = cvss_calculator (&connection, credentials, params, response_data);

  ELSE (auth_settings)
  ELSE (edit_alert)
  ELSE (edit_config_family)
  ELSE (export_alert)
  ELSE (export_alerts)
  ELSE (export_asset)
  ELSE (export_assets)
  ELSE (export_config)
  ELSE (export_configs)

  else if (!strcmp (cmd, "download_credential"))
  {
    char *html;
    gchar *credential_login;
    const char *credential_id;
    const char *package_format;
    char *content_disposition;
    content_type_t content_type = GSAD_CONTENT_TYPE_OCTET_STREAM;

    package_format = params_value (params, "package_format");
    credential_login = NULL;
    credential_id = params_value (params, "credential_id");

    if (download_credential_gmp (&connection, credentials, params, &html,
                                 &credential_login, response_data)
        == 0)
      {
        content_type_from_format_string (&content_type, package_format);

        content_disposition = g_strdup_printf (
          "attachment; filename=credential-%s.%s",
          (credential_login && strcmp (credential_login, "")) ? credential_login
                                                              : credential_id,
          (strcmp (package_format, "key") == 0 ? "pub" : package_format));
        cmd_response_data_set_content_disposition (response_data,
                                                   content_disposition);
        cmd_response_data_set_content_type (response_data, content_type);
      }

    g_free (credential_login);

    res = html;
  }

  ELSE (export_credential)
  ELSE (export_credentials)
  ELSE (export_filter)
  ELSE (export_filters)
  ELSE (export_group)
  ELSE (export_groups)
  ELSE (export_note)
  ELSE (export_notes)
  ELSE (export_override)
  ELSE (export_overrides)
  ELSE (export_permission)
  ELSE (export_permissions)
  ELSE (export_port_list)
  ELSE (export_port_lists)
  ELSE (export_preference_file)
  ELSE (export_report_format)
  ELSE (export_report_formats)
  ELSE (export_result)
  ELSE (export_results)
  ELSE (export_role)
  ELSE (export_roles)
  ELSE (export_scanner)
  ELSE (export_scanners)
  ELSE (export_schedule)
  ELSE (export_schedules)
  ELSE (export_tag)
  ELSE (export_tags)
  ELSE (export_target)
  ELSE (export_targets)
  ELSE (export_task)
  ELSE (export_tasks)
  ELSE (export_user)
  ELSE (export_users)
  ELSE (get_asset)
  ELSE (get_assets)

  else if (!strcmp (cmd, "download_ssl_cert"))
  {
    cmd_response_data_set_content_type (response_data,
                                        GSAD_CONTENT_TYPE_APP_KEY);
    cmd_response_data_set_content_disposition (
      response_data, g_strdup_printf ("attachment; filename=ssl-cert-%s.pem",
                                      params_value (params, "name")));

    res = download_ssl_cert (&connection, credentials, params, response_data);
  }

  else if (!strcmp (cmd, "download_ca_pub"))
  {
    cmd_response_data_set_content_type (response_data,
                                        GSAD_CONTENT_TYPE_APP_KEY);
    cmd_response_data_set_content_disposition (
      response_data,
      g_strdup_printf ("attachment; filename=scanner-ca-pub-%s.pem",
                       params_value (params, "scanner_id")));
    res = download_ca_pub (&connection, credentials, params, response_data);
  }

  else if (!strcmp (cmd, "download_key_pub"))
  {
    cmd_response_data_set_content_type (response_data,
                                        GSAD_CONTENT_TYPE_APP_KEY);
    cmd_response_data_set_content_disposition (
      response_data,
      g_strdup_printf ("attachment; filename=scanner-key-pub-%s.pem",
                       params_value (params, "scanner_id")));
    res = download_key_pub (&connection, credentials, params, response_data);
  }

  ELSE (get_aggregate)
  ELSE (get_alert)
  ELSE (get_alerts)
  ELSE (get_capabilities)
  ELSE (get_config)
  ELSE (get_configs)
  ELSE (get_config_family)
  ELSE (get_config_nvt)
  ELSE (get_credential)
  ELSE (get_credentials)
  ELSE (get_feeds)
  ELSE (get_filter)
  ELSE (get_filters)
  ELSE (get_group)
  ELSE (get_groups)
  ELSE (get_info)
  ELSE (get_note)
  ELSE (get_notes)
  ELSE (get_nvt_families)
  ELSE (get_override)
  ELSE (get_overrides)
  ELSE (get_permission)
  ELSE (get_permissions)
  ELSE (get_port_list)
  ELSE (get_port_lists)
  ELSE (get_report)
  ELSE (get_reports)
  ELSE (get_result)
  ELSE (get_results)
  ELSE (get_report_format)
  ELSE (get_report_formats)
  ELSE (get_role)
  ELSE (get_roles)
  ELSE (get_scanner)
  ELSE (get_scanners)
  ELSE (get_schedule)
  ELSE (get_schedules)
  ELSE (get_setting)
  ELSE (get_settings)
  ELSE (get_system_reports)
  ELSE (get_tag)
  ELSE (get_tags)
  ELSE (get_target)
  ELSE (get_targets)
  ELSE (get_task)
  ELSE (get_tasks)
  ELSE (get_ticket)
  ELSE (get_tickets)
  ELSE (get_tls_certificate)
  ELSE (get_tls_certificates)
  ELSE (get_trash)
  ELSE (get_user)
  ELSE (get_users)
  ELSE (get_vulns)
  ELSE (new_alert)
  ELSE (ping)
  ELSE (wizard)
  ELSE (wizard_get)

  else
  {
    cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
    res = gsad_message (credentials, "Internal error", __func__, __LINE__,
                        "An internal error occurred inside GSA daemon. "
                        "Diagnostics: Unknown command.",
                        response_data);
  }

  res_len = cmd_response_data_get_content_length (response_data);

  if (res_len == 0)
    res_len = strlen (res);

  response = MHD_create_response_from_buffer (res_len, (void *) res,
                                              MHD_RESPMEM_MUST_FREE);

  if (watcher_data)
    {
      pthread_mutex_lock (&(watcher_data->mutex));
      if (watcher_data->connection_closed == 0
          || watcher_data->gvm_connection->tls)
        {
          gvm_connection_close (watcher_data->gvm_connection);
        }
      watcher_data->connection_closed = 1;
      pthread_mutex_unlock (&(watcher_data->mutex));
      pthread_cancel (watch_thread);
      pthread_join (watch_thread, NULL);
      g_free (watcher_data);
    }
  else
    {
      gvm_connection_close (&connection);
    }

  return handler_send_response (con, response, response_data,
                                user_get_cookie (user));
}

/**
 * @brief HTTP request handler for GSAD.
 *
 * This routine is an MHD_AccessHandlerCallback, the request handler for
 * microhttpd.
 *
 * @param[in]  cls              Not used for this callback.
 * @param[in]  connection       Connection handle, e.g. used to send response.
 * @param[in]  url              The URL requested.
 * @param[in]  method           "GET" or "POST", others are disregarded.
 * @param[in]  version          Not used for this callback.
 * @param[in]  upload_data      Data used for POST requests.
 * @param[in]  upload_data_size Size of upload_data.
 * @param[out] con_cls          For exchange of connection-related data
 *                              (here a struct gsad_connection_info).
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 */
#if MHD_VERSION < 0x00097002
static int
#else
static enum MHD_Result
#endif
redirect_handler (void *cls, struct MHD_Connection *connection, const char *url,
                  const char *method, const char *version,
                  const char *upload_data, size_t *upload_data_size,
                  void **con_cls)
{
  gchar *location;
  const char *host;
  char name[MAX_HOST_LEN + 1];

  /* Never respond on first call of a GET. */
  if ((!strcmp (method, "GET")) && *con_cls == NULL)
    {
      struct gsad_connection_info *con_info;

      /* Freed by MHD_OPTION_NOTIFY_COMPLETED callback, free_resources. */
      con_info = g_malloc0 (sizeof (struct gsad_connection_info));
      con_info->params = params_new ();
      con_info->connectiontype = 2;

      *con_cls = (void *) con_info;
      return MHD_YES;
    }

  /* If called with undefined URL, abort request handler. */
  if (&url[0] == NULL)
    return MHD_NO;

  /* Only accept GET and POST methods and send ERROR_PAGE in other cases. */
  if (strcmp (method, "GET") && strcmp (method, "POST"))
    {
      send_response (connection, ERROR_PAGE, MHD_HTTP_NOT_ACCEPTABLE, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  /* Redirect every URL to the default file on the HTTPS port. */
  host = MHD_lookup_connection_value (connection, MHD_HEADER_KIND, "Host");
  if (host && g_utf8_validate (host, -1, NULL) == FALSE)
    {
      send_response (connection, UTF8_ERROR_PAGE ("'Host' header"),
                     MHD_HTTP_BAD_REQUEST, NULL, GSAD_CONTENT_TYPE_TEXT_HTML,
                     NULL, 0);
      return MHD_YES;
    }
  else if (host == NULL)
    return MHD_NO;

  /* [IPv6 or IPv4-mapped IPv6]:port */
  if (sscanf (host, "[%" G_STRINGIFY (MAX_HOST_LEN) "[0-9a-f:.]]:%*i", name)
      == 1)
    {
      char *name6 = g_strdup_printf ("[%s]", name);
      location = g_strdup_printf (redirect_location, name6);
      g_free (name6);
    }
  /* IPv4:port */
  else if (sscanf (host, "%" G_STRINGIFY (MAX_HOST_LEN) "[^:]:%*i", name) == 1)
    location = g_strdup_printf (redirect_location, name);
  else
    location = g_strdup_printf (redirect_location, host);
  if (send_redirect_to_uri (connection, location, NULL) == MHD_NO)
    {
      g_free (location);
      return MHD_NO;
    }
  g_free (location);
  return MHD_YES;
}

/**
 * @brief Attempt to drop privileges (become another user).
 *
 * @param[in]  user_pw  User details of new user.
 *
 * @return TRUE if successful, FALSE if failed (will g_critical in fail case).
 */
static gboolean
drop_privileges (struct passwd *user_pw)
{
  if (setgroups (0, NULL))
    {
      g_critical ("%s: failed to set groups: %s\n", __func__,
                  strerror (errno));
      return FALSE;
    }
  if (setgid (user_pw->pw_gid))
    {
      g_critical ("%s: failed to drop group privileges: %s\n", __func__,
                  strerror (errno));
      return FALSE;
    }
  if (setuid (user_pw->pw_uid))
    {
      g_critical ("%s: failed to drop user privileges: %s\n", __func__,
                  strerror (errno));
      return FALSE;
    }

  return TRUE;
}

/**
 * @brief Chroot and drop privileges, if requested.
 *
 * @param[in]  do_chroot  Whether to chroot.
 * @param[in]  drop       Username to drop privileges to.  Null for no dropping.
 * @param[in]  subdir     Subdirectory of GSAD_DATA_DIR to chroot or chdir to.
 *
 * @return 0 success, 1 failed (will g_critical in fail case).
 */
static int
chroot_drop_privileges (gboolean do_chroot, gchar *drop, const gchar *subdir)
{
  struct passwd *user_pw;

  if (drop)
    {
      user_pw = getpwnam (drop);
      if (user_pw == NULL)
        {
          g_critical ("%s: Failed to drop privileges."
                      "  Could not determine UID and GID for user \"%s\"!\n",
                      __func__, drop);
          return 1;
        }
    }
  else
    user_pw = NULL;

  if (do_chroot)
    {
      /* Chroot into state dir. */

      if (chroot (GSAD_DATA_DIR))
        {
          g_critical ("%s: Failed to chroot to \"%s\": %s\n", __func__,
                      GSAD_DATA_DIR, strerror (errno));
          return 1;
        }
      set_chroot_state (1);
    }

  if (user_pw && (drop_privileges (user_pw) == FALSE))
    {
      g_critical ("%s: Failed to drop privileges\n", __func__);
      return 1;
    }

  if (do_chroot)
    {
      gchar *root_dir = g_build_filename ("/", subdir, NULL);
      if (chdir (root_dir))
        {
          g_critical ("%s: failed change to chroot root directory (%s): %s\n",
                      __func__, root_dir, strerror (errno));
          g_free (root_dir);
          return 1;
        }
      g_free (root_dir);
    }
  else
    {
      gchar *data_dir = g_build_filename (GSAD_DATA_DIR, subdir, NULL);
      if (chdir (data_dir))
        {
          g_critical ("%s: failed to change to \"%s\": %s\n", __func__,
                      data_dir, strerror (errno));
          g_free (data_dir);
          return 1;
        }
      g_free (data_dir);
    }

  return 0;
}

/**
 * @brief Log function callback used for GNUTLS debugging
 *
 * This is used only for debugging, thus we write to stderr.
 *
 * Fixme: It would be nice if we could use the regular log functions
 * but the order of initialization in gsad is a bit strange.
 */
static void
my_gnutls_log_func (int level, const char *text)
{
  fprintf (stderr, "[%d] (%d) %s", getpid (), level, text);
  if (*text && text[strlen (text) - 1] != '\n')
    putc ('\n', stderr);
}

/**
 * @brief Initialization routine for GSAD.
 *
 * This routine checks for required files and initializes the gcrypt
 * library.
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 */
int
gsad_init ()
{
  g_debug ("Initializing the Greenbone Security Assistant...\n");

  /* Init user ssessions. */
  session_init ();

  /* Check for required files. */
  if (gvm_file_check_is_dir (GSAD_DATA_DIR) < 1)
    {
      g_critical ("%s: Could not access %s!\n", __func__, GSAD_DATA_DIR);
      return MHD_NO;
    }

    /* Init GCRYPT. */
    /* Register thread callback structure for libgcrypt < 1.6.0. */
#if GCRYPT_VERSION_NUMBER < 0x010600
  gcry_control (GCRYCTL_SET_THREAD_CBS, &gcry_threads_pthread);
#endif

  /* Version check should be the very first call because it makes sure that
   * important subsystems are initialized.
   * We pass NULL to gcry_check_version to disable the internal version mismatch
   * test. */
  if (!gcry_check_version (NULL))
    {
      g_critical ("%s: libgcrypt version check failed\n", __func__);
      return MHD_NO;
    }

  /* We don't want to see any warnings, e.g. because we have not yet parsed
   * program options which might be used to suppress such warnings. */
  gcry_control (GCRYCTL_SUSPEND_SECMEM_WARN);

  /* ... If required, other initialization goes here.  Note that the process
   * might still be running with increased privileges and that the secure
   * memory has not been initialized. */

  /* Allocate a pool of 16k secure memory.  This make the secure memory
   * available and also drops privileges where needed. */
  gcry_control (GCRYCTL_INIT_SECMEM, 16384, 0);

  /* It is now okay to let Libgcrypt complain when there was/is a problem with
   * the secure memory. */
  gcry_control (GCRYCTL_RESUME_SECMEM_WARN);

  /* ... If required, other initialization goes here. */

  /* Tell Libgcrypt that initialization has completed. */
  gcry_control (GCRYCTL_INITIALIZATION_FINISHED, 0);

  /* Init GNUTLS. */
  int ret = gnutls_global_init ();
  if (ret < 0)
    {
      g_critical ("%s: Failed to initialize GNUTLS.\n", __func__);
      return MHD_NO;
    }

  /* Init the validator. */
  init_validator ();

  g_debug ("Initialization of GSA successful.\n");
  return MHD_YES;
}

/**
 * @brief Cleanup routine for GSAD.
 *
 * This routine will stop the http server, free log resources
 * and remove the pidfile.
 */
void
gsad_cleanup ()
{
  if (redirect_pid)
    kill (redirect_pid, SIGTERM);
  if (unix_pid)
    kill (unix_pid, SIGTERM);

  MHD_stop_daemon (gsad_daemon);

  cleanup_http_handlers ();

  if (log_config)
    free_log_configuration (log_config);

  gsad_base_cleanup ();

  pidfile_remove ("gsad");
}

/**
 * @brief Handle a SIGINT signal.
 *
 * @param[in]  signal  The signal that caused this function to run.
 */
void
handle_signal_exit (int signal)
{
  termination_signal = signal;
}

/**
 * @brief Register the signal handlers.
 *
 * @todo Use sigaction () instead of signal () to register signal handlers.
 *
 * @return 0 on success, -1 on failure.
 */
static int
register_signal_handlers ()
{
  if (signal (SIGTERM, handle_signal_exit) == SIG_ERR
      || signal (SIGINT, handle_signal_exit) == SIG_ERR
      || signal (SIGHUP, SIG_IGN) == SIG_ERR
      || signal (SIGPIPE, SIG_IGN) == SIG_ERR
      || signal (SIGCHLD, SIG_IGN) == SIG_ERR)
    return -1;
  return 0;
}

static void
mhd_logger (void *arg, const char *fmt, va_list ap)
{
  char buf[1024];

  vsnprintf (buf, sizeof (buf), fmt, ap);
  va_end (ap);
  g_warning ("MHD: %s", buf);
}

static struct MHD_Daemon *
start_unix_http_daemon (const char *unix_socket_path,
#if MHD_VERSION < 0x00097002
                        int handler (void *, struct MHD_Connection *,
                                     const char *, const char *, const char *,
                                     const char *, size_t *, void **),
#else
                        enum MHD_Result handler (void *,
                                                 struct MHD_Connection *,
                                                 const char *, const char *,
                                                 const char *, const char *,
                                                 size_t *, void **),
#endif
                        http_handler_t *http_handlers)
{
  struct sockaddr_un addr;
  struct stat ustat;
  mode_t oldmask = 0;

  int unix_socket = socket (AF_UNIX, SOCK_STREAM, 0);

  set_unix_socket (unix_socket);

  if (unix_socket == -1)
    {
      g_warning ("%s: Couldn't create UNIX socket", __func__);
      return NULL;
    }

  memset (&addr, 0, sizeof (struct sockaddr_un));

  addr.sun_family = AF_UNIX;
  strncpy (addr.sun_path, unix_socket_path, sizeof (addr.sun_path) - 1);
  if (!stat (addr.sun_path, &ustat))
    {
      /* Remove socket so we can bind(). Keep same permissions when recreating
       * it. */
      unlink (addr.sun_path);
      oldmask = umask (~ustat.st_mode);
    }
  if (bind (unix_socket, (struct sockaddr *) &addr, sizeof (struct sockaddr_un))
      == -1)
    {
      g_warning ("%s: Error on bind(%s): %s", __func__, unix_socket_path,
                 strerror (errno));
      return NULL;
    }
  if (oldmask)
    umask (oldmask);
  if (listen (unix_socket, 128) == -1)
    {
      g_warning ("%s: Error on listen(): %s", __func__, strerror (errno));
      return NULL;
    }

  return MHD_start_daemon (
    MHD_USE_THREAD_PER_CONNECTION | MHD_USE_INTERNAL_POLLING_THREAD
      | MHD_USE_DEBUG,
    0, NULL, NULL, handler, http_handlers, MHD_OPTION_NOTIFY_COMPLETED,
    free_resources, NULL, MHD_OPTION_LISTEN_SOCKET, unix_socket,
    MHD_OPTION_PER_IP_CONNECTION_LIMIT, get_per_ip_connection_limit (),
    MHD_OPTION_EXTERNAL_LOGGER, mhd_logger, NULL, MHD_OPTION_END);
}

static struct MHD_Daemon *
start_http_daemon (int port,
#if MHD_VERSION < 0x00097002
                   int handler (void *, struct MHD_Connection *, const char *,
                                const char *, const char *, const char *,
                                size_t *, void **),
#else
                   enum MHD_Result handler (void *, struct MHD_Connection *,
                                            const char *, const char *,
                                            const char *, const char *,
                                            size_t *, void **),
#endif
                   http_handler_t *http_handlers,
                   struct sockaddr_storage *address)
{
  unsigned int flags;
  int ipv6_flag;

  if (address->ss_family == AF_INET6)
/* LibmicroHTTPD 0.9.28 and higher. */
#if MHD_VERSION >= 0x00092800
    ipv6_flag = MHD_USE_DUAL_STACK;
#else
    ipv6_flag = MHD_USE_IPv6;
#endif
  else
    ipv6_flag = MHD_NO_FLAG;

  flags =
    MHD_USE_THREAD_PER_CONNECTION | MHD_USE_INTERNAL_POLLING_THREAD | ipv6_flag;
#ifndef NDEBUG
  flags = flags | MHD_USE_DEBUG;
#endif

  return MHD_start_daemon (
    flags, port, NULL, NULL, handler, http_handlers,
    MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL, MHD_OPTION_SOCK_ADDR,
    address, MHD_OPTION_PER_IP_CONNECTION_LIMIT, get_per_ip_connection_limit (),
    MHD_OPTION_EXTERNAL_LOGGER, mhd_logger, NULL, MHD_OPTION_END);
}

static struct MHD_Daemon *
start_https_daemon (int port, const char *key, const char *cert,
                    const char *priorities, const char *dh_params,
                    http_handler_t *http_handlers,
                    struct sockaddr_storage *address)
{
  unsigned int flags;
  int ipv6_flag;

  if (address->ss_family == AF_INET6)
/* LibmicroHTTPD 0.9.28 and higher. */
#if MHD_VERSION >= 0x00092800
    ipv6_flag = MHD_USE_DUAL_STACK;
#else
    ipv6_flag = MHD_USE_IPv6;
#endif
  else
    ipv6_flag = MHD_NO_FLAG;

  flags = MHD_USE_THREAD_PER_CONNECTION | MHD_USE_INTERNAL_POLLING_THREAD
          | MHD_USE_SSL | ipv6_flag;
#ifndef NDEBUG
  flags = flags | MHD_USE_DEBUG;
#endif

  return MHD_start_daemon (
    flags, port, NULL, NULL, &handle_request, http_handlers,
    MHD_OPTION_HTTPS_MEM_KEY, key, MHD_OPTION_HTTPS_MEM_CERT, cert,
    MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL, MHD_OPTION_SOCK_ADDR,
    address, MHD_OPTION_PER_IP_CONNECTION_LIMIT, get_per_ip_connection_limit (),
    MHD_OPTION_HTTPS_PRIORITIES, priorities, MHD_OPTION_EXTERNAL_LOGGER,
    mhd_logger, NULL,
/* LibmicroHTTPD 0.9.35 and higher. */
#if MHD_VERSION >= 0x00093500
    dh_params ? MHD_OPTION_HTTPS_MEM_DHPARAMS : MHD_OPTION_END, dh_params,
#endif
    MHD_OPTION_END);
}

/**
 * @brief Set port to listen on.
 *
 * @param[in]  address          Address struct for which to set the port.
 * @param[in]  port             Port to listen on.
 */
static void
gsad_address_set_port (struct sockaddr_storage *address, int port)
{
  struct sockaddr_in *gsad_address = (struct sockaddr_in *) address;
  struct sockaddr_in6 *gsad_address6 = (struct sockaddr_in6 *) address;

  gsad_address->sin_port = htons (port);
  gsad_address6->sin6_port = htons (port);
}

/**
 * @brief Initializes the address to listen on.
 *
 * @param[in]  address_str      Address to listen on.
 * @param[in]  port             Port to listen on.
 *
 * @return 0 on success, 1 on failure.
 */
static int
gsad_address_init (const char *address_str, int port)
{
  struct sockaddr_storage *address = g_malloc0 (sizeof (*address));
  struct sockaddr_in *gsad_address = (struct sockaddr_in *) address;
  struct sockaddr_in6 *gsad_address6 = (struct sockaddr_in6 *) address;

  gsad_address_set_port (address, port);
  if (address_str)
    {
      if (inet_pton (AF_INET6, address_str, &gsad_address6->sin6_addr) > 0)
        address->ss_family = AF_INET6;
      else if (inet_pton (AF_INET, address_str, &gsad_address->sin_addr) > 0)
        address->ss_family = AF_INET;
      else
        {
          g_warning ("Failed to create GSAD address %s", address_str);
          g_free (address);
          return 1;
        }
    }
  else
    {
      gsad_address->sin_addr.s_addr = INADDR_ANY;
      gsad_address6->sin6_addr = in6addr_any;
      if (ipv6_is_enabled ())
        address->ss_family = AF_INET6;
      else
        address->ss_family = AF_INET;
    }
  address_list = g_slist_append (address_list, address);
  return 0;
}

/**
 * @brief Main routine of Greenbone Security Assistant daemon.
 *
 * @param[in]  argc  Argument counter
 * @param[in]  argv  Argument vector
 *
 * @return EXIT_SUCCESS on success, else EXIT_FAILURE.
 */
int
main (int argc, char **argv)
{
  gchar *rc_name;
  int gsad_port;
  int gsad_redirect_port = DEFAULT_GSAD_REDIRECT_PORT;
  int gsad_manager_port = DEFAULT_GVM_PORT;
  sigset_t sigmask_all, sigmask_current;

  /* Initialise. */

  if (gsad_init () == MHD_NO)
    {
      g_critical ("%s: Initialization failed!\nExiting...\n", __func__);
      exit (EXIT_FAILURE);
    }

  /* Process command line options. */

  static gboolean do_chroot = FALSE;
  static gchar *drop = NULL;
  static gboolean foreground = FALSE;
  static gboolean http_only = FALSE;
  static gboolean print_version = FALSE;
  static gboolean no_redirect = FALSE;
  static gboolean secure_cookie = FALSE;
  static int timeout = SESSION_TIMEOUT;
  static gchar **gsad_address_string = NULL;
  static gchar *gsad_manager_address_string = NULL;
  static gchar *gsad_manager_unix_socket_path = NULL;
  static gchar *gsad_port_string = NULL;
  static gchar *gsad_redirect_port_string = NULL;
  static gchar *gsad_manager_port_string = NULL;
  static gchar *gsad_vendor_version_string = NULL;
  static gchar *ssl_private_key_filename = GVM_SERVER_KEY;
  static gchar *ssl_certificate_filename = GVM_SERVER_CERTIFICATE;
  static gchar *dh_params_filename = NULL;
  static gchar *unix_socket_path = NULL;
  static gchar *gnutls_priorities = "NORMAL";
  static int debug_tls = 0;
  static gchar *http_frame_opts = DEFAULT_GSAD_X_FRAME_OPTIONS;
  static gchar *http_csp = DEFAULT_GSAD_CONTENT_SECURITY_POLICY;
  static int hsts_enabled = FALSE;
  static int hsts_max_age = DEFAULT_GSAD_HSTS_MAX_AGE;
  static gchar *http_cors = "";
  static gboolean ignore_x_real_ip = FALSE;
  static int per_ip_connection_limit = DEFAULT_GSAD_PER_IP_CONNECTION_LIMIT;
  static int verbose = 0;
  GError *error = NULL;
  GOptionContext *option_context;
  static GOptionEntry option_entries[] = {
    {"drop-privileges", '\0', 0, G_OPTION_ARG_STRING, &drop,
     "Drop privileges to <user>.", "<user>"},
    {"foreground", 'f', 0, G_OPTION_ARG_NONE, &foreground, "Run in foreground.",
     NULL},
    {"http-only", '\0', 0, G_OPTION_ARG_NONE, &http_only,
     "Serve HTTP only, without SSL.", NULL},
    /** @todo This is 'a' in Manager. */
    {"listen", '\0', 0, G_OPTION_ARG_STRING_ARRAY, &gsad_address_string,
     "Listen on <address>.", "<address>"},
    {"mlisten", '\0', 0, G_OPTION_ARG_STRING, &gsad_manager_address_string,
     "Manager address.", "<address>"},
    {"port", 'p', 0, G_OPTION_ARG_STRING, &gsad_port_string,
     "Use port number <number>.", "<number>"},
    {"mport", 'm', 0, G_OPTION_ARG_STRING, &gsad_manager_port_string,
     "Use manager port number <number>.", "<number>"},
    {"rport", 'r', 0, G_OPTION_ARG_STRING, &gsad_redirect_port_string,
     "Redirect HTTP from this port number <number>.", "<number>"},
    {"no-redirect", '\0', 0, G_OPTION_ARG_NONE, &no_redirect,
     "Don't redirect HTTP to HTTPS.", NULL},
    {"verbose", 'v', 0, G_OPTION_ARG_NONE, &verbose,
     "Has no effect.  See INSTALL for logging config.", NULL},
    {"version", 'V', 0, G_OPTION_ARG_NONE, &print_version,
     "Print version and exit.", NULL},
    {"vendor-version", '\0', 0, G_OPTION_ARG_STRING,
     &gsad_vendor_version_string, "Use <string> as version in interface.",
     "<string>"},
    {"ssl-private-key", 'k', 0, G_OPTION_ARG_FILENAME,
     &ssl_private_key_filename, "Use <file> as the private key for HTTPS",
     "<file>"},
    {"ssl-certificate", 'c', 0, G_OPTION_ARG_FILENAME,
     &ssl_certificate_filename, "Use <file> as the certificate for HTTPS",
     "<file>"},
    {"dh-params", '\0', 0, G_OPTION_ARG_FILENAME, &dh_params_filename,
     "Diffie-Hellman parameters file", "<file>"},
    {"do-chroot", '\0', 0, G_OPTION_ARG_NONE, &do_chroot, "Do chroot.", NULL},
    {"secure-cookie", '\0', 0, G_OPTION_ARG_NONE, &secure_cookie,
     "Use a secure cookie (implied when using HTTPS).", NULL},
    {"timeout", '\0', 0, G_OPTION_ARG_INT, &timeout,
     "Minutes of user idle time before session expires. Defaults "
     "to " G_STRINGIFY (SESSION_TIMEOUT) " minutes",
     "<number>"},
    {"client-watch-interval", '\0', 0, G_OPTION_ARG_INT, &client_watch_interval,
     "Check if client connection was closed every <number> seconds."
     " 0 to disable. Defaults to " G_STRINGIFY (
       DEFAULT_CLIENT_WATCH_INTERVAL) " seconds.",
     "<number>"},
    {"debug-tls", 0, 0, G_OPTION_ARG_INT, &debug_tls,
     "Enable TLS debugging at <level>", "<level>"},
    {"gnutls-priorities", '\0', 0, G_OPTION_ARG_STRING, &gnutls_priorities,
     "GnuTLS priorities string.", "<string>"},
    {"http-frame-opts", 0, 0, G_OPTION_ARG_STRING, &http_frame_opts,
     "X-Frame-Options HTTP header.  Defaults to \"" DEFAULT_GSAD_X_FRAME_OPTIONS
     "\".",
     "<frame-opts>"},
    {"http-csp", 0, 0, G_OPTION_ARG_STRING, &http_csp,
     "Content-Security-Policy HTTP header.  Defaults to "
     "\"" DEFAULT_GSAD_CONTENT_SECURITY_POLICY "\".",
     "<csp>"},
    {"http-sts", 0, 0, G_OPTION_ARG_NONE, &hsts_enabled,
     "Enable HTTP Strict-Tranport-Security header.", NULL},
    {"http-sts-max-age", 0, 0, G_OPTION_ARG_INT, &hsts_max_age,
     "max-age in seconds for HTTP Strict-Tranport-Security header."
     "  Defaults to \"" G_STRINGIFY (DEFAULT_GSAD_HSTS_MAX_AGE) "\".",
     "<max-age>"},
    {"ignore-x-real-ip", '\0', 0, G_OPTION_ARG_NONE, &ignore_x_real_ip,
     "Do not use X-Real-IP to determine the client address.", NULL},
    {"per-ip-connection-limit", '\0', 0, G_OPTION_ARG_INT,
     &per_ip_connection_limit,
     "Sets the maximum number of connections per ip. Use 0 for unlimited.",
     "<number>"},
    {"unix-socket", '\0', 0, G_OPTION_ARG_FILENAME, &unix_socket_path,
     "Path to unix socket to listen on", "<file>"},
    {"munix-socket", '\0', 0, G_OPTION_ARG_FILENAME,
     &gsad_manager_unix_socket_path, "Path to Manager unix socket", "<file>"},
    {"http-cors", 0, 0, G_OPTION_ARG_STRING, &http_cors,
     "Set Cross-Origin Resource Sharing (CORS) allow origin http header ",
     "<cors>"},
    {NULL}};

  option_context =
    g_option_context_new ("- Greenbone Security Assistant Daemon");

  g_option_context_set_summary (option_context, COPYRIGHT);

  g_option_context_add_main_entries (option_context, option_entries, NULL);
  if (!g_option_context_parse (option_context, &argc, &argv, &error))
    {
      g_critical ("%s: %s\n\n", __func__, error->message);
      exit (EXIT_FAILURE);
    }
  g_option_context_free (option_context);

  set_http_x_frame_options (http_frame_opts);
  set_http_content_security_policy (http_csp);
  set_http_cors_origin (http_cors);

  set_http_only (!!http_only);

  if (http_only == FALSE && hsts_enabled)
    {
      set_http_strict_transport_security (g_strdup_printf (
        "max-age=%d",
        hsts_max_age >= 0 ? hsts_max_age : DEFAULT_GSAD_HSTS_MAX_AGE));
    }
  else
    set_http_strict_transport_security (NULL);

  set_ignore_http_x_real_ip (ignore_x_real_ip);

  if (per_ip_connection_limit >= 0)
    set_per_ip_connection_limit (per_ip_connection_limit);
  else
    set_per_ip_connection_limit (DEFAULT_GSAD_PER_IP_CONNECTION_LIMIT);

  if (register_signal_handlers ())
    {
      g_critical ("Failed to register signal handlers!\n");
      exit (EXIT_FAILURE);
    }

  if (print_version)
    {
      printf ("Greenbone Security Assistant %s\n", GSAD_VERSION);
      if (debug_tls)
        {
          printf ("gnutls %s\n", gnutls_check_version (NULL));
          printf ("libmicrohttpd %s\n", MHD_get_version ());
        }
      exit (EXIT_SUCCESS);
    }

  if (debug_tls)
    {
      gnutls_global_set_log_function (my_gnutls_log_func);
      gnutls_global_set_log_level (debug_tls);
    }

  switch (gsad_base_init ())
    {
    case 1:
      g_critical ("%s: libxml must be compiled with thread support\n",
                  __func__);
      exit (EXIT_FAILURE);
    }

  if (gsad_vendor_version_string)
    vendor_version_set (gsad_vendor_version_string);

  if (no_redirect && gsad_redirect_port_string)
    {
      g_warning ("--no-redirect option given with --rport");
      return 1;
    }

  /* Switch to UTC for scheduling. */

  if (setenv ("TZ", "utc 0", 1) == -1)
    {
      g_critical ("%s: failed to set timezone\n", __func__);
      exit (EXIT_FAILURE);
    }
  tzset ();

  /* Setup logging. */

  rc_name = g_build_filename (GSAD_CONFIG_DIR, "gsad_log.conf", NULL);
  if (g_file_test (rc_name, G_FILE_TEST_EXISTS))
    log_config = load_log_configuration (rc_name);
  g_free (rc_name);
  setup_log_handlers (log_config);
  /* Set to ensure that recursion is left out, in case two threads log
   * concurrently. */
  g_log_set_always_fatal (G_LOG_FATAL_MASK);
  /* Enable GNUTLS debugging if requested via env variable.  */
  {
    const char *s;
    if ((s = getenv ("GVM_GNUTLS_DEBUG")))
      {
        gnutls_global_set_log_function (log_func_for_gnutls);
        gnutls_global_set_log_level (atoi (s));
      }
  }

  g_message ("Starting GSAD version %s\n", GSAD_VERSION);

  /* Finish processing the command line options. */

  set_use_secure_cookie (secure_cookie);

  if ((timeout < 1) || (timeout > MAX_SESSION_TIMEOUT))
    {
      g_critical ("%s: Timeout must be a number from 1 to %d\n", __func__,
                  MAX_SESSION_TIMEOUT);
      exit (EXIT_FAILURE);
    }

  set_session_timeout (timeout);

  if (client_watch_interval < 0)
    {
      client_watch_interval = 0;
    }

  gsad_port = http_only ? DEFAULT_GSAD_HTTP_PORT : DEFAULT_GSAD_HTTPS_PORT;

  if (gsad_port_string)
    {
      gsad_port = atoi (gsad_port_string);
      if (gsad_port <= 0 || gsad_port >= 65536)
        {
          g_critical ("%s: Port must be a number between 0 and 65536\n",
                      __func__);
          exit (EXIT_FAILURE);
        }
    }

  if (gsad_manager_port_string)
    {
      gsad_manager_port = atoi (gsad_manager_port_string);
      if (gsad_manager_port <= 0 || gsad_manager_port >= 65536)
        {
          g_critical ("%s: Manager port must be a number between 0 and 65536\n",
                      __func__);
          exit (EXIT_FAILURE);
        }
    }

  if (gsad_redirect_port_string)
    {
      gsad_redirect_port = atoi (gsad_redirect_port_string);
      if (gsad_redirect_port <= 0 || gsad_redirect_port >= 65536)
        {
          g_critical (
            "%s: Redirect port must be a number between 0 and 65536\n",
            __func__);
          exit (EXIT_FAILURE);
        }
    }

  if (foreground == FALSE)
    {
      /* Fork into the background. */
      g_debug ("Forking...\n");
      pid_t pid = fork ();
      switch (pid)
        {
        case 0:
          /* Child. */
          break;
        case -1:
          /* Parent when error. */
          g_critical ("%s: Failed to fork!\n", __func__);
          exit (EXIT_FAILURE);
          break;
        default:
          /* Parent. */
          exit (EXIT_SUCCESS);
          break;
        }
    }

  if (http_only)
    no_redirect = TRUE;

  if (!no_redirect)
    {
      /* Fork for the redirect server. */
      g_debug ("Forking for redirect...\n");
      pid_t pid = fork ();
      switch (pid)
        {
        case 0:
          /* Child. */
#if __linux
          if (prctl (PR_SET_PDEATHSIG, SIGKILL))
            g_warning ("%s: Failed to change parent death signal;"
                       " redirect process will remain if parent is killed:"
                       " %s\n",
                       __func__, strerror (errno));
#endif
          redirect_location = g_strdup_printf ("https://%%s:%i/", gsad_port);
          break;
        case -1:
          /* Parent when error. */
          g_critical ("%s: Failed to fork for redirect!\n", __func__);
          exit (EXIT_FAILURE);
          break;
        default:
          /* Parent. */
          redirect_pid = pid;
          no_redirect = TRUE;
          break;
        }
    }

  /* Register the cleanup function. */

  if (atexit (&gsad_cleanup))
    {
      g_critical ("%s: Failed to register cleanup function!\n", __func__);
      exit (EXIT_FAILURE);
    }

  /* Write pidfile. */

  if (pidfile_create ("gsad"))
    {
      g_critical ("%s: Could not write PID file.\n", __func__);
      exit (EXIT_FAILURE);
    }

  if (gsad_address_string)
    while (*gsad_address_string)
      {
        if (gsad_address_init (*gsad_address_string, gsad_port))
          return 1;
        gsad_address_string++;
      }
  else if (gsad_address_init (NULL, gsad_port))
    return 1;

  http_handler_t *handlers = init_http_handlers ();

  if (!no_redirect)
    {
      GSList *list = address_list;
      /* Start the HTTP to HTTPS redirect server. */

      while (list)
        {
          gsad_address_set_port (list->data, gsad_redirect_port);
          gsad_daemon = start_http_daemon (gsad_redirect_port, redirect_handler,
                                           NULL, list->data);
          list = list->next;
        }

      if (gsad_daemon == NULL)
        {
          g_warning ("%s: start_http_daemon redirect failed !", __func__);
          return EXIT_FAILURE;
        }
      else
        {
          g_debug ("GSAD started successfully and is redirecting on port %d.\n",
                   gsad_redirect_port);
        }
    }
  else if (unix_socket_path && !unix_pid)
    {
      /* Start the unix socket server. */

      gmp_init (gsad_manager_unix_socket_path, gsad_manager_address_string,
                gsad_manager_port);

      gsad_daemon =
        start_unix_http_daemon (unix_socket_path, handle_request, handlers);

      if (gsad_daemon == NULL)
        {
          g_warning ("%s: start_unix_http_daemon failed !", __func__);
          return EXIT_FAILURE;
        }
      else
        {
          g_debug ("GSAD started successfully and is listening on unix"
                   " socket %s.\n",
                   unix_socket_path);
        }
    }
  else
    {
      /* Start the real server. */

      gmp_init (gsad_manager_unix_socket_path, gsad_manager_address_string,
                gsad_manager_port);

      if (http_only)
        {
          GSList *list = address_list;

          while (list)
            {
              gsad_daemon = start_http_daemon (gsad_port, handle_request,
                                               handlers, list->data);
              if (gsad_daemon == NULL && gsad_port_string == NULL)
                {
                  g_warning ("Binding to port %d failed, trying default port"
                             " %d next.",
                             gsad_port, DEFAULT_GSAD_PORT);
                  gsad_port = DEFAULT_GSAD_PORT;
                  gsad_address_set_port (list->data, gsad_port);
                  gsad_daemon = start_http_daemon (gsad_port, handle_request,
                                                   handlers, list->data);
                }
              list = list->next;
            }
        }
      else
        {
          gchar *ssl_private_key = NULL;
          gchar *ssl_certificate = NULL;
          gchar *dh_params = NULL;
          GSList *list = address_list;

          set_use_secure_cookie (1);

          if (!g_file_get_contents (ssl_private_key_filename, &ssl_private_key,
                                    NULL, &error))
            {
              g_critical ("%s: Could not load private SSL key from %s: %s\n",
                          __func__, ssl_private_key_filename,
                          error->message);
              g_error_free (error);
              exit (EXIT_FAILURE);
            }

          if (!g_file_get_contents (ssl_certificate_filename, &ssl_certificate,
                                    NULL, &error))
            {
              g_critical ("%s: Could not load SSL certificate from %s: %s\n",
                          __func__, ssl_certificate_filename,
                          error->message);
              g_error_free (error);
              exit (EXIT_FAILURE);
            }

          if (dh_params_filename
              && !g_file_get_contents (dh_params_filename, &dh_params, NULL,
                                       &error))
            {
              g_critical ("%s: Could not load SSL certificate from %s: %s\n",
                          __func__, dh_params_filename, error->message);
              g_error_free (error);
              exit (EXIT_FAILURE);
            }

          while (list)
            {
              gsad_daemon = start_https_daemon (
                gsad_port, ssl_private_key, ssl_certificate, gnutls_priorities,
                dh_params, handlers, list->data);
              if (gsad_daemon == NULL && gsad_port_string == NULL)
                {
                  g_warning ("Binding to port %d failed, trying default port"
                             " %d next.",
                             gsad_port, DEFAULT_GSAD_PORT);
                  gsad_port = DEFAULT_GSAD_PORT;
                  gsad_address_set_port (list->data, gsad_port);
                  gsad_daemon = start_https_daemon (
                    gsad_port, ssl_private_key, ssl_certificate,
                    gnutls_priorities, dh_params, handlers, list->data);
                }
              list = list->next;
            }
        }

      if (gsad_daemon == NULL)
        {
          g_critical ("%s: start_https_daemon failed!\n", __func__);
          return EXIT_FAILURE;
        }
      else
        {
          g_debug ("GSAD started successfully and is listening on port %d.\n",
                   gsad_port);
        }
    }

  /* Chroot and drop privileges, if requested. */

  if (chroot_drop_privileges (do_chroot, drop, DEFAULT_WEB_DIRECTORY))
    {
      g_critical ("%s: Cannot use drop privileges for directory \"%s\"!\n",
                  __func__, DEFAULT_WEB_DIRECTORY);
      exit (EXIT_FAILURE);
    }

  /* Wait forever for input or interrupts. */

  if (sigfillset (&sigmask_all))
    {
      g_critical ("%s: Error filling signal set\n", __func__);
      exit (EXIT_FAILURE);
    }
  if (pthread_sigmask (SIG_BLOCK, &sigmask_all, &sigmask_current))
    {
      g_critical ("%s: Error setting signal mask\n", __func__);
      exit (EXIT_FAILURE);
    }
  while (1)
    {
      if (termination_signal)
        {
          g_debug ("Received %s signal.\n", strsignal (termination_signal));
          gsad_cleanup ();
          /* Raise signal again, to exit with the correct return value. */
          signal (termination_signal, SIG_DFL);
          raise (termination_signal);
        }

      if (pselect (0, NULL, NULL, NULL, NULL, &sigmask_current) == -1)
        {
          if (errno == EINTR)
            continue;
          g_critical ("%s: pselect: %s\n", __func__, strerror (errno));
          exit (EXIT_FAILURE);
        }
    }
  return EXIT_SUCCESS;
}
