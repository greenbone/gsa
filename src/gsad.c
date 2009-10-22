/* Greenbone Security Assistant
 * $Id$
 * Description: Main module of Greenbone Security Assistant daemon
 *
 * Authors:
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@intevation.de>
 * Chandrashekhar B <bchandra@secpod.com>
 * Matthew Mundell <matthew.mundell@intevation.de>
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
 * @file gsad.c
 * @brief Main module of Greenbone Security Assistant daemon
 *
 * This file contains the core of the GSA server process that
 * handles HTTPS requests, communication with OpenVAS-Manager via
 * OMP protocol.
 */

/**
 * @brief The Glib fatal mask, redefined to leave out G_LOG_FLAG_RECURSION.
 */
#undef G_LOG_FATAL_MASK
#define G_LOG_FATAL_MASK G_LOG_LEVEL_ERROR

#include <openvas/base/pidfile.h>

/**
 * @brief HTTP request handler for GSAD.
 *
 * @param[in]  cls              Not used for this callback. 
 * @param[in]  connection       Connection handle, e.g. used to send response.
 * @param[in]  url              The URL requested.
 * @param[in]  method           "GET" or "POST", others are disregarded.
 * @param[in]  version          Not used for this callback. 
 * @param[in]  upload_data      Data used for POST requests.
 * @param[in]  upload_data_size Size of upload_data.
 * @param[out] con_cls          For exhange of connection-related data
 *                              (here a struct gsad_connection_info).
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 *
 * This routine is the callback request handler for microhttpd.
 */
