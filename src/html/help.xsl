<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
     <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Help documents for GSA.

Authors:
Matthew Mundell <matthew.mundell@greenbone.net>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@greenbone.net>

Copyright:
Copyright (C) 2009, 2010 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2,
or, at your option, any later version as published by the Free
Software Foundation

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<xsl:template match="help">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
       <xsl:apply-templates mode="help"/>
  </div>
</xsl:template>

<xsl:template mode="help" match="*">
  <div class="gb_window_part_center">Help: Page Not Found</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <h1>Page Not Found</h1>

      <p>
        The help page you requested could not be found. If you have followed a
        link and got this page, the location of the help page may have changed.
        In this case, please use the <a href="contents.html">table of
          contents</a> to navigate to the page you were looking for.
      </p>

      <p>
        We apologize for any inconvenience.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="about.html">
  <div class="gb_window_part_center">About GSA</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <img align="right" src="/img/gsa_splash.png"/>

      <h1>Greenbone Security Assistant Version 2.0+beta1</h1>

      <p>
      The Greenbone Security Assistant is a web-based graphical
      user interface for OpenVAS Manager. It offers a straight-forward,
      yet powerful method to manage network vulnerability scans.
      </p>

      <p>
      Copyright 2009, 2010 by Greenbone Networks GmbH,
      <a href="http://www.greenbone.net">www.greenbone.net</a>
      </p>

      <p>
      License: GNU General Public License version 2 or any later version
      (<a href="gplv2.html">full license text</a>)
      </p>

      <p>
      Contact: For updates, feature proposals and bug reports please
      contact <a href="mailto:info@greenbone.net">info@greenbone.net</a>.
      </p>

      <table width="100%"><tr><td valign="top">
      <p>
      Main Authors (in alphabetical order):
      </p>

      <ul>
      <li> Matthew Mundell </li>
      <li> Karl-Heinz Ruskowski </li>
      <li> Jan-Oliver Wagner </li>
      <li> Michael Wiegand </li>
      <li> Felix Wolfsteller </li>
      </ul>
      </td><td valign="top">
      <p>
      Supported by (in alphabetical order):
      </p>

      <table><tr valign="center">
      <td><img src="/img/bsi-logo.png"/></td>
      <td><img src="/img/gb-logo.png"/></td>
      <td><img src="/img/intevation-logo.png"/></td>
      </tr></table>

      </td></tr></table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configure_agents.html">
  <div class="gb_window_part_center">Help: Configure Agents</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_agents">Jump to dialog</a></div>
    <div style="text-align:left">
      <br/>
      <h1>Configure Agents</h1>
      <p>
       This feature allows to store agent tools.
       Basically it is a store with integrated signature verification.
       Agents can be downloaded from here for manual installation on
       target systems. This agents feature is unrelated to other
       elements of the user interface.
      </p>

      <a name="new_agent"></a>
      <h2>New Agent</h2>
      <p>
       For creating an agent the dialog offers these entries.
       Hit the button "Create Agent" to submit the new agent.
       The list of agents will be updated.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric</td>
          <td>WinSLAD Base 1.0</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>Base agent for Windows SLAD family.</td>
        </tr>
        <tr class="odd">
          <td>Installer</td>
          <td>yes</td>
          <td>--</td>
          <td>File</td>
          <td>/tmp/WinSLAD-Base-1.0.exe</td>
        </tr>
        <tr class="even">
          <td>Installer signature</td>
          <td>no</td>
          <td>--</td>
          <td>File (armored GnuPG detached signature)</td>
          <td>/tmp/WinSLAD-Base-1.0.exe</td>
        </tr>
      <!-- TODO: howto_install, howto_us -->
      </table>

      <p>
      In case a signature file is provided, the agent file will be
      verified using this signature at upload time to determine the trust.
      </p>

      <p>
      In case, no signature file is provided, a suitable signature is
      searched for in the NVT Feed. If found, the trust is determined based
      on this signature file.
      </p>

      <a name="agents"></a>
      <h2>Agents</h2>
      <p>
       This table provides an overview of all stored
       agents.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows name of the agent.</td>
        </tr>
        <tr class="even">
         <td>Comment</td>
         <td>Shows the comment that was provided for this agent.</td>
        </tr>
        <tr class="odd">
         <td>Trust</td>
         <td><b>yes</b>: the signature file that was uploaded or that was present
             in the Feed proofs that the agent was not compromised at upload time<br/>
             <b>no</b>: Signature and agent do not match or signature key is not trusted.<br/>
             <b>unknown</b>: Any case where trust could not be tested adequately.<br/>
         </td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delete Agent</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.png" alt="Delete" title="Delete" />
       will immedialy remove the entry and update the list.
      </p>

      <h4>Download Installer Package</h4>
      <p>
       Pressing the download icon
       <img src="/img/agent.png" alt="Download Installer Package" title="Download Installer Package" />
       will download a installation package for this agent.
      </p>
      <!-- TODO: Description for howto's. -->
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configure_credentials.html">
  <div class="gb_window_part_center">Help: Configure Credentials</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_lsc_credentials">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Configure Credentials for Local Security Checks</h1>

      <p>
       Credentials for local security checks are required to allow
       <a href="glossary.html#nvt">NVTs</a> to log into target systems
       for the purpose of locally check there e.g. for the presence
       of all vendor security patches.
      </p>
      <p>
       The dialog to create a new credential pair allows to either specify a password
       or to generate a secure password.
       Note that if the latter option was chosen, users are not able or allowed to
       access either passwords nor so-called private keys.
       Instead, installer packages are created that can be installed on target
       systems. Internals of these installers are explained in the
       <a href="#actions">Actions</a> section of this help page.
       These actions are not available if the password was specified manually.
      </p>
      <p>
       <b>Please note</b> that you will need to associate one or more
       <a href="glossary.html#target">targets</a> with the credential you installed
       on them.
       Only this finally allows the scan engine to apply the suitable credentials.
      </p>

      <a name="new_lsc_credential"></a>
      <h2>New Credential for Local Security Checks</h2>
      <p>
       For creating a credential the dialog offers these entries.
       Hit the button "Create Credential" to submit the new credential.
       The list of credentials will be updated.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric</td>
          <td>Security Scan Account</td>
        </tr>
        <tr class="even">
          <td>Login</td>
          <td>no</td>
          <td>80</td>
          <td>Alphanumeric<br/>If not autogenerate also "\@_.-"</td>
          <td>jsmith<br/>
              myDomain\jsmith<br/>
              jsmith@myDomain</td>
        </tr>
        <tr class="odd">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>For the Windows systems</td>
        </tr>
        <tr class="even">
          <td>[password option]</td>
          <td>yes</td>
          <td>"Autogenerate Credential" or a provided password (40)</td>
          <td>Alphanumeric and "-_@, ;:\./"</td>
          <td>"Autogenerate Credential", hx7ZgI2n</td>
        </tr>
      </table>

      <p>
        Note: According to documentation of Microsoft Domain Controller,
        if your Login uses german umlaut, you can use "ss" for "ß", "a" for "ä" etc.
        In other cases, Login names with german umlauts will not work.
      </p>

      <a name="credentials"></a>
      <h2>Credentials for Local Security Checks</h2>
      <p>
       This table provides an overview of all configured
       credentials.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows name of the credential.</td>
        </tr>
        <tr class="even">
          <td>Login</td>
          <td>Shows the login name that was provided for this credential.</td>
        </tr>
        <tr class="odd">
          <td>Comment</td>
          <td>Shows the comment that was provided for this credential.</td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>
      <p>
       Note that depending on the method that was chosen to specify a password
       (manually or autogenerated), some actions might not be available.
       Specifically, when the password was supplied manually, just the Delete and
       Details actions are available.
      </p>

      <h4>Delete Credential</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.png" alt="Delete" title="Delete" />
       will immedialy remove the entry and update the list.
      </p>

      <h4>Credential Details</h4>
      <p>
       Pressing the details icon
       <img src="/img/details.png" alt="Details" title="Details" />
       will show details about the credential.
      </p>

      <h4>Download RPM Package</h4>
      <p>
       Pressing the RPM icon
       <img src="/img/rpm.png" alt="Download RPM Package" title="Download RPM Package" />
       will download a ".rpm" installation package.
      </p>
      <p>
       With installing this package on a RPM-based systems (e.g. SUSE, RedHat, Fedora, Centos)
       a low privileged user account is created on that target system to allow
       the scan engine to access the system retrieve information about intalled software
       and other product information. De-installation of the package will disable the access.
      </p>

      <h4>Download Debian Package</h4>
      <p>
       Pressing the Debian icon
       <img src="/img/deb.png" alt="Download Debian Package" title="Download Debian Package" />
       will download a ".deb" installation package.
      </p>
      <p>
       With installing this package on a dpkg-based systems (e.g. Debian, Ubuntu)
       a low privileged user account is created on that target system to allow
       the scan engine to access the system retrieve information about intalled software
       and other product information. De-installation of the package will disable the access.
      </p>

      <h4>Download Exe Package</h4>
      <p>
       Pressing the Exe icon
       <img src="/img/exe.png" alt="Download Exe Package" title="Download Exe Package" />
       will download a ".exe" installation package.
      </p>
      <p>
       With installing this package on a Windows systems (e.g. XP, 2003)
       a low privileged user account is created on that target system to allow
       the scan engine to access the system retrieve information about intalled software
       and other product information. De-installation of the package will disable the access.
      </p>

      <h4>Download Public Key</h4>
      <p>
       Pressing the public key icon
       <img src="/img/key.png" alt="Download Public Key" title="Download Public Key" />
       will download a SSH Public Key in ASCII form.
      </p>
      <p>
       This key corresponds to the keys
       used for RPM and Debian packages (not for Exe-Packages).
       The key file is intended to support expert users to prepare targets systems for
       local security checks on their own (i.e. without the provided RPM/Debian
       packages).
      </p>

      <a name="credentialdetails"></a>
      <h2>Credential Details</h2>
      <p>
       Provides information about credentials like the login and comment.
      </p>

      <h3>Targets using this Credential</h3>
      <p>
       This table provides an overview of the targets associated with this credential.
       Details of these targets can be seen after a click on the Details
       <img src="/img/details.png" alt="Details" title="Details" /> icon.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configure_escalators.html">
  <div class="gb_window_part_center">Help: Configure Escalator</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_escalators">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Configure Escalators</h1>
      <p>
       Escalators can be added to <a href="glossary.html#task">tasks</a>.
       Escalators are hooked into the system. Whenever a configured event happens
       (e.g. a task finished), a chosen condition is checked (e.g. vulnerability
       with high threat level detected).
       If the condition is met, an action is performed (e.g. an email is sent to a
       specified adress).
      </p>

      <a name="newescalator"></a>
      <h2>New Escalator</h2>

      <p>
       To create an escalator the dialog offers these entries.
       Hit the button "Create Escalator" to submit the new escalator.
       The list of escalators will be updated.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric</td>
          <td>EmailFinished</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Event</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td>Done</td>
        </tr>
        <tr class="even">
          <td>Condition</td>
          <td>yes</td>
          <td>--</td>
          <td>Choice</td>
          <td>Always</td>
        </tr>
        <tr class="odd">
          <td>Method</td>
          <td>yes</td>
          <td>--</td>
          <td>Choice</td>
          <td>Email</td>
        </tr>
      </table>

      <h3>Escalation Methods</h3>

      <h4>HTTP Get</h4>

      <p>
      The URL will be issued as HTTP GET.
      This can be used eg. to automatically send a SMS via
      a HTTP GET gateway or automatically create a
      bug report in an issue tracker.
      </p>

      <p>
      The following replacements in the URL will be done:
      </p>

      <ul>
      <li> $$: $ </li>
      <li> $n: task name </li>
      <li> $e: event description </li>
      <li> $c: condition description </li>
      </ul>

      <a name="escalators"></a>
      <h2>Escalators</h2>
      <p>
       This table provides an overview of all created escalators.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>User-given name of the escalator.</td>
        </tr>
        <tr class="even">
          <td>event</td>
          <td>Shows the event for which the condition has to be checked.</td>
        </tr>
        <tr class="odd">
          <td>Condition</td>
          <td>Condition to be checked when event happened.</td>
        </tr>
        <tr class="even">
          <td>Method</td>
          <td>Notification method.</td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delete Escalator</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.png" alt="Delete" title="Delete" />
       will immedialy remove the escalator and update the list.
      </p>
      <p>
       It is not possible to remove an escalator that is in use by a task.
      </p>

      <h4>Escalator Details</h4>
      <p>
       Details of an escalator can be seen by clicking on the details icon
       <img src="/img/details.png" alt="Details" title="Details" />.
      </p>

      <h4>Test Escalator</h4>
      <p>
       By clicking on the start icon
       <img src="/img/start.png" alt="Test Escalator" title="Test Escalator" />
       the corresponding escalator is immediately executed with some
       dummy data.
      </p>

      <a name="escalatordetails"></a>
      <h2>Escalator Details</h2>
      <p>
       Provides information about an escalator like the name, comment, condition and
       notification method.
      </p>

      <h3>Tasks using this Escalators</h3>
      <p>
       This table provides an overview of the tasks associated with this escalator.
       Details of these tasks can be seen after a click on the Details
       <img src="/img/details.png" alt="Details" title="Details" /> icon.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configure_report_formats.html">
  <div class="gb_window_part_center">Help: Configure Report Formats</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_report_formats">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Configure Report Formats</h1>
      <p>
       <a href="glossary.html#report">Reports</a> can be downloaded in a number
       of formats.
       The configured <a href="glossary.html#report_format">report formats</a>
       will appear for selection in the dialogs for downloading reports.
      </p>

      <a name="import_report_format"></a>
      <h2>Import Report Format</h2>
      <p>
       To import a report format, select the import file and hit the
       "Import Report Format" button to submit the report format.
       The list of report formats will be updated.
       Note that the import will fail with an error message if the report format
       already exists on your system, or if an existing report format has the
       same name.
      </p>
      <p>
       To create a file that can be imported in another installation, refer to the
       <a href="#export">export action</a>.
      </p>

      <a name="report_format"></a>
      <h2>Report Formats</h2>
      <p>
       This table provides an overview of all configured report formats.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows name of the report format and,
              if specified, the summary in brackets below
              the name.</td>
        </tr>
        <tr class="even">
          <td>Extension</td>
          <td>The file extension of the resulting report.</td>
        </tr>
        <tr class="odd">
          <td>Content Type</td>
          <td>The content type of the resulting report.</td>
        </tr>
        <tr class="even">
         <td>Trust</td>
         <td><b>yes</b>: the signature embedded in report format or that was present
             in the Feed proves that the agent was not compromised at upload time<br/>
             <b>no</b>: Signature and report format do not match or signature key is not trusted.<br/>
             <b>unknown</b>: Any case where trust could not be tested adequately.<br/>
         </td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>
      <p>
       For Report Formats the following actions are available.
      </p>

      <h4>Delete Report Format</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.png" alt="Delete" title="Delete" /> will
       immediatly remove the entry and update the list.
      </p>

      <h4>Report Format Details</h4>
      <p>
       Activating the details icon
       <img src="/img/details.png" alt="Report Format Details" title="Report Format Details" />
       will open the <a href="#target_details">Report Format Details</a>
       dialog to provide details of the report format.
      </p>

      <a name="export"></a>
      <h4>Export Report Format XML</h4>
      <p>
       A Report Format can be saved to file, e.g. for sharing or backup.
       A click on the download icon <img src="/img/download.png" alt="Download" title="Download" />
       will let you download a file describing this report format.
      </p>
      <p>
       The file can later be imported by chosing to
       <a href="#import_report_format">Import a Report Format</a>.
      </p>

      <a name="report_format_details"></a>
      <h2>Report Format Details</h2>
      <p>
       Provides detailed information about the report format.
      </p>

      <h3>Parameters</h3>
      <p>
       This table provides a list of the parameters that control the creation
       of reports that have this format.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configure_scanconfigs.html">
  <div class="gb_window_part_center">Help: Configure Scan Configs</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_configs">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Configure Scan Configs</h1>
      <p>
       Any <a href="glossary.html#task">task</a> is associated with
       a <a href="glossary.html#scanconfig">Scan Configuration</a>.
       The configured Scan Configs will appear as selection
       in the dialog for creating a <a href="new_task.html">new task</a>.
      </p>

      <a name="newconfig"></a>
      <h2>New Scan Config</h2>
      <p>
       For creating a new scan configuration the dialog offers these entries.
       Hit the button "Create Scan Config" to submit the new scan configuration.
       The list of scan configurations will be updated.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric</td>
          <td>Full and deep scan</td>
        </tr>
        <tr>
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>All-inclusive scan which might consume quite some time.</td>
        </tr>
        <tr class="odd">
          <td>Base</td>
          <td>yes</td>
          <td>---</td>
          <td>A predefined base scan configuration</td>
          <td>Empty, static and fast<br/>
              Full and Fast</td>
        </tr>
      </table>

      <a name="importconfig"></a>
      <h2>Import Scan Config</h2>
      <p>
       To import a scan configuration, select the configuration file and hit the
       "Import Scan Config" to submit the scan configuration.
       The list of scan configurations will be updated.
       Note that if the name of the scan configuration already exists in your system,
       a numeric suffix will be added to the name of the imported scan configuration.
      </p>
      <p>
       To create a file that can be imported (e.g. if you have multiple GSA running
       on different machines), refer to the <a href="#export">export action</a>.
      </p>

      <a name="scanconfigs"></a>
      <h2>Scan Configs</h2>
      <p>
       This table provides on overview on all configured
       scan configurations.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows name of the scan configuration and,
              if specified, the comment in brackets below
              the name.</td>
        </tr>
        <tr>
          <td>Families: Total</td>
          <td>The number of NVT families that would be considered
              with the current NVT set. "N/A" means that the
              number is not available at the moment.</td>
        </tr>
        <tr class="odd">
          <td>Families: Trend</td>
          <td>This field can have two states: "Grow"
              (<img src="/img/trend_more.png" />) or
              "Static" (<img src="/img/trend_nochange.png" />). "Grow" means that
              the NVT selection associated with the Scan Config specified to include
              any new family that occurs in the NVT set. "Static" means, that the
              NVT selection associated with the Scan Config has an explicit definition
              which families are to be considered.</td>
        </tr>
        <tr>
          <td>NVTs: Total</td>
          <td>The number of NVTs that would be considered
              with the current NVT set. "N/A" means that the
              number is not available at the moment.</td>
        </tr>
        <tr class="odd">
          <td>NVTs: Trend</td>
          <td>This field can have two states: "Grow"
              (<img src="/img/trend_more.png" />) or "Static"
              (<img src="/img/trend_nochange.png" />). "Grow" means that
              the NVT selection associated with the Scan Config specified to include
              new NVTs that occurs in the NVT set at least for one family.
              "Static" means, that the NVT selection associated with the Scan Config
              has an explicit definition which NVTs are to be considered.</td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>
      <p>
       For Scan Configurations the following actions are available.
      </p>

      <h4>Delete Scan Config</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.png" alt="Delete" title="Delete" /> will
       immediatly remove the entry and update the list.
      </p>
      <p>
       Note that if a scan config is associated with at least one task,
       it is not possible to delete it. In this case the button is greyed
       out <img src="/img/delete_inactive.png" alt="Delete" title="Delete" />.
      </p>

      <h4>Scan Config Details</h4>
      <p>
       Issueing the details icon
       <img src="/img/details.png" alt="Scan Config Details" title="Scan Config Details" />
       will open the <a href="scanconfig_details.html">Scan Config Details</a>
       dialog to provide details on the configuration
       such as the selected NVTs and applied settings.
      </p>

      <h4>Edit Scan Config</h4>
      <p>
       A Scan Config can be modified if it is not currently in use by a task.
       A click on the edit icon
       <img src="/img/edit.png" alt="Edit" title="Edit" />
       will open the <a href="scanconfig_editor.html">Scan Config Editor</a> dialog
       with details on the configuration
       such as the selected NVTs and applied settings and allow modifications of it.
       If the Scan Config is currently in use by a task, the icon will appear greyed
       out <img src="/img/edit_inactive.png" alt="Editing not possible" title="Editing not possible" />.
      </p>

      <a name="export"></a>
      <h4>Export Scan Config XML</h4>
      <p>
       A Scan Config can be saved to file, e.g. for sharing or backup.
       A click on the download icon <img src="/img/download.png" alt="Download" title="Download" />
       will let you download a file describing this scan config.
      </p>
      <p>
       The file can later be imported by chosing to <a href="#importconfig">Import a Scan Config</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configure_schedules.html">
  <div class="gb_window_part_center">Help: Configure Schedule</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_schedules">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Configure Schedules</h1>
      <p>
        Schedules can be added to <a href="glossary.html#task">tasks</a>.
        They can be used to start a task at a pre-defined time, to repeat a task
        after a certain interval or to limit the maximum duration of a task.
      </p>

      <a name="newschedule"></a>
      <h2>New Schedule</h2>

      <p>
       To create a schedule the dialog offers these entries.
       Hit the button "Create Schedule" to submit the new schedule.
       The list of schedules will be updated.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric</td>
          <td>Weekly Scan</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>First Time</td>
          <td>yes</td>
          <td>---</td>
          <td>Date and time</td>
          <td>10h00, 01 May 2010</td>
        </tr>
        <tr class="even">
          <td>Period</td>
          <td>no</td>
          <td>--</td>
          <td>Interval</td>
          <td>1 week</td>
        </tr>
        <tr class="odd">
          <td>Duration</td>
          <td>no</td>
          <td>--</td>
          <td>Interval</td>
          <td>12 hours</td>
        </tr>
      </table>

      <a name="schedules"></a>
      <h2>Schedules</h2>
      <p>
       This table provides an overview of all created schedules.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>User-given name of the schedule.</td>
        </tr>
        <tr class="even">
          <td>First Run</td>
          <td>Date and time for the first run of the task.</td>
        </tr>
        <tr class="odd">
          <td>Period</td>
          <td>Period after which the task should run again.</td>
        </tr>
        <tr class="even">
          <td>Duration</td>
          <td>Maximum duration of a running task.</td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delete Schedule</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.png" alt="Delete" title="Delete" />
       will immedialy remove the schedule and update the list.
      </p>
      <p>
       It is not possible to remove an schedule that is in use by a task.
      </p>

      <h4>Schedule Details</h4>
      <p>
       Details of an schedule can be seen by clicking on the details icon
       <img src="/img/details.png" alt="Details" title="Details" />.
      </p>

      <a name="scheduledetails"></a>
      <h2>Schedule Details</h2>
      <p>
       Provides information about an schedule like the name, comment, the first
       and next time the schedule will be executed, the period and the duration.
      </p>

      <h3>Tasks using this Schedules</h3>
      <p>
       This table provides an overview of the tasks associated with this schedule.
       Details of these tasks can be seen after a click on the Details
       <img src="/img/details.png" alt="Details" title="Details" /> icon.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configure_targets.html">
  <div class="gb_window_part_center">Help: Configure Targets</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_targets">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Configure Targets</h1>
      <p>
       Any <a href="glossary.html#task">task</a> is associated with
       a <a href="glossary.html#target">target</a>.
       The configured targets will appear as selection
       in the dialog for creating a <a href="new_task.html">new task</a>.
      </p>

      <a name="newtarget"></a>
      <h2>New Target</h2>
      <p>
       For creating a new target the dialog offers these entries.
       Hit the button "Create Target" to submit the new target.
       The list of targets will be updated.
      </p>
      <p>
       Note on <b>Hosts</b>:
        <ul>
          <li>
            The hosts parameter is a comma-separated list of values.  Each value
            can be
            <ul>
              <li>an IPv4 address (e.g. <tt>192.168.13.1</tt>)</li>
              <li>a hostname (e.g. <tt>myhost1.domain</tt>)</li>
              <li>an IPv4 address range in long format
                  (e.g. <tt>192.168.1.116-192.168.1.124</tt>)</li>
              <li>an IPv4 address range in short format
                  (e.g. <tt>192.168.1.116-124</tt>)</li>
              <li>an IPv4 address range in CIDR notation
                  (e.g. <tt>192.168.13.0/24</tt>)</li>
              <li>an IPv6 address
                  (e.g. <tt>fe80::222:64ff:fe76:4cea/64</tt>).</li>
            </ul>
            These options can be mixed (e.g.
            <tt>192.168.13.1, myhost2.domain, 192.168.13.0/24</tt>).
          </li>
          <li>
            The netmask in CIDR notation is limited to 20 (4095 hosts).
          </li>
          <li>
            The Scanner currently expects IPv6 addresses to name a single host,
            and always replaces the netmasks of IPv6 addresses with 128.
          </li>
        </ul>
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric</td>
          <td>Staging webservers</td>
        </tr>
        <tr class="even">
          <td>Hosts</td>
          <td>yes</td>
          <td>200</td>
          <td>Comma separated list of IPs and/or hostnames</td>
          <td><tt>192.168.1.23,192.168.1.2/31, webserv1.mycompany.tld</tt></td>
        </tr>
        <tr class="odd">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>Covers both of our web staging systems</td>
        </tr>
        <tr class="even">
          <td>Credential (optional)</td>
          <td>no</td>
          <td>--</td>
          <td>Any of the <a href="configure_credentials.html">configured credentials</a>.</td>
          <td>Security Scan Account</td>
        </tr>
      </table>

      <p>
      If the backend is configured to support LDAP, additional fields for hosts will appear
      that allow to import target systems from management systems:
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Manual</td>
          <td>---</td>
          <td>80</td>
          <td>Comma separated list of IPs and/or hostnames</td>
          <td><tt>192.168.1.23,192.168.1.2/31, webserv1.mycompany.tld</tt></td>
        </tr>
        <tr class="even">
          <td>Import</td>
          <td>---</td>
          <td>---</td>
          <td>Selection of configured services</td>
          <td>UCS 2.3</td>
        </tr>
        <tr class="odd">
          <td>Username</td>
          <td>yes</td>
          <td>40</td>
          <td>Account name for the selected service.</td>
          <td>smith</td>
        </tr>
        <tr class="even">
          <td>Password</td>
          <td>yes</td>
          <td>40</td>
          <td>Password corresponding to the above username.</td>
          <td></td>
        </tr>
      </table>

      <a name="targets"></a>
      <h2>Targets</h2>
      <p>
       This table provides an overview of all configured
       targets. The complete contents of the target entries
       are shown (name, comment and hosts).
       If credentials are linked to the target, they are listed as well.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows name of the target and,
              if specified, the comment in brackets below
              the name.</td>
        </tr>
        <tr class="even">
          <td>Hosts</td>
          <td>The comma separated list of target hosts, specified
              either via hostname or IP.</td>
        </tr>
        <tr class="odd">
          <td>IPs</td>
          <td>The total number of IPs that results from the
              hosts specification.</td>
        </tr>
        <tr class="even">
          <td>Credentials</td>
          <td>List of associated credentials, that can be clicked on to view details.</td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>
      <p>
       Target specifications can only be inspected or deleted.
       <em>Editing a target</em> is not foreseen.
       You may copy the contents from the list to the above
       shown "New Target" dialog and create a new target from this
       with a different name.
      </p>

      <h4>Delete Target</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.png" alt="Delete" title="Delete" />
       will immedialy remove the entry and update the list.
      </p>
      <p>
       Note that if a target is associated with at least one task, it is not possible
       to delete it. In this case the button is greyed
       out <img src="/img/delete_inactive.png" alt="Delete" title="Delete" />.
      </p>

      <h4>Target Details</h4>
      <p>
       Pressing the details icon
       <img src="/img/details.png" alt="Details" title="Details" />
       will show details of the target specification and Tasks that use this target.
      </p>

      <a name="targetdetails"></a>
      <h2>Target Details</h2>
      <p>
       Provides detailed information about the target.
       This includes the name, comment and the maximum number of hosts to scan.
       If credentials are associated with this target, its name can be seen. A click
       on the credentials name will show more information about the associated
       credentials.
      </p>

      <h3>Tasks using this Target</h3>
      <p>
       This table provides an overview of the tasks that are associated to the target
       (if any).
       Details of these tasks can be seen after a click on the Details
       <img src="/img/details.png" alt="Details" title="Details" /> icon.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configure_users.html">
  <div class="gb_window_part_center">Help: Configure Users</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_users">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Configure Users</h1>
      <p>
       The administration of users is only accessible for users that own
       the "Administrator" role.
      </p>

      <a name="newuser"></a>
      <h2>New User</h2>
      <p>
       For creating a user the dialog offers these entries.
       Hit the button "Create User" to submit the new user.
       The list of users will be updated.
      </p>
      <p>
       Note on <b>Host Access</b>: If "Deny:" or "Allow:" is chosen, the text field should
       contain a list of comma-separated IPs.
       The CIDR notation (e.g. <tt>192.168.10.0/24</tt>) can be used.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric</td>
          <td>jsmith</td>
        </tr>
        <tr class="even">
          <td>Password</td>
          <td>yes</td>
          <td>40</td>
          <td>Alphanumeric</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Role</td>
          <td>yes</td>
          <td>---</td>
          <td>"User" or "Administrator"</td>
          <td>User</td>
        </tr>
        <tr class="even">
          <td>Host access</td>
          <td>yes</td>
          <td>---</td>
          <td>"Allow all", or either "Allow:" or "Deny:" with additional entry</td>
          <td>"Allow all", "Allow:" and "<tt>192.168.13.2/31,192.168.14.12</tt>"</td>
        </tr>
      </table>

      <a name="ldapauthentication"></a>
      <h2>LDAP Authentication</h2>
      <p>
       This dialog box is only visible if the backend
       is configured to support LDAP authentication.
      </p>
      <p>
       Changes will be saved after confirming with the "Save" button,
       but <b>only get into effect after</b> the backend is restarted.
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Description</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Enable</td>
          <td>Whether or not to use ldap authentication.</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>LDAP Host</td>
          <td>Hostname or IP with optional port
              of the LDAP service. If no port is given, 389 will
              be used the default for LDAP services. </td>
          <td>ldap.example.com:389</td>
        </tr>
        <tr class="odd">
          <td>Auth. DN</td>
          <td>The DN to authenticate against. Place a single %s where the
              username will be put.</td>
          <td>uid=%s,cn=users,o=center,d=org</td>
        </tr>
      </table>

      <a name="adsauthentication"></a>
      <h2>ADS Authentication</h2>
      <p>
       This dialog box is only visible if the backend
       is configured to support ADS authentication.
      </p>
      <p>
       Changes will be saved after confirming with the "Save" button,
       but <b>only get into effect after</b> the backend is restarted.
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Description</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Enable</td>
          <td>Whether or not to use ADS authentication.</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>ADS Host</td>
          <td>Adress and optional port of the ADS host to bind to.</td>
          <td>ads.example.com:389</td>
        </tr>
        <tr class="odd">
          <td>Domain</td>
          <td>The domain for authentication. This should include the TLD. </td>
          <td>adstest.local</td>
        </tr>
      </table>

      <a name="users"></a>
      <h2>Users</h2>
      <p>
       This table provides an overview of all configured
       users.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Login name of the user.</td>
        </tr>
        <tr class="even">
          <td>Role</td>
          <td>Shows the role of the user.</td>
        </tr>
        <tr class="odd">
          <td>Host Access</td>
          <td>Host access rules of the user.</td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delete User</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.png" alt="Delete" title="Delete" />
       will immedialy remove the user and update the list.
      </p>
      <p>
       It is not possible to remove the last Administrator, which
       is the same as removing the currently used account.
      </p>

      <h4>Details</h4>
      <p>
       Pressing the details icon <img src="/img/details.png" alt="Details" title="Details" /> will lead to a page
       dispalying user details.
      </p>

      <h4>Edit</h4>
      <p>
       Pressing the edit icon <img src="/img/edit.png" alt="Edit" title="Edit" /> will lead to a page where the
       password, role and Host Access rules can be changed.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="contents.html">
  <div class="gb_window_part_center">Help: Contents</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">

      <h1>Contents</h1>
      <p>
       This is the help system of Greenbone Security Assistant.
       Small <a href="/help/contents.html" title="Help"><img src="/img/help.png"/></a>
       icons all over the web interface will jump you into the respective contents.
       Alternatively you can browse the following structure.
      </p>

      <div id="list">
        <ul>
          <li> Scan Management</li>
          <ul>
            <li> <a href="tasks.html">Tasks</a></li>
            <ul>
              <li> <a href="reports.html">Reports</a></li>
              <li> <a href="view_report.html">View Report</a></li>
            </ul>
            <li> <a href="new_task.html">New task</a></li>
            <li> <a href="notes.html">Notes</a></li>
            <li> <a href="overrides.html">Overrides</a></li>
            <li> <a href="performance.html">Performance</a></li>
          </ul>
          <li> Configuration</li>
          <ul>
            <li> <a href="configure_scanconfigs.html">Configure Scan Configs</a></li>
            <ul>
              <li> <a href="scanconfig_details.html">Scan Config Details</a></li>
              <li> <a href="scanconfig_family_details.html">Scan Config Family Details</a></li>
              <li> <a href="scanconfig_nvt_details.html">Scan Config NVT Details</a></li>
              <li> <a href="scanconfig_editor.html">Scan Config Editor</a></li>
              <li> <a href="scanconfig_editor_nvt_families.html">Scan Config Family Editor</a></li>
              <li> <a href="scanconfig_editor_nvt.html">Scan Config NVT Editor</a></li>
            </ul>
            <li> <a href="configure_targets.html">Configure Targets</a></li>
            <li> <a href="configure_credentials.html">Configure Credentials</a></li>
            <li> <a href="configure_agents.html">Configure Agents</a></li>
            <li> <a href="configure_escalators.html">Configure Escalators</a></li>
            <li> <a href="configure_schedules.html">Configure Schedules</a></li>
            <li> <a href="configure_report_formats.html">Configure Report Formats</a></li>
          </ul>
          <li> Administration</li>
          <ul>
            <li> <a href="configure_users.html">Configure Users</a></li>
            <li> <a href="feed_management.html">NVT Feed Management</a></li>
            <li> <a href="settings.html">Settings</a></li>
          </ul>
          <li> Miscellaneous</li>
          <ul>
            <li> <a href="nvts.html">NVT Details</a></li>
            <li> <a href="error_messages.html">Error Messages</a></li>
            <li> <a href="glossary.html">Glossary</a></li>
          </ul>
        </ul>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="error_messages.html">
  <div class="gb_window_part_center">Help: Error Messages</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=unknown_cmd">Provoke a harmless internal error</a> (use <img src="/img/help.png"/> to get back here)</div>
    <div style="text-align:left">

      <br/>
      <h1>Error Messages</h1>

      <h2>Problems during a operation</h2>
      <p>
       Whenever an operation does not work as expected,
       the "Results of last operation" window title bar
       turns to red color.
       In such a case the "Status code" is 4xx and the
       "Status Message" explains what happened.
      </p>
      <p>
       No serious failures happened and you can continue
       working with GSA. You should consider the
       contents of "Status Message" to avoid the problem.
      </p>

      <h2>Internal Error Dialog</h2>
      <p>
       Usually, GSA itself is not affected
       critically as long as you get
       such error dialogs.
      </p>
      <p>
       The dialog shows a <em>function name:line number</em> (this has only
       meaning to the software developers) and a <em>error text</em>
       (which might give your system administrator a valuable hint).
      </p>
      <p>
       You always have three options:
      </p>

      <ol>
        <p><li>
          "Back" button of browser: This will go back to the previous
          page. Note, that if the last action that caused the error
          was to submit a form, the form is resent. In some cases,
          a action like "Create Task" may have been successful already
          and will even be for any resent. Please read the error text
          carefully about hints.
        </li></p>
        <p><li>
          Assumed last sane state: GSA tries to guess a last sane
          state. The guess might be wrong or it might help.
          In any case, no re-posting will happen, so that unwanted
          actions like could happen with the browsers back button
          are prevented.
        </li></p>
        <p><li>
          Logout: In case of serious problems where neither of the
          two other options helps, you shoud log out of GSA. As long
          as GSA is still running, you will get the login dialog.
        </li></p>
      </ol>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="feed_management.html">
  <div class="gb_window_part_center">Help: NVT Feed Management</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_feed">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>NVT Feed Management</h1>
      <p>
       The management of NVT feeds is only accessible for users that own
       the "Administrator" role.
      </p>

      <a name="feed_synchronization"></a>
      <h2>Synchronization with an NVT Feed</h2>
      <p>
       This dialog allows you synchronize your NVT collection with an NVT feed. It
       shows the name of the NVT Feed Service your installation is configured to use
       and a short description of the tool which will be used to synchronize your NVT
       collection with the Feed Service. Hit the "Synchronize with Feed now" button to
       start the synchronization.
      </p>

      <a name="consequences"></a>
      <h2>Consequences of an NVT Synchronization</h2>
      <p>
       The synchronization with an NVT Feed Service will take a short amount of time,
       depending on the time of your last synchronization and the amount of changes in
       the Feed Service. While synchronizing, the interface might seem slow to react.
       At the end of the synchronization, some components of your installation will
       need to be reloaded to make full use of your updated NVT collection. This may
       cause the interface to be unresponsive for a short amount of time.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="glossary.html">

  <div class="gb_window_part_center">Help: Glossary</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Glossary</h1>
      <p>
       For Greenbone Security Assistant (GSA) a number
       of terms are used consistently throughout the
       user interface.
      </p>
      <p>
       Most of the terms are general and to avoid
       misinterpretation, this page summarizes the
       definitions of these
       terms as they are used in GSA.
      </p>

      <a name="escalator"></a>
      <h2>Escalator</h2>
      <p>
       An escalator is an action that can be triggered at certain events.
       Usually this means notification, e.g. via e-mail in case of
       new found vulnerabilities.
      </p>

      <a name="note"></a>
      <h2>Note</h2>
      <p>
       A note is a textual comment associated with an <a href="#nvt">NVT</a>.
       Notes show up in <a href="#report">reports</a>, below the results
       generated by the NVT.  A note can be applied to a particular
       result, task, threat level, port and/or host, so that the note appears only
       in certain reports.
      </p>

      <a name="nvt"></a>
      <h2>Network Vulnerability Test (NVT)</h2>
      <p>
       A Network Vulnerability Test (NVT) is a routine
       that checks a target system for the presence of a
       specific known or potential security problem.
      </p>
      <p>
       NVTs are grouped into families of similar
       tests. The selection of families and/or
       single NVTs is part of a
       <a href="#scanconfig">Scan Configuration</a>.
      </p>

      <a name="override"></a>
      <h2>Override</h2>
      <p>
       An overide is a rule to change the threat of items
       within one or many <a href="#report">report</a>s.
      </p>
      <p>
       Overrides are especially useful to mark report items
       as False Positives (e.g. an incorrect or expected finding)
       or emphasize items that are of higher threat in the
       observed scenario.
      </p>

      <a name="report"></a>
      <h2>Report</h2>
      <p>
       A report is the result of a <a href="#scan">Scan</a>
       and contains a summary of what the selected NVTs found
       out for each of the target hosts.
      </p>
      <p>
       A report is always associated with a
       <a href="#task">task</a>. The
       <a href="#scanconfig">Scan Configuration</a> that
       detemines the extend of the report is part of the
       associated task and can not be modified. Therefore,
       for any report it is ensured that its execution
       configuration is preserved and available.
      </p>

      <a name="report_format"></a>
      <h2>Report Format</h2>
      <p>
       A format in which a <a href="#report">report</a> can be downloaded.
      </p>
      <p>
       An example is "TXT", which has content type "text/plain", meaning that
       the report is a plain text document.
      </p>

      <a name="scan"></a>
      <h2>Scan</h2>
      <p>
       A scan is a <a href="#task">task</a> in progress.
       For each task only one scan can be active.
       The result of a scan is a <a href="#report">report</a>.
      </p>
      <p>
       The status of all active scan can be seen
       in the <a href="/omp?cmd=get_tasks">task overview</a>.
       The progress is shown as a percentage of
       total number of tests to be executed. The
       duration of a scan is determined by the number
       <a href="#target">tagets</a> and the complexity
       of the <a href="#scanconfig">Scan Configuration</a>
       and ranges from 1 minute to many hours or even days.
      </p>
      <p>
       The task overview offers an option to stop a scan.
       The resulting report will then be imcomplete.
      </p>

      <a name="scanconfig"></a>
      <h2>Scan Configuration</h2>
      <p>
       A scan configuration covers the selection
       of <a href="#nvt">NVTs</a> as well as general
       and very specific (expert) parameters for the scan server
       and for some of the NVTs.
      </p>
      <p>
       Not covered by a Scan Configuration is the selection
       of targets. These are separately specified as a
       <a href="#target">target</a>.
      </p>

      <a name="schedule"></a>
      <h2>Schedule</h2>
      <p>
        A schedule sets the time when a <a href="#task">task</a> should be
        automatically started, a period after which the task should run again
        and a maximum duration the task is allowed to take.
      </p>

      <a name="target"></a>
      <h2>Target</h2>
      <p>
       A target defines a set of systems (called "hosts")
       that are to be scanned.
       The systems are identified either by
       their IP addresses, by their hostnames, or with CIDR network notation.
      </p>

      <a name="task"></a>
      <h2>Task</h2>
      <p>
       A task is initially formed by a <a href="#target">target</a>
       and a <a href="#scanconfig">scan configuration</a>.
       Executing a task means to create a <a href="#scan">scan</a>.
       As a result, a task collects a series
       of <a href="#report">reports</a>.
      </p>
      <p>
       The target and scan configuration is static.
       Thus, the resulting sequence of reports describe the
       change of security status over time.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="gplv2.html">
  <div class="gb_window_part_center">GNU General Public License Version 2</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">

