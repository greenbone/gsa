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

  /* Delete pidfile. */
  char *pidfile_name = strdup (GSAD_PID_DIR "/gsad.pid");
  unlink (pidfile_name);
  free (pidfile_name);
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
      char *pidfile_name = strdup (GSAD_PID_DIR "/gsad.pid");
      FILE *pidfile = fopen (pidfile_name, "w"); /* flawfinder: ignore, this
        file is opened for writing, therefore
        no special file type is opened (the file is newly created) */
      if (pidfile == NULL)
        {
          g_critical ("%s: Unable to write pidfile!\n", __FUNCTION__);
          exit (EXIT_FAILURE);
        }
      else
        {
          fprintf (pidfile, "%d\n", getpid ());
          fclose (pidfile);
          free (pidfile_name);
        }
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