int
request_handler (void *cls, struct MHD_Connection *connection,
                 const char *url, const char *method,
                 const char *version, const char *upload_data,
                 size_t * upload_data_size, void **con_cls)
{
  char *url_base = "/";
  char *cgi_base = "/omp";
  char *default_file = "/login/login.html";

  struct MHD_Response *response;
  int ret;
  FILE *file;
  char *path;
  char *res;
  credentials_t *credentials;

  /* Never respond on first call of a GET. */
  if ((!strcmp (method, "GET")) && *con_cls == NULL)
    {
      struct gsad_connection_info *con_info;

      con_info = calloc (1, sizeof (struct gsad_connection_info));
      if (NULL == con_info)
        return MHD_NO;

      con_info->connectiontype = 2;

      *con_cls = (void *) con_info;
      return MHD_YES;
    }

  /* If called with undefined URL, abort request handler. */
  if (&url[0] == NULL)
    return MHD_NO;

  /* Only accept GET and POST methods and send ERROR_PAGE in other cases. */
  if ((0 != strcmp (method, "GET")) && (0 != strcmp (method, "POST")))
    send_response (connection, ERROR_PAGE, MHD_HTTP_METHOD_NOT_ACCEPTABLE);

  /* Redirect any URL not matching the base to the default file. */
  if (strcmp (&url[0], url_base) == 0)
    {
      send_redirect_header (connection, default_file);
      return MHD_YES;
    }

  /* Treat logging out specially. */
  if ((!strcmp (method, "GET"))
      && (!strncmp (&url[0], "/logout", strlen ("/logout")))) /* flawfinder: ignore,
                                                                 it is a const str */
    {
      if (is_http_authenticated (connection))
        {
          return send_http_authenticate_header (connection, REALM);
        }
      else
        {
          send_redirect_header (connection, default_file);
          return MHD_YES;
        }
    }

  /* Check for authentication. */
  if ((!is_http_authenticated (connection))
      && (strncmp (&url[0], "/login/", strlen ("/login/")))) /* flawfinder: ignore,
                                                                it is a const str */
    return send_http_authenticate_header (connection, REALM);

  credentials = get_header_credentials (connection);

  /* Set HTTP Header values. */
  MHD_get_connection_values (connection, MHD_HEADER_KIND, print_header, NULL);

  if (!strcmp (method, "GET"))
    {
      /* This is a GET request. */

      if (!strncmp (&url[0], cgi_base, strlen (cgi_base))) /* flawfinder: ignore,
                                                              it is a const str */
        {
          /* URL requests to run OMP command. */

          unsigned int res_len = 0;
          res = exec_omp_get (connection);
          if (response_size > 0)
            {
              res_len = response_size;
              response_size = 0;
            }
          else
            res_len = strlen (res);

          response = MHD_create_response_from_data (res_len,
                                                    (void *) res,
                                                    MHD_NO, MHD_YES);
          free (res);

          if (content_type != NULL)
            {
              MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                       content_type);
              content_type = NULL;
            }
          if (content_disposition != NULL)
            {
              MHD_add_response_header (response, "Content-Disposition",
                                       content_disposition);
              content_disposition = NULL;
            }
          ret = MHD_queue_response (connection, MHD_HTTP_OK, response);
          MHD_destroy_response (response);
          return MHD_YES;
        }

      /* URL does not request OMP command but perhaps a special GSAD command? */
      if (!strncmp (&url[0], "/new_task.html",
                    strlen ("/new_task.html"))) /* flawfinder: ignore,
                                                   it is a const str */
        {
          res = gsad_newtask (credentials);
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
          ret = MHD_queue_response (connection, MHD_HTTP_OK, response);
          MHD_destroy_response (response);
          return MHD_YES;
        }

      /* URL requests neither an OMP command nor a special GSAD command,
       * so it is a simple file. */

      /* FIXME: validation, URL length restriction */
      /* flawfinder: ignore, it is a const str */
      int len = strlen (GSA_STATE_DIR)
                + strlen (url) + 1;
      path = malloc (len);
      snprintf (path, len, "%s%s", GSA_STATE_DIR, url); /* flawfinder: ignore,
                                                           snprintf OK for the
                                                           scope */
      file = fopen (path, "r"); /* flawfinder: ignore, this file is just
                                   read and sent */

      /* In case the file is not found, always serve the default file. */
      if (file == NULL)
        {
          tracef ("File %s failed, ", path);
          /* flawfinder: ignore, it is a const str */
          len = strlen (GSA_STATE_DIR)
                + strlen (default_file) + 1);
          path = realloc (path, len);
          /* flawfinder: ignore, snprintf OK for the scope */
          snprintf (path, len, "%s%s", GSA_STATE_DIR, default_file);
          tracef ("trying default file <%s>.\n", path);
          file = fopen (path, "r"); /* flawfinder: ignore, this file is just
                                       read and sent */
        }

      if (file == NULL)
        {
          /* Even the default file failed. */
          tracef ("Default file failed.\n");
          send_response (connection, FILE_NOT_FOUND, MHD_HTTP_NOT_FOUND);
        }
      else
        {
          struct stat buf;
          tracef ("Default file successful.\n");
          if (stat (path, &buf))
            {
              /* File information could not be retrieved. */
              g_critical ("%s: file <%s> can not be stat'ed.\n",
                          __FUNCTION__,
                          path);
              free (path);
              return MHD_NO;
            }

          response = MHD_create_response_from_callback (buf.st_size, 32 * 1024,
                                                        &file_reader,
                                                        file,
                                                        (MHD_ContentReaderFreeCallback)
                                                        & fclose);
          ret = MHD_queue_response (connection, MHD_HTTP_OK, response);

          MHD_destroy_response (response);
          free (path);
          return MHD_YES;
        }
    }

  if (0 == strcmp (method, "POST"))
    {
      if (NULL == *con_cls)
        {
          struct gsad_connection_info *con_info;

          con_info = calloc (1, sizeof (struct gsad_connection_info));
          if (NULL == con_info)
            return MHD_NO;

          con_info->postprocessor =
            MHD_create_post_processor (connection, POSTBUFFERSIZE,
                                       serve_post, (void *) con_info);
          if (NULL == con_info->postprocessor)
            return MHD_NO;
          con_info->connectiontype = 1;
          con_info->answercode = MHD_HTTP_OK;

          *con_cls = (void *) con_info;
          return MHD_YES;
        }

      struct gsad_connection_info *con_info = *con_cls;
      if (0 != *upload_data_size)
        {
          MHD_post_process (con_info->postprocessor, upload_data,
                            *upload_data_size);
          *upload_data_size = 0;
          return MHD_YES;
        }
      exec_omp_post (credentials, con_info);
      send_response (connection, con_info->response, MHD_HTTP_OK);
      return MHD_YES;
    }
  return MHD_NO;
}

/**
 * @brief Initialization routine for GSAD.
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 *
 * This routine checks or required files and initializes the gcrypt
 * library.
 */
int
gsad_init (void)
{
  tracef ("Initializing the Greenbone Security Assistant...\n");

  /* Check for required files. */
  if (check_is_dir (GSA_STATE_DIR) < 1)
    {
      g_critical ("%s: Could not access %s!\n", __FUNCTION__, GSA_STATE_DIR);
      return MHD_NO;
    }

  /* Init GCRYPT. */
  gcry_control (GCRYCTL_SET_THREAD_CBS, &gcry_threads_pthread);

  /* Version check should be the very first call because it makes sure that
   * important subsystems are intialized. */
  if (!gcry_check_version (GCRYPT_VERSION))
    {
      g_critical ("%s: libgcrypt version mismatch\n", __FUNCTION__);
      return MHD_NO;
    }

  /* We don't want to see any warnings, e.g. because we have not yet parsed
   * program options which might be used to suppress such warnings. */
  gcry_control (GCRYCTL_SUSPEND_SECMEM_WARN);

  /* ... If required, other initialization goes here.  Note that the process
   * might still be running with increased privileges and that the secure
   * memory has not been intialized. */

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
      g_critical ("%s: Failed to initialize GNUTLS.\n", __FUNCTION__);
      return MHD_NO;
    }

  tracef ("Initialization of GSA successful.\n");
  return MHD_YES;
}