<pre>
		    GNU GENERAL PUBLIC LICENSE
		       Version 2, June 1991

 Copyright (C) 1989, 1991 Free Software Foundation, Inc.
     51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

			    Preamble

  The licenses for most software are designed to take away your
freedom to share and change it.  By contrast, the GNU General Public
License is intended to guarantee your freedom to share and change free
software--to make sure the software is free for all its users.  This
General Public License applies to most of the Free Software
Foundation's software and to any other program whose authors commit to
using it.  (Some other Free Software Foundation software is covered by
the GNU Library General Public License instead.)  You can apply it to
your programs, too.

  When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
this service if you wish), that you receive source code or can get it
if you want it, that you can change the software or use pieces of it
in new free programs; and that you know you can do these things.

  To protect your rights, we need to make restrictions that forbid
anyone to deny you these rights or to ask you to surrender the rights.
These restrictions translate to certain responsibilities for you if you
distribute copies of the software, or if you modify it.

  For example, if you distribute copies of such a program, whether
gratis or for a fee, you must give the recipients all the rights that
you have.  You must make sure that they, too, receive or can get the
source code.  And you must show them these terms so they know their
rights.

  We protect your rights with two steps: (1) copyright the software, and
(2) offer you this license which gives you legal permission to copy,
distribute and/or modify the software.

  Also, for each author's protection and ours, we want to make certain
that everyone understands that there is no warranty for this free
software.  If the software is modified by someone else and passed on, we
want its recipients to know that what they have is not the original, so
that any problems introduced by others will not reflect on the original
authors' reputations.

  Finally, any free program is threatened constantly by software
patents.  We wish to avoid the danger that redistributors of a free
program will individually obtain patent licenses, in effect making the
program proprietary.  To prevent this, we have made it clear that any
patent must be licensed for everyone's free use or not licensed at all.

  The precise terms and conditions for copying, distribution and
modification follow.

		    GNU GENERAL PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. This License applies to any program or other work which contains
a notice placed by the copyright holder saying it may be distributed
under the terms of this General Public License.  The "Program", below,
refers to any such program or work, and a "work based on the Program"
means either the Program or any derivative work under copyright law:
that is to say, a work containing the Program or a portion of it,
either verbatim or with modifications and/or translated into another
language.  (Hereinafter, translation is included without limitation in
the term "modification".)  Each licensee is addressed as "you".

Activities other than copying, distribution and modification are not
covered by this License; they are outside its scope.  The act of
running the Program is not restricted, and the output from the Program
is covered only if its contents constitute a work based on the
Program (independent of having been made by running the Program).
Whether that is true depends on what the Program does.

  1. You may copy and distribute verbatim copies of the Program's