/**
 * @brief Cleanup routine for GSAD.
 *
 * This routine will stop the http server, free log resources
 * and remove the pidfile.
 */
void
gsad_cleanup (void)
{
  MHD_stop_daemon (gsad_daemon);

  if (log_config) free_log_configuration (log_config);

  pidfile_remove("gsad");
}

/**
 * @brief Handle a SIGTERM signal.
 *
 * @param[in]  signal  The signal that caused this function to run.
 */
void
handle_sigterm (int signal)
{
  exit (EXIT_SUCCESS);
}

/**
 * @brief Handle a SIGHUP signal.
 *
 * @param[in]  signal  The signal that caused this function to run.
 */
void
handle_sighup (int signal)
{
  exit (EXIT_SUCCESS);
}

/**
 * @brief Handle a SIGINT signal.
 *
 * @param[in]  signal  The signal that caused this function to run.
 */
void
handle_sigint (int signal)
{
  exit (EXIT_SUCCESS);
}

/**
 * @brief Main routine of Greenbone Security Assistant daemon.
 *
 * @param[in]  argc  Argument counter
 * @param[in]  argv  Argument vector
 */
int
main (int argc, char **argv)
{
  gchar *rc_name;
  int gsad_port = DEFAULT_GSAD_PORT;
  int gsad_administrator_port = DEFAULT_OPENVAS_ADMINISTRATOR_PORT;
  int gsad_manager_port = DEFAULT_OPENVAS_MANAGER_PORT;

  /* Initialise */

  if (gsad_init () == MHD_NO)
    {
      g_critical ("%s: Initialization failed!\nExiting...\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Process command line options */

  static gboolean foreground = FALSE;
  static gboolean print_version = FALSE;
  static gchar *gsad_port_string = NULL;
  static gchar *gsad_administrator_port_string = NULL;
  static gchar *gsad_manager_port_string = NULL;
  static gchar *ssl_private_key_filename = OPENVAS_SERVER_KEY;
  static gchar *ssl_certificate_filename = OPENVAS_SERVER_CERTIFICATE;
  GError *error = NULL;
  GOptionContext *option_context;
  static GOptionEntry option_entries[] = {
    {"foreground", 'f',
     0, G_OPTION_ARG_NONE, &foreground,
     "Run in foreground.", NULL},
    {"port", 'p',
     0, G_OPTION_ARG_STRING, &gsad_port_string,
     "Use port number <number>.", "<number>"},
    {"aport", 'a',
     0, G_OPTION_ARG_STRING, &gsad_administrator_port_string,
     "Use administrator port number <number>.", "<number>"},
    {"mport", 'm',
     0, G_OPTION_ARG_STRING, &gsad_manager_port_string,
     "Use manager port number <number>.", "<number>"},
    {"verbose", 'v',
     0, G_OPTION_ARG_NONE, &verbose,
     "Print progress messages.", NULL },
    {"version", 'V',
     0, G_OPTION_ARG_NONE, &print_version,
     "Print version and exit.", NULL},
    {"ssl-private-key", 'k',
     0, G_OPTION_ARG_FILENAME, &ssl_private_key_filename,
     "Use <file> as the private key for HTTPS", "<file>"},
    {"ssl-certificate", 'c',
     0, G_OPTION_ARG_FILENAME, &ssl_certificate_filename,
     "Use <file> as the certificate for HTTPS", "<file>"},
    {NULL}
  };

  option_context =
    g_option_context_new ("- Greenbone Security Assistant Daemon");
  g_option_context_add_main_entries (option_context, option_entries, NULL);
  if (!g_option_context_parse (option_context, &argc, &argv, &error))
    {
      g_critical ("%s: %s\n\n", __FUNCTION__, error->message);
      exit (EXIT_FAILURE);
    }

  if (print_version)
    {
      printf ("gsad %s\n", GSAD_VERSION);
      printf ("Copyright (C) 2009 Greenbone Networks GmbH\n\n");
      exit (EXIT_SUCCESS);
    }

  /* Setup logging */

  rc_name = g_build_filename (GSA_CONFIG_DIR, "gsad_log.conf", NULL);
  if (g_file_test (rc_name, G_FILE_TEST_EXISTS))
    log_config = load_log_configuration (rc_name);
  g_free (rc_name);
  setup_log_handlers (log_config);
  g_log_set_handler (G_LOG_DOMAIN, ALL_LOG_LEVELS,
                     openvas_log_func, log_config);
  g_log_set_handler ("gsad  omp", ALL_LOG_LEVELS,
                     openvas_log_func, log_config);
  g_log_set_handler (NULL, ALL_LOG_LEVELS,
                     openvas_log_func, log_config);

  /* Finish processing the command line options */

  if (gsad_port_string)
    {
      /* flawfinder: ignore, for atoi boundaries are checked properly */
      gsad_port = atoi (gsad_port_string);
      if (gsad_port <= 0 || gsad_port >= 65536)
        {
          g_critical ("%s: Port must be a number between 0 and 65536\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }

  if (gsad_manager_port_string)
    {
      /* flawfinder: ignore, for atoi boundaries are checked properly */
      gsad_manager_port = atoi (gsad_manager_port_string);
      if (gsad_manager_port <= 0 || gsad_manager_port >= 65536)
        {
          g_critical ("%s: Manager port must be a number between 0 and 65536\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }

  if (gsad_administrator_port_string)
    {
      /* flawfinder: ignore, for atoi boundaries are checked properly */
      gsad_administrator_port = atoi (gsad_administrator_port_string);
      if (gsad_administrator_port <= 0 || gsad_administrator_port >= 65536)
        {
          g_critical ("%s: Administrator port must be a number"
                      " between 0 and 65536\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }

  if (foreground == FALSE)
    {
      /* Fork into the background. */
      tracef ("Forking...\n");
      pid_t pid = fork ();
      switch (pid)
        {
        case 0:
          /* Child. */
          break;
        case -1:
          /* Parent when error. */
          g_critical ("%s: Failed to fork!\n", __FUNCTION__);
          exit (EXIT_FAILURE);
          break;
        default:
          /* Parent. */
          exit (EXIT_SUCCESS);
          break;
        }
    }

  /* Register the cleanup function */

  if (atexit (&gsad_cleanup))
    {
      g_critical ("%s: Failed to register cleanup function!\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Register the signal handlers */

  if (signal (SIGTERM, handle_sigterm) == SIG_ERR   /* RATS: ignore, only one function per signal */
      || signal (SIGINT, handle_sigint) == SIG_ERR  /* RATS: ignore, only one function per signal */
      || signal (SIGHUP, handle_sighup) == SIG_ERR) /* RATS: ignore, only one function per signal */
    {
      g_critical ("%s: Failed to register signal handlers!\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  omp_init (gsad_manager_port);
  oap_init (gsad_administrator_port);

  int use_ssl = 1;
  gchar *ssl_private_key = NULL;
  gchar *ssl_certificate = NULL;

  if (use_ssl == 0)
    {
      gsad_daemon = MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION,
                                      gsad_port, NULL, NULL, &request_handler,
                                      NULL, MHD_OPTION_NOTIFY_COMPLETED,
                                      free_resources, NULL, MHD_OPTION_END);
    }
  else
    {
      if (!g_file_get_contents (ssl_private_key_filename, &ssl_private_key,
                                NULL, NULL))
        {
          g_critical ("%s: Could not load private SSL key from %s!\n",
                      __FUNCTION__,
                      ssl_private_key_filename);
          exit (EXIT_FAILURE);
        }

      if (!g_file_get_contents (ssl_certificate_filename, &ssl_certificate,
                                NULL, NULL))
        {
          g_critical ("%s: Could not load SSL certificate from %s!\n",
                      __FUNCTION__,
                      ssl_certificate_filename);
          exit (EXIT_FAILURE);
        }

      gsad_daemon =
        MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION | MHD_USE_SSL,
                          gsad_port, NULL, NULL, &request_handler, NULL,
                          MHD_OPTION_HTTPS_MEM_KEY, ssl_private_key,
                          MHD_OPTION_HTTPS_MEM_CERT, ssl_certificate,
                          MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL,
                          MHD_OPTION_END);
    }

  if (gsad_daemon == NULL)
    {
      g_critical ("%s: MHD_start_daemon failed!\n", __FUNCTION__);
      return 1;
    }
  else
    {
      if (pidfile_create("gsad")) exit (EXIT_FAILURE);

      tracef ("GSAD started successfully and is listening on port %d.\n",
              gsad_port);
    }

  /* wait forever for input or interrupts */

  while (1)
    {
      select (0, NULL, NULL, NULL, NULL);
    }
  return 0;
}