source code as you receive it, in any medium, provided that you
conspicuously and appropriately publish on each copy an appropriate
copyright notice and disclaimer of warranty; keep intact all the
notices that refer to this License and to the absence of any warranty;
and give any other recipients of the Program a copy of this License
along with the Program.

You may charge a fee for the physical act of transferring a copy, and
you may at your option offer warranty protection in exchange for a fee.

  2. You may modify your copy or copies of the Program or any portion
of it, thus forming a work based on the Program, and copy and
distribute such modifications or work under the terms of Section 1
above, provided that you also meet all of these conditions:

    a) You must cause the modified files to carry prominent notices
    stating that you changed the files and the date of any change.

    b) You must cause any work that you distribute or publish, that in
    whole or in part contains or is derived from the Program or any
    part thereof, to be licensed as a whole at no charge to all third
    parties under the terms of this License.

    c) If the modified program normally reads commands interactively
    when run, you must cause it, when started running for such
    interactive use in the most ordinary way, to print or display an
    announcement including an appropriate copyright notice and a
    notice that there is no warranty (or else, saying that you provide
    a warranty) and that users may redistribute the program under
    these conditions, and telling the user how to view a copy of this
    License.  (Exception: if the Program itself is interactive but
    does not normally print such an announcement, your work based on
    the Program is not required to print an announcement.)

These requirements apply to the modified work as a whole.  If
identifiable sections of that work are not derived from the Program,
and can be reasonably considered independent and separate works in
themselves, then this License, and its terms, do not apply to those
sections when you distribute them as separate works.  But when you
distribute the same sections as part of a whole which is a work based
on the Program, the distribution of the whole must be on the terms of
this License, whose permissions for other licensees extend to the
entire whole, and thus to each and every part regardless of who wrote it.

Thus, it is not the intent of this section to claim rights or contest
your rights to work written entirely by you; rather, the intent is to
exercise the right to control the distribution of derivative or
collective works based on the Program.

In addition, mere aggregation of another work not based on the Program
with the Program (or with a work based on the Program) on a volume of
a storage or distribution medium does not bring the other work under
the scope of this License.

  3. You may copy and distribute the Program (or a work based on it,
under Section 2) in object code or executable form under the terms of
Sections 1 and 2 above provided that you also do one of the following:

    a) Accompany it with the complete corresponding machine-readable
    source code, which must be distributed under the terms of Sections
    1 and 2 above on a medium customarily used for software interchange; or,

    b) Accompany it with a written offer, valid for at least three
    years, to give any third party, for a charge no more than your
    cost of physically performing source distribution, a complete
    machine-readable copy of the corresponding source code, to be
    distributed under the terms of Sections 1 and 2 above on a medium
    customarily used for software interchange; or,

    c) Accompany it with the information you received as to the offer
    to distribute corresponding source code.  (This alternative is
    allowed only for noncommercial distribution and only if you
    received the program in object code or executable form with such
    an offer, in accord with Subsection b above.)

The source code for a work means the preferred form of the work for
making modifications to it.  For an executable work, complete source
code means all the source code for all modules it contains, plus any
associated interface definition files, plus the scripts used to
control compilation and installation of the executable.  However, as a
special exception, the source code distributed need not include
anything that is normally distributed (in either source or binary
form) with the major components (compiler, kernel, and so on) of the
operating system on which the executable runs, unless that component
itself accompanies the executable.

If distribution of executable or object code is made by offering
access to copy from a designated place, then offering equivalent
access to copy the source code from the same place counts as
distribution of the source code, even though third parties are not
compelled to copy the source along with the object code.

  4. You may not copy, modify, sublicense, or distribute the Program
except as expressly provided under this License.  Any attempt
otherwise to copy, modify, sublicense or distribute the Program is
void, and will automatically terminate your rights under this License.
However, parties who have received copies, or rights, from you under
this License will not have their licenses terminated so long as such
parties remain in full compliance.

  5. You are not required to accept this License, since you have not
signed it.  However, nothing else grants you permission to modify or
distribute the Program or its derivative works.  These actions are
prohibited by law if you do not accept this License.  Therefore, by
modifying or distributing the Program (or any work based on the
Program), you indicate your acceptance of this License to do so, and
all its terms and conditions for copying, distributing or modifying
the Program or works based on it.

  6. Each time you redistribute the Program (or any work based on the
Program), the recipient automatically receives a license from the
original licensor to copy, distribute or modify the Program subject to
these terms and conditions.  You may not impose any further
restrictions on the recipients' exercise of the rights granted herein.
You are not responsible for enforcing compliance by third parties to
this License.

  7. If, as a consequence of a court judgment or allegation of patent
infringement or for any other reason (not limited to patent issues),
conditions are imposed on you (whether by court order, agreement or
otherwise) that contradict the conditions of this License, they do not
excuse you from the conditions of this License.  If you cannot
distribute so as to satisfy simultaneously your obligations under this
License and any other pertinent obligations, then as a consequence you
may not distribute the Program at all.  For example, if a patent
license would not permit royalty-free redistribution of the Program by
all those who receive copies directly or indirectly through you, then
the only way you could satisfy both it and this License would be to
refrain entirely from distribution of the Program.

If any portion of this section is held invalid or unenforceable under
any particular circumstance, the balance of the section is intended to
apply and the section as a whole is intended to apply in other
circumstances.

It is not the purpose of this section to induce you to infringe any
patents or other property right claims or to contest validity of any
such claims; this section has the sole purpose of protecting the
integrity of the free software distribution system, which is
implemented by public license practices.  Many people have made
generous contributions to the wide range of software distributed
through that system in reliance on consistent application of that
system; it is up to the author/donor to decide if he or she is willing
to distribute software through any other system and a licensee cannot
impose that choice.

This section is intended to make thoroughly clear what is believed to
be a consequence of the rest of this License.

  8. If the distribution and/or use of the Program is restricted in
certain countries either by patents or by copyrighted interfaces, the
original copyright holder who places the Program under this License
may add an explicit geographical distribution limitation excluding
those countries, so that distribution is permitted only in or among
countries not thus excluded.  In such case, this License incorporates
the limitation as if written in the body of this License.

  9. The Free Software Foundation may publish revised and/or new versions
of the General Public License from time to time.  Such new versions will
be similar in spirit to the present version, but may differ in detail to
address new problems or concerns.

Each version is given a distinguishing version number.  If the Program
specifies a version number of this License which applies to it and "any
later version", you have the option of following the terms and conditions
either of that version or of any later version published by the Free
Software Foundation.  If the Program does not specify a version number of
this License, you may choose any version ever published by the Free Software
Foundation.

  10. If you wish to incorporate parts of the Program into other free
programs whose distribution conditions are different, write to the author
to ask for permission.  For software which is copyrighted by the Free
Software Foundation, write to the Free Software Foundation; we sometimes
make exceptions for this.  Our decision will be guided by the two goals
of preserving the free status of all derivatives of our free software and
of promoting the sharing and reuse of software generally.

			    NO WARRANTY

  11. BECAUSE THE PROGRAM IS LICENSED FREE OF CHARGE, THERE IS NO WARRANTY
FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW.  EXCEPT WHEN
OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES
PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED
OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.  THE ENTIRE RISK AS
TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU.  SHOULD THE
PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING,
REPAIR OR CORRECTION.

  12. IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY MODIFY AND/OR
REDISTRIBUTE THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES,
INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING
OUT OF THE USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED
TO LOSS OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY
YOU OR THIRD PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER
PROGRAMS), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE
POSSIBILITY OF SUCH DAMAGES.

		     END OF TERMS AND CONDITIONS

	    How to Apply These Terms to Your New Programs

  If you develop a new program, and you want it to be of the greatest
possible use to the public, the best way to achieve this is to make it
free software which everyone can redistribute and change under these terms.

  To do so, attach the following notices to the program.  It is safest
to attach them to the start of each source file to most effectively
convey the exclusion of warranty; and each file should have at least
the "copyright" line and a pointer to where the full notice is found.

    &lt;one line to give the program's name and a brief idea of what it does.&gt;
    Copyright (C) &lt;year&gt;  &lt;name of author&gt;

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


Also add information on how to contact you by electronic and paper mail.

If the program is interactive, make it output a short notice like this
when it starts in an interactive mode:

    Gnomovision version 69, Copyright (C) year  name of author
    Gnomovision comes with ABSOLUTELY NO WARRANTY; for details type `show w'.
    This is free software, and you are welcome to redistribute it
    under certain conditions; type `show c' for details.

The hypothetical commands `show w' and `show c' should show the appropriate
parts of the General Public License.  Of course, the commands you use may
be called something other than `show w' and `show c'; they could even be
mouse-clicks or menu items--whatever suits your program.

You should also get your employer (if you work as a programmer) or your
school, if any, to sign a "copyright disclaimer" for the program, if
necessary.  Here is a sample; alter the names:

  Yoyodyne, Inc., hereby disclaims all copyright interest in the program
  `Gnomovision' (which makes passes at compilers) written by James Hacker.

  &lt;signature of Ty Coon&gt;, 1 April 1989
  Ty Coon, President of Vice

This General Public License does not permit incorporating your program into
proprietary programs.  If your program is a subroutine library, you may
consider it more useful to permit linking proprietary applications with the
library.  If this is what you want to do, use the GNU Library General
Public License instead of this License.
</pre>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="notes.html">
  <div class="gb_window_part_center">Help: Notes</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_notes">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <a name="notes"></a>
      <h1>Notes</h1>
      <p>
       This table provides an overview of all
       <a href="glossary.html#note">notes</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>The name of the NVT to which the note applies.  The name is truncated if
              it is too long for the column.</td>
        </tr>
        <tr>
          <td>Text</td>
          <td>An excerpt from the beginning of the text of the note.  If the note has
              been orphaned because the task it applies to was removed, then "Orphan"
              appears above the excerpt, in bold.
          </td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delete Note</h4>
      <p>
       Pressing the delete icon <img src="/img/delete.png" alt="Delete" title="Delete" /> will
       remove the note immediately.  The list of notes will be updated.
      </p>

      <h4>Note Details</h4>
      <p>
       Pressing the details icon
       <img src="/img/details.png" alt="Details" title="Details" />
       will show the  <a href="#notedetails">Note Details</a> page.  This page has
       full details of the note, including the note text and all
       contraints on the note.
      </p>

      <h4>Edit Note</h4>
      <p>
       A click on the edit icon <img src="/img/edit.png" alt="Edit" title="Edit" />
       will show the <a href="#editnote">Edit Note</a> page, which allows modification
       of the note.
      </p>

      <a name="newnote"></a>
      <h2>New Note</h2>
      <p>
       For creating a new note this dialog offers the following entries.
       Below the entries are details of the result that may be associated with
       the note.
       Hit the button "Create Note" to submit the new note.
       The previous page will be updated.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Hosts</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Port</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Threat</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Task</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Result</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Text</td>
          <td>yes</td>
          <td>600</td>
          <td>Free form text</td>
          <td>This issue will go away when we switch to GNU/Hurd.</td>
        </tr>
      </table>

      <a name="notedetails"></a>
      <h2>Note Details</h2>
      <p>
       A page that provides detailed information about a note.
       This includes the NVT, creation time, modification time,
       all constraints on the note and the full text of the note.
      </p>
      <p>
       Clicking on the NVT name will go to the NVT Details page.
      </p>

      <a name="editnote"></a>
      <h2>Edit Note</h2>
      <p>
       A page for modifying a note.  The fields are like those on the
       <a href="#newnote">New Note</a> page.
      </p>
      <p>
       Hit the button "Save Note" to submit the modification.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="nvts.html">
  <div class="gb_window_part_center">Help: NVTs</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <a name="nvts"></a>
      <h1>Network Vulnerability Tests (NVTs)</h1>
      <p>
       Currently, there is one page in the web interface
       about <a href="glossary.html#nvt">NVT</a>s.
      </p>

      <a name="nvtdetails"></a>
      <h2>NVT Details</h2>
      <p>
       A page that provides detailed information about an NVT.
       This includes the NVT family and the full description of the NVT,
       as well as a table listing all notes on the NVT.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="performance.html">
  <div class="gb_window_part_center">Help: Performance</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_system_reports&amp;duration=86400">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <a name="performance"></a>
      <h1>Performance</h1>
      <p>
       This page provides a system performance overview.
      </p>
      <p>
       A number of graphs summarize the performance of the hardware and
       operating system.  Initially the graphs summarize the past day of
       activity.  At the top of the dialog are links to other time periods,
       like the past hour and month.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="overrides.html">
  <div class="gb_window_part_center">Help: Overrides</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_overrides">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <a name="overrides"></a>
      <h1>Overrides</h1>
      <p>
       This table provides an overview of all
       <a href="glossary.html#override">overrides</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>The name of the NVT to which the override applies.  The name is truncated if
              it is too long for the column.</td>
        </tr>
        <tr class="even">
          <td>From</td>
          <td>The original threat for which this override applies.</td>
        </tr>
        <tr class="odd">
          <td>To</td>
          <td>The new threat that is assigned to the report item if the override
              is applied.</td>
        </tr>
        <tr class="even">
          <td>Text</td>
          <td>An excerpt from the beginning of the text of the override.  If the override has
              been orphaned because the task it applies to was removed, then "Orphan"
              appears above the excerpt, in bold.
          </td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delete Override</h4>
      <p>
       Pressing the delete icon <img src="/img/delete.png" alt="Delete" title="Delete" /> will
       remove the override immediately.  The list of overrides will be updated.
      </p>

      <h4>Override Details</h4>
      <p>
       Pressing the details icon
       <img src="/img/details.png" alt="Details" title="Details" />
       will show the  <a href="#overridedetails">Override Details</a> page.
       This page has full details of the override.
      </p>

      <h4>Edit Override</h4>
      <p>
       A click on the edit icon <img src="/img/edit.png" alt="Edit" title="Edit" />
       will show the <a href="#editnote">Edit Override</a> page, which allows modification
       of the override.
      </p>

      <a name="newoverride"></a>
      <h2>New Override</h2>
      <p>
       For creating a new override this dialog offers the following entries.
       Below the entries are details of the result that may be associated with
       the override.
       Hit the button "Create Override" to submit the new override.
       The previous page will be updated.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Mandatory</td>
          <td>Max Length</td>
          <td>Syntax</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Hosts</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td>Any, host1</td>
        </tr>
        <tr class="even">
          <td>Port</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td>Any, http (80/tcp)</td>
        </tr>
        <tr class="odd">
          <td>Threat</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td>Any, Low</td>
        </tr>
        <tr class="even">
          <td>New Threat</td>
          <td>yes</td>
          <td>--</td>
          <td>Choice</td>
          <td>False Positive, Medium</td>
        </tr>
        <tr class="odd">
          <td>Task</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td>Any, Building A</td>
        </tr>
        <tr class="odd">
          <td>Result</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td>Any, UUID</td>
        </tr>
        <tr class="odd">
          <td>Text</td>
          <td>yes</td>
          <td>600</td>
          <td>Free form text</td>
          <td>This specific version is needed and patched. In intranet: Patched Sytem 1-42.</td>
        </tr>
      </table>

      <a name="overridedetails"></a>
      <h2>Override Details</h2>
      <p>
       A page that provides detailed information about an override.
       This includes the NVT, creation time, modification time,
       all application rules of the override, the full text of the override and
       a preview of the appearance of the Override within a report.
      </p>
      <p>
       Clicking on the NVT name will go to the NVT Details page.
      </p>

      <a name="editoverride"></a>
      <h2>Edit Override</h2>
      <p>
       A page for modifying a override.  The fields are like those on the
       <a href="#newoverride">New Override</a> page.
       Note that the change of a field to "Any" cannot be reverted.
      </p>
      <p>
       Hit the button "Save Override" to submit the modification.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="reports.html">
  <div class="gb_window_part_center">Help: Reports</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_tasks&amp;task_id=343435d6-91b0-11de-9478-ffd71f4c6f29&amp;overrides=1">Jump to dialog with sample content</a></div>
    <div style="text-align:left">

      <br/>
      <a name="tasksummary"></a>
      <h1>Task Summary</h1>
      <p>
       This information dialog lists name, status and number of reports for
       the task for which the report list is shown below.
       It also lists the <a href="glossary.html#scanconfig">Scan Config</a>,
       <a href="glossary.html#escalator">Escalator</a>,
       <a href="glossary.html#schedule">Schedule</a> and
       <a href="glossary.html#target">Target</a> for the shown report, if
       any were chosen. Information about the chosen Scan Config, Escalator,
       Schedule or Target is accessible by clicking on the respective items
       name.
      </p>

      <a name="reports"></a>
      <h1>Reports</h1>
      <p>
       This table provides an overview of all
       <a href="glossary.html#report">reports</a>
       for the selected task (see Task Summary box).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Report</td>
          <td>Shows the time stamp for the report. This indicates
              when the scan finished and the final report
              was created.</td>
        </tr>
        <tr>
          <td>Threat</td>
          <td>Threat level of the report. These levels
            can occur:
            <br />
            <table>
              <tr>
                <td valign="top"><img src="/img/high_big.png" /></td>
                <td>
                  High: At least one NVT reported severity "High" for at least one
                  target host in the report.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/medium_big.png" /></td>
                <td>
                  Medium: Severity "High" does not occur in the
                  report. At least one NVT reported severity "Medium"
                  for at least one target host in the report.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/low_big.png" /></td>
                <td>
                  Low: Neither severity "High" nor "Medium" occurs in the report.
                  At least one NVT reported severity "Low" for at
                  least one target host in the report.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/none_big.png" /></td>
                <td>
                  None: The report does not contain a single severe finding. This could
                  also mean that the scan was interrupted or failed, especially if
                  even no log information occur in the report.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Scan Results</td>
          <td>This column lists the number
            of occurances for each severity level.
            <br />
            <table>
              <tr><td valign="top"><img src="/img/high.png" alt="High" title="High" /></td><td>
                  The number of issues of severity "High" found during the scan.
              </td></tr>
              <tr><td valign="top"><img src="/img/medium.png" alt="Medium" title="Medium" /></td><td>
                  The number of issues of severity "Medium" found during the scan.
              </td></tr>
              <tr><td valign="top"><img src="/img/low.png" alt="Low" title="Low" /></td><td>
                  The number of issues of severity "Low" found during the scan.
              </td></tr>
              <tr><td valign="top"><img src="/img/log.png" alt="Log" title="Log" /></td><td>
                  The number of log-entries that occured during the scan.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>Download</td>
          <td>This field offers to download the report in various formats.
              Formats can be configured on the
              <a href="configure_report_formats.html">Report Formats</a>
              page.  The predefined formats include:
            <br />
            <table>
              <tr><td valign="top">PDF:</td><td>
                  A single PDF file is created from the report details.
              </td></tr>
              <tr><td valign="top">HTML:</td><td>
                  A single HTML file is created from the report details.
                  This is similar to the page created via action "Details"
                  but is an self-contained document that could be viewed
                  independent of GSA.
              </td></tr>
              <tr><td valign="top">XML:</td><td>
                  A single XML file is created from the report details.
                  This should be the basis for creating your own style
                  for a report or post-process the results in other ways.
              </td></tr>
              <tr><td valign="top">TXT:</td><td>
                  A single plain text file is created from the report details.
              </td></tr>
              <tr><td valign="top">NBE:</td><td>
                  A single NBE file is created. This format is supported
                  by OpenVAS-Client and in the past often used for
                  post-processing the results. It is offered primarily
                  for compatibility purposes. It is recommended to
                  set up post-processing based on the XML file, not
                  based on the NBE file.
              </td></tr>
              <tr><td valign="top">ITG:</td><td>
                  Any tabular results of IT-Grundschutz scans are collected
                  from the report and assembled to a single CSV file for
                  simple integration into spreadsheet applications or
                  databases.
              </td></tr>
              <tr><td valign="top">CPE:</td><td>
                  Any tabular results of CPE inventory scans are collected
                  from the report and assembled to a single CSV file for
                  simple integration into spreadsheet applications or
                  databases.
              </td></tr>
            </table>
          </td>
        </tr>
      </table>

      <a name="overrides"></a>
      <h3>Overrides</h3>
      <p>
       By default the configured <a href="glossary.html#override">overrides</a> are applied.
       The selection allows to switch to a view without applying overrides.
       In the table view, threat and scan results numbers might change
       when switching this selection.
       By pressing the refresh
       <img src="/img/refresh.png" alt="Refresh" title="Refresh" /> icon a change is confirmed.
      </p>
      <p>
       The selection that is active for the present page is marked with a hook (&#8730;).
      </p>
      <p>
       Note that leaving this page will reset the overrides selection to apply overrides.
      </p>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Details</h4>
      <p>
       Pressing the details icon
       <img src="/img/details.png" alt="Details" title="Details" /> will
       display all report details on a new page
       <a href="/help/view_report.html">View Report</a>.
      </p>

      <h4>Delete Report</h4>
      <p>
       Pressing the delete icon <img src="/img/delete.png" alt="Delete" title="Delete" /> will
       remove the report immediately. The list of reports will be updated.
      </p>

      <a name="notes"></a>
      <h1>Notes</h1>
      <p>
       This table provides an overview of all
       <a href="glossary.html#note">notes</a>
       that apply to any result generated by the task.
       It is formatted much like the <a href="notes.html">Notes</a> page.
      </p>

      <a name="overrides"></a>
      <h1>Overrides</h1>
      <p>
       This table provides an overview of all
       <a href="glossary.html#override">overrides</a>
       that apply to any result generated by the task.
       It is formatted much like the <a href="overrides.html">Overrides</a> page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scanconfig_details.html">
  <div class="gb_window_part_center">Help: Scan Config Details</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_config&amp;name=Full%20and%20fast">Jump to example dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Scan Config Details</h1>
      <p>
       This dialog shows the name and comment of a given
       <a href="glossary.html#scanconfig">Scan Configuration</a> together with the
       associated configuration parameters itself.
      </p>

      <h2>Network Vulnerability Test Families</h2>
      <p>
       This table provides an overview of the selected NVTs and NVT Families.
       A Trend icon next to the Family column of the table indicates whether new
       families will automaticall be included ("Grow") <img src="/img/trend_more.png" alt="Grow" title="Grow" />
       or not ("Static") <img src="/img/trend_nochange.png" alt="Static" title="Static" />.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Family</td>
          <td>Shows the name of the NVT Family.</td>
        </tr>
        <tr class="even">
          <td>NVT's selected</td>
          <td>The number of NVTs that would be considered
              with the current NVT set and the total number of NVTs in this family.</td>
        </tr>
        <tr class="odd">
          <td>Family</td>
          <td>Shows the name of the NVT Family.</td>
        </tr>
        <tr class="even">
          <td>NVT's selected</td>
          <td>The number of NVTs that would be considered
              with the current NVT set and the total number of NVTs in this family.</td>
        </tr>
        <tr class="odd">
          <td>Trend</td>
          <td>Shows the Trend, which indicates whether new NVTs of this family are
              automatically added to the configuration ("Grow") <img src="/img/trend_more.png" alt="Grow" title="Grow" /> or
              not ("Static") <img src="/img/trend_nochange.png" alt="Static" title="Static" />. </td>
        </tr>
      </table>

      <h3>Actions</h3>

      <h4>Scan Config Family Details</h4>
      <p>
       A click on the details icon <img src="/img/details.png" alt="Details" title="Details" />
       will show an intermediate detailed <a href="scanconfig_family_details.html">list of NVTs</a> and its preferences.
      </p>

      <h2>Scanner Preferences</h2>
      <p>
       This table shows the preferences of the scan engine itself.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows the name of the Scanner Preference.</td>
        </tr>
        <tr class="even">
          <td>Value</td>
          <td>Shows the current value of the Scanner Preference.</td>
        </tr>
      </table>

      <h2>Network Vulnerability Test Preferences</h2>
      <p>
       Network Vulnerability Tests can have multiple preferences that influence the
       test behaviour.
       This table lists one preference and the current value per row.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>Shows the name of an NVT.</td>
        </tr>
        <tr class="even">
          <td>Name</td>
          <td>Shows the name of a prefence for an NVT.</td>
        </tr>
        <tr class="odd">
          <td>Value</td>
          <td>Shows current value of a prefence for an NVT.</td>
        </tr>
      </table>

      <h3>Actions</h3>

      <h4>Scan Config NVT Details</h4>
      <p>
       A click on the details icon
       <img src="/img/details.png" alt="Details" title="Details" /> will open the
       <a href="scanconfig_nvt_details.html">Scan Config NVT Details</a> dialog with detailed information about a certain NVT
       and all its preferences.
      </p>

      <h2>Tasks using this Config</h2>
      <p>
       The tasks that use the shown config are listed.
       A click on the list icon <img src="/img/list.png" alt="List" title="List" /> will open
       the <a href="reports.html#tasksummary">Task summary</a> page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scanconfig_editor.html">
  <div class="gb_window_part_center">Help: Scan Config Editor</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Scan Config Editor</h1>
      <p>
       The Scan Config Editor allows modification of all parameters of a
       <a href="glossary.html#scanconfig">Scan Configuration</a>.
       These include a selection of <a href="glossary.html#nvt">NVT</a>s and the
       specifications how the selection should automatically updated, NVT Preferences
       and Timeouts and advanced Scanner Preferences.
      </p>
      <p>
       Note that only Scan Configurations that are not currently in use by a
       <a href="glossary.html#task">Task</a> allow modifications.
      </p>

      <h1>Edit Scan Config Details</h1>
      <p>
       This dialog shows the name and comment of a given
       <a href="glossary.html#scanconfig">Scan Configuration</a> together with the
       associated configuration parameters itself.
       It allows to adjust all parameters of the Scan Configuration.
      </p>
      <p>
       Note: In order to save modifications, the button labelled "Save Config" must
       be clicked. The edit action <img src="/img/edit.png" alt="Edit" title="Edit" />
       on NVT Families will save the selection.
      </p>

      <h2>Edit Network Vulnerability Test Families</h2>
      <p>
       This table provides an overview of the selected NVTs and NVT Families and allow
       to choose which Families or individual NVTs should be included.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Family</td>
          <td>Shows the name of the NVT Family. The trend icon in the Family column
              header allows to specify whether new families will automaticall be
              included ("Grow") <img src="/img/trend_more.png" alt="Grow" title="Grow" /> or not ("Static")
              <img src="/img/trend_nochange.png" alt="Static" title="Static" />.</td>
        </tr>
        <tr class="even">
          <td>NVT's selected</td>
          <td>Shows the number of NVTs that would be considered with the current
              selection and the total number of NVTs in this family.</td>
        </tr>
        <tr class="odd">
          <td>Trend</td>
          <td>Allows modification of the trend for this family. If the trend is set to
             "Grow" <img src="/img/trend_more.png" alt="Grow" title="Grow" />, new NVTs of this family are
              automatically added to the configuration. If it is set to "Static"
              <img src="/img/trend_nochange.png" alt="Static" title="Static" />, the selection will not be
              automatically changed. </td>
        </tr>
        <tr class="even">
          <td>Select all NVT's</td>
          <td>If this checkbox is ticked, all NVTs that are currently available in this
              Family will be selected.</td>
        </tr>
      </table>

      <h3>Actions</h3>

      <h4>Save Config and edit Family Details</h4>
      <p>
       A click on the edit icon <img src="/img/edit.png" alt="Edit" title="Edit" />
       will save the modifications and show the
       <a href="scanconfig_editor_nvt_families.html">Edit Scan Config Family Details</a>
       page which shows details about NVTs within the family and allows to select or
       deselect individual NVTs.
      </p>

      <h2>Edit Scanner Preferences</h2>
      <p>
       This table shows the preferences of the scan engine itself and allows to modify
       these. This feature is intended for advanced users only. Modifications will be
       saved after a click on the "Save Config" button below the table.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows the name of the Scanner Preference.</td>
        </tr>
        <tr class="even">
          <td>Value</td>
          <td>Shows the current value of the Scanner Preference.</td>
        </tr>
      </table>

      <h2>Network Vulnerability Test Preferences</h2>
      <p>
       Network Vulnerability Tests can have multiple preferences that influence the
       test behaviour.
       This table lists one preference and the current value per row.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>Shows the name of an NVT.</td>
        </tr>
        <tr class="even">
          <td>Name</td>
          <td>Shows the name of a prefence for an NVT.</td>
        </tr>
        <tr class="odd">
          <td>Value</td>
          <td>Shows current value of a prefence for an NVT.</td>
        </tr>
      </table>

      <h3>Actions</h3>

     <h4>Scan Config NVT Details</h4>
      <p>
       A click on the details icon
       <img src="/img/details.png" alt="Details" title="Details" /> will open the
       <a href="scanconfig_nvt_details.html">Scan Config NVT Details</a> dialog
       with detailed information about a certain NVT and all its preferences.
      </p>

      <h4>Edit Scan Config NVT Details</h4>

      <p>
       A click on the edit icon <img src="/img/edit.png" alt="Edit" title="Edit" />
       will open the <a href="scanconfig_editor_nvt.html">Edit Scan Config NVT Details</a>
       dialog with detailed information about a certain NVT and all its preferences.
       This page will provide an overview over all preferences and the currently set
       Timeout for this NVT and allow modifications.
      </p>

      <h2>Tasks using this Config</h2>
      <p>
       The tasks that use the shown config are listed.
       A click on the list icon <img src="/img/list.png" alt="List" title="List" /> will open
       the <a href="reports.html#tasksummary">Task summary</a> page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scanconfig_editor_nvt_families.html">
  <div class="gb_window_part_center">Help: Scan Config Editor NVT Families</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <a name="editscanconfigfamilydetails"></a>
      <h1>Edit Scan Config Family Details</h1>
      <p>
       This page gives an overview of <a href="glossary.html#nvt">NVT</a>s of one
       family in a <a href="glossary.html#scanconfig">Scan Configuration</a>.
      </p>

      <h2>Edit Network Vulnerability Tests</h2>
      <p>
       This table provides an overview of NVTs of one family in a Scan Configuration
       and allows to include or exclude a NVT and to modify its preferences or timeout.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows the name of a NVT.</td>
        </tr>
        <tr class="even">
          <td>OID</td>
          <td>Shows the OID of a NVT.</td>
        </tr>
        <tr class="odd">
          <td>Risk</td>
          <td>Shows the risk factor of a NVT. Any NVT has a value.</td>
        </tr>
        <tr class="even">
          <td>CVSS</td>
          <td>Shows the CVSS of a NVT. Most, but not all NVTs have a value.</td>
        </tr>
        <tr class="odd">
          <td>Timeout</td>
          <td>Shows current timeout setting in seconds for a NVT (or "default" if the
              default value is used).</td>
        </tr>
        <tr class="even">
          <td>Prefs</td>
          <td>Shows the number of Preferences of a NVT.</td>
        </tr>
        <tr class="odd">
          <td>Selected</td>
          <td>Shows whether the NVT is included in the Scan Config or not and allows to
              add or remove it from the selection.</td>
        </tr>
      </table>

      <h3>Actions</h3>

      <h4>NVT Details</h4>
      <p>
       A click on the details icon <img src="/img/details.png" alt="Details" title="Details" />
       will lead to the page listing <a href="scanconfig_nvt_details.html">NVT details</a>.
      </p>

      <h4>Select and Edit NVT Details</h4>
      <p>
       A click on the edit icon <img src="/img/edit.png" alt="Edit" title="Edit" />will add the NVT to the selection
       and lead to a page that lists <a href="scanconfig_editor_nvt.html">NVT details and allows to modify preferences</a> and
       the timeout.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scanconfig_editor_nvt.html">
  <div class="gb_window_part_center">Help: Scan Config editor NVT</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Edit Scan Config NVT Details</h1>
      <p>
       This dialog shows information of a single <a href="glossary.html#nvt">NVT</a>
       and its preference settings within a
        <a href="glossary.html#scanconfig">Scan Configuration</a>.
      </p>

      <h2>Edit Network Vulnerability Test</h2>

      <h3>Details</h3>
      <p>
       Provides information like the name of the NVT, a summary, its OID, Family
       Affiliation and References.
      </p>

      <h3>Description</h3>
      <p>
       This section provides a description of the NVT. It might contain a
       classification into a Risk Factor and suggest solutions to fix the issue that
       can be detected by this NVT.
      </p>

      <h3>Preferences</h3>
      <p>
       This table shows values of the timeout and NVT specific preferences one per
       row. Depending on the Preference, there are different input methods (e.g.
       checkboxes, text input fields, etc).
      </p>
      <p>
       Note: After any changes, the "Save Config" button has to be clicked.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows the name of the NVT Preference.</td>
        </tr>
        <tr class="even">
          <td>Value</td>
          <td>The value for the NVT Preference in the given Scan Configuration.
              For different Preference Types, different input methods are shown.</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scanconfig_family_details.html">
  <div class="gb_window_part_center">Help: Scan Config Family Details</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <a name="scanconfigfamilydetails"></a>
      <h1>Scan Config Family Details</h1>
      <p>
       This page gives an overview of <a href="glossary.html#nvt">NVT</a>s of one
       family in a <a href="glossary.html#scanconfig">Scan Configuration</a>.
      </p>

      <h2>Network Vulnerability Tests</h2>
      <p>
       This table provides an overview of NVTs of one family in a Scan Configuration.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows the name of a NVT.</td>
        </tr>
        <tr class="even">
          <td>OID</td>
          <td>Shows the OID of a NVT.</td>
        </tr>
        <tr class="odd">
          <td>Risk</td>
          <td>Shows the risk factor of a NVT. Any NVT has a value.</td>
        </tr>
        <tr class="even">
          <td>CVSS</td>
          <td>Shows the CVSS of a NVT. Most, but not all NVTs have a value.</td>
        </tr>
        <tr class="odd">
          <td>Timeout</td>
          <td>Shows current timeout setting in seconds for a NVT (or "default" if the
              default value is used).</td>
        </tr>
        <tr class="even">
          <td>Prefs</td>
          <td>Shows the number of Preferences of a NVT.</td>
        </tr>
      </table>

      <h3>Actions</h3>

      <h4>NVT Details</h4>
      <p>
       A click on the details icon <img src="/img/details.png" alt="Details" title="Details" />
       will lead to the page listing <a href="scanconfig_nvt_details.html">NVT details</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scanconfig_nvt_details.html">
  <div class="gb_window_part_center">Help: Scan Config NVT Details</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Scan Config NVT Details</h1>
      <p>
       This dialog shows information of a single <a href="glossary.html#nvt">NVT</a>
       and its preference settings within a
       <a href="glossary.html#scanconfig">Scan Configuration</a>.
      </p>

      <h2>Network Vulnerability Test</h2>

      <h3>Details</h3>
      <p>
       Provides information like the name of the NVT, a summary, its OID, Family
       Affiliation and References. Also a risk class is provided and for most NVTs
       a CVSS value.
      </p>

      <p>
       Risk catogories:
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Risk factor</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>None</td>
          <td> The NVT is only gathering information about the target
            system and not reporting any vulnerability. Or it arranges
            things internally such as setting special knowledge base
            entries.
          </td>
        </tr>
        <tr class="even">
          <td>Low</td>
          <td> The chances of the vulnerability being exploited
            is very low. This corresponds to CVSS Base score
            &lt;= 2.
          </td>
        </tr>
        <tr class="odd">
          <td>Medium</td>
          <td> The chances of the vulnerability being exploited
            is moderate. This corresponds to CVSS Base score
            &gt; 2 and &lt;= 5.
          </td>
        </tr>
        <tr class="even">
          <td>High</td>
          <td> The chances of the vulnerability being exploited
            is high. This corresponds to CVSS Base score
            &gt; 5 and &lt;= 8.
          </td>
        </tr>
        <tr class="odd">
          <td>Critical</td>
          <td> This vulnerability could be easily exploited
            and the damages could be significant.
            This corresponds to CVSS Base score
            &gt; 8 and &lt;= 10.
          </td>
        </tr>
      </table>

      <h3>Description</h3>
      <p>
       This section provides a description of the NVT. It contains a
       risk classification and suggests solutions to fix the issue that
       is detected by this NVT.
      </p>

      <h3>Preferences</h3>
      <p>
       This table shows values of the timeout and NVT specific preferences one per
       row.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows the name of the NVT Preference.</td>
        </tr>
        <tr class="even">
          <td>Value</td>
          <td>The value for the NVT Preference in the given Scan Configuration.</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="settings.html">
  <div class="gb_window_part_center">Help: Settings</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_settings">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Settings</h1>
      <p>
       The management of settings is only accessible for users that own the
       "Administrator" role.
      </p>
      <p>
       This dialog allows you to view the current settings of your installation.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="tasks.html">
  <div class="gb_window_part_center">Help: Tasks</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_tasks&amp;overrides=1">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <a name="tasks"></a>
      <h1>Tasks</h1>
      <p>
       This table provides an overview of all configured
       <a href="glossary.html#task">tasks</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Task</td>
          <td>Shows name of the task. Names are not
              necessarily unique, so the same name
              may appear multiply. An internal ID
              distinguishes the tasks.</td>
        </tr>
        <tr>
          <td>Status</td>
          <td>The status of a task is one of these:
            <br />
            <table>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Running">
                    <div class="progressbar_bar" style="width:42px;"></div>
                    <div class="progressbar_text">42 %</div>
                   </div>
                </td><td>
                  An active scan for this task is running and has completed 42%.
                  The percentage refers
                  to the number of hosts multiplied with the number of NVTs. Thus,
                  it may not correspond perfectly with the duration of the scan.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="New">
                    <div class="progressbar_bar_new" style="width:100px;"></div>
                    <div class="progressbar_text"><i><b>New</b></i></div>
                  </div>
                </td><td>
                  The task has not been started since it was created.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Requested">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Requested</div>
                  </div>
                </td><td>
                  This task has just been started and prepares to delegate the scan
                  to the scan engine.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Delete Requested">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Delete Requested</div>
                  </div>
                </td><td>
                  The user has recently deleted the task. Currently the manager
                  server cleans up the database which might take some time because
                  any reports associated with this task will be removed as well.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Stop Requested">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Stop Requested</div>
                  </div>
                </td><td>
                  The user has recently stopped the scan. Currently the manager
                  server has submitted this command to the scanner, but the scanner
                  has not yet cleanly stopped the scan.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Stopped">
                    <div class="progressbar_bar_request" style="width:15px;"></div>
                    <div class="progressbar_text">
                      Stopped at <xsl:value-of select="15"/> %
                    </div>
                  </div>
                </td><td>
                  The last scan for this task was stopped by the user.  The scan was
                  15% complete when it stopped.  The newest
                  report might be incomplete. Also, this status is set in cases
                  where the task was stopped due to other arbitrary circumstances
                  such as power outage.  The task will remain stopped even if the
                  scanner or manager server is restarted, for example on reboot.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Pause Requested">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Pause Requested</div>
                  </div>
                </td><td>
                  The user has recently paused the scan. The manager
                  server has submitted this command to the scanner, but the scanner
                  has not yet cleanly paused the scan.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Paused">
                    <div class="progressbar_bar_request" style="width:82px;"></div>
                    <div class="progressbar_text">
                      Paused at <xsl:value-of select="82"/> %
                    </div>
                  </div>
                </td><td>
                  The last scan for this task was paused by the user.   The scan was
                  82% complete when it was paused.  The newest report might be incomplete.
                  The task will change to stopped if the scanner or manager
                  server is restarted, for example on reboot.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Internal Error">
                    <div class="progressbar_bar_error" style="width:100px;"></div>
                    <div class="progressbar_text">Internal Error</div>
                  </div>
                </td><td>
                  The last scan for this task resulted in an error. The newest
                  report might be incomplete or entirely missing. In the latter case
                  the newest visible report is in fact one from an earlier scan.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Done">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Done</div>
                  </div>
                </td><td>
                  The Task returned successful from a scan and produced a report. The
                  newest report is complete with regard to targets and scan configuration
                  of the task.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Reports: Total</td>
          <td>The number of reports that have been created by
              running this task.</td>
        </tr>
        <tr>
          <td>Reports: First</td>
          <td>Date when the first report was created.
              This field is left empty if less then 2
              reports are available.</td>
        </tr>
        <tr class="odd">
          <td>Reports: Last</td>
          <td>Date when the newest report was created.</td>
        </tr>
        <tr>
          <td>Threat</td>
          <td>Threat level of the newest report. These levels can occur:
            <br />
            <table>
              <tr>
                <td valign="top"><img src="/img/high_big.png" /></td>
                <td>
                  High: At least one NVT reported severity "High" for at least one
                  target host in the newest report.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/medium_big.png" /></td>
                <td>
                  Medium: Severity "High" does not occur in the newest
                  report. At least one NVT reported severity "Medium"
                  for at least one target host in the newest report.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/low_big.png" /></td>
                <td>
                  Low: Neither severity "High" nor "Medium" occurs in the newest report.
                  At least one NVT reported severity "Low" for at
                  least one target host in the newest report.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/none_big.png" /></td>
                <td>
                  None: No security threat occurs in the newest report. Perhaps
                  some NVT created a log information, so the report is not necessarily empty.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Trend</td>
          <td>Describes the change of threat between the newest
              report and the report before the newest:
            <br />
            <table>
              <tr>
                <td valign="top"><img src="/img/trend_up.png" /></td>
                <td>
                  Threat level increased: In the newest report at least one NVT for at least one
                  target host reported a higher severity level than any NVT reported
                  in the report before the newest one.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_more.png" /></td>
                <td>
                  Threat number increased: The threat level of the last report
                  and the report before the
                  last report is the same. But the newest report contains more
                  security issues of this threat level than the report before.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_nochange.png" /></td>
                <td>
                  Threat did not change: The number of High, Medium, Low and Log
                  reports of the newest report and the one before are identical.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_less.png" /></td>
                <td>
                  Threat number decreased: The threat level of the last
                  report and the report before the
                  last report is the same. But the newest report contains less
                  of the security issues of this threat level than the report before.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_down.png" /></td>
                <td>
                  Threat level decreased: In the newest report at no NVT for at any
                  target host reported a severity level as high as the severity
                  level of the report before the newest one.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <a name="sorting"></a>
      <h3>Sorting</h3>
      <p>
       The table can be sorted either by the Task name or by the Status column.
       Therefore click on the descending <img src="/img/descending.png" alt="Sort descending" title="Sort descending" />
       or ascending <img src="/img/ascending.png" alt="Sort ascending" title="Sort ascending" /> icon.
       The icon of the current choice will appear greyed out <img src="/img/ascending_inactive.png" alt="Current sort ascending" title="Current sort ascending" />, <img src="/img/descending_inactive.png" alt="Current sort descending" title="Current sort descending" />.
       The list will be updated immediately.
      </p>

      <a name="autorefresh"></a>
      <h3>Auto-refresh</h3>
      <p>
       The tasks overview allows to set a time interval for
       an automatic page refresh. Select one of the
       intervals (10 seconds, 30 seconds or 60 seconds)
       and confirm with pressing the refresh
       <img src="/img/refresh.png" alt="Refresh" title="Refresh" /> icon.
      </p>
      <p>
       The selection that is currently for the present page is marked with a hook (&#8730;).
      </p>
      <p>
       Note that leaving this page will reset the refresh interval to manual refresh.
      </p>

      <a name="overrides"></a>
      <h3>Overrides</h3>
      <p>
       By default the configured <a href="glossary.html#override">overrides</a> are applied.
       The selection allows to switch to a view without applying overrides.
       In the table view, threat, threat numbers and trend might change
       when switching this selection.
       By pressing the refresh
       <img src="/img/refresh.png" alt="Refresh" title="Refresh" /> icon a change is confirmed.
      </p>
      <p>
       The selection that is active for the present page is marked with a hook (&#8730;).
      </p>
      <p>
       Note that leaving this page will reset the overrides selection to apply overrides.
      </p>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Start Task</h4>
      <p>
       Pressing the start icon <img src="/img/start.png" alt="Start" title="Start" /> will
       start a new scan. The list of tasks will be updated.
      </p>
      <p>
       This action is only available if the task has status "New" or "Done" and
       is not a scheduled task.
      </p>

      <h4>Pause Task</h4>
      <p>
       Pressing the pause icon <img src="/img/pause.png" alt="Pause" title="Pause" /> will
       pause a running task. The list of tasks will be updated.
      </p>
      <p>
       This action is only available if the task has status "Running" or "Requested" and
       is not a scheduled task.
      </p>

      <h4>Schedule Details</h4>
      <p>
        Pressing the "Schedule Details" icon <img src="/img/scheduled.png"
          alt="Schedule Details" title="Schedule Details" /> will switch to an
        overview of the details of the schedule used for this task.
      </p>
      <p>
        This action is only available if the task is a scheduled task.
      </p>

      <h4>Resume Task</h4>
      <p>
       Pressing the resume icon <img src="/img/resume.png" alt="Resume"
         title="Resume" /> will resume a previously paused or stopped task. The list of
       tasks will be updated.
      </p>
      <p>
        This action is only available if the task has been stopped before, either
        manually or due to its scheduled duration.
      </p>

      <h4>Stop Task</h4>
      <p>
       Pressing the stop icon <img src="/img/stop.png" alt="Stop" title="Stop" /> will
       stop a running task. The list of tasks will be updated and for this task
       a half-finished report is added to the list of reports.
      </p>
      <p>
       This action is only available if the task status shows a progress bar.
      </p>

      <h4>Delete Task</h4>
      <p>
       Pressing the delete icon <img src="/img/delete.png" alt="Delete" title="Delete" /> will
       remove the task immediately. The list of tasks will be updated. Note that also all
       of the reports associated with this task will be removed.
      </p>
      <p>
       This action is only available if the task has status "New" or "Done".
      </p>

      <h4>Details</h4>
      <p>
       Pressing the details icon <img src="/img/details.png" alt="Details" title="Details" /> will
       switch to an overview on all reports for this task.
       It is the same action as clicking on the number of reports in the column "Reports: Total".
      </p>
      <p>
       This action is only available if at least one report is present.
      </p>

      <h4>Edit Task</h4>
      <p>
       Pressing the "Edit Task" icon <img src="/img/edit.png" alt="Edit Task"
         title="Edit Task" /> will
       switch to an overview of the configuration for this task and allows
       editing of some of the tasks properties.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="view_report.html">
  <div class="gb_window_part_center">Help: View Report</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html">Help Contents</a></div>
    <div class="float_right"><a href="/omp?cmd=get_report&amp;report_id=343435d6-91b0-11de-9478-ffd71f4c6f30">Jump to dialog with sample content</a></div>
    <div style="text-align:left">

      <br/>
      <a name="viewreport"></a>
      <h1>View Report</h1>
      <p>
       This "View Report" page summarizes all information the selected
       <a href="/help/glossary.html#report">report</a> contains.
       This page is structured and designed like the
       download formats HTML and PDF.
      </p>
      <p>
       It is a single page with links that
       refer to the same page further up or down.
       For example, the host names in the "Host" table link to the host
       results further down the page.
       The exception is the "Back to Tasks" link that refers to the
       <a href="/help/glossary.html#task">task</a>'s
       <a href="/help/reports.html">list of reports</a>.
      </p>

      <a name="overrides"></a>
      <h2>Overrides Selection</h2>
      <p>
       By default the configured <a href="glossary.html#override">overrides</a> are applied.
       The selection allows to switch to a view without applying overrides.
       In the table views, scan results numbers might change when switching this selection.
       By pressing the refresh
       <img src="/img/refresh.png" alt="Refresh" title="Refresh" /> icon a change is confirmed.
      </p>
      <p>
       The selection that is active for the present page is marked with a hook (&#8730;).
      </p>
      <p>
       Note that leaving this page will reset the overrides selection to apply overrides.
      </p>

      <h2>Download a report</h2>
      <p>
       To download the currently shown report, the <a href="glossary.html#report_format">format</a>
       can be chosen.
       The download will start shortly after a click on the "Download" button.  Report
       formats can be configured on the
       <a href="configure_report_formats.html">Report Formats</a>
       page.
      </p>

      <h2>Notes</h2>
      <p>
       Any <a href="/help/glossary.html#note">notes</a> that apply to a result are
       displayed under the result.  The notes for a result are sorted most recently
       created first.
      </p>
      <p>
       Each note has a group of action buttons
       <img src="/img/delete.png" alt="Delete" title="Delete" />
       <img src="/img/details.png" alt="Details" title="Details" />
       <img src="/img/edit.png" alt="Edit" title="Edit" />
       which affect the note as on the <a href="notes.html">Notes</a> page.
      </p>
      <p>
       To add a note to an NVT, click the new note button
       <img src="/img/new_note.png" alt="New Note" title="New Note" />
       on a result of the NVT.
      </p>
      <p>
       If a result has notes and note display is enabled in the filter (see below),
       then the notes icon
       <img src="/img/note.png" alt="Note" title="Note" />
       is shown on the result.  Clicking the icon jumps to the notes,
       which is helpful if the result has a very long description.
      </p>

      <h2>Overrides</h2>
      <p>
       If activated, any <a href="/help/glossary.html#override">overrides</a>
       that apply to a result are displayed under the result.
      </p>
      <p>
       Each override has a group of action buttons
       <img src="/img/delete.png" alt="Delete" title="Delete" />
       <img src="/img/details.png" alt="Details" title="Details" />
       <img src="/img/edit.png" alt="Edit" title="Edit" />
       which affect the override as on the <a href="overrides.html">Overrides</a> page.
      </p>
      <p>
       To add a override to an NVT, click the new override button
       <img src="/img/new_override.png" alt="New Override" title="New Override" />
       on a result of the NVT.
      </p>
      <p>
       If a result has overrides, then the overrides icon
       <img src="/img/override.png" alt="Overrides" title="Overrides" />
       is shown on the result.  Clicking the icon jumps to the overrides,
       which is helpful if the result has a very long description.
      </p>

      <h2>Result Sorting</h2>
      <p>
       Results shown on the page can be sorted either by the port number or by threat
       level, and ascending or descending.
       The sort order is changed by clicking on the respective text (e.g.
       "threat ascending").
      </p>

      <h2>Result Filtering</h2>
      <p>
       A checkbox for each threat level (High, Medium, Low and Log) can be ticked
       or unticked to
       include or exclude results of the respective threat level in the shown report.
       This can be combined with a text phrase, which limits the report to all the
       results that include the entered phrase.
       The "Show notes" checkbox toggles the display of notes.
      </p>
      <p>
       The list of results is updated after a click on the "Apply" button.
      </p>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
