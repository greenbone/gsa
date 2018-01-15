<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      xmlns="http://www.w3.org/1999/xhtml"
      extension-element-prefixes="gsa">
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
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2009, 2010, 2012-2016 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<xsl:include href="gsad.xsl"/>

<xsl:template name="availability">
  <xsl:param name="command" select="GET_TASKS"/>
  <xsl:choose>
    <xsl:when test="/envelope/capabilities/help_response/schema/command[name=$command]">
    </xsl:when>
    <xsl:otherwise>
      <p>
        <b>Note:</b> This feature is not available with the current OMP Server connection.
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="trashcan-availability">
  <xsl:choose>
    <xsl:when test="gsa:may-get-trash ()">
    </xsl:when>
    <xsl:otherwise>
      <p>
        <b>Note:</b> This feature is not available with the current OMP Server connection.
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="help-header">
  <xsl:param name="title"/>
  <xsl:param name="type"/>
  <xsl:param name="asset-type"/>
  <xsl:param name="info-type"/>
  <div class="section-header">
    <h1>
      <img class="icon icon-lg" src="/img/help.svg"/>
      <xsl:if test="boolean ($type)">
        <a href="/omp?cmd=get_{$type}s&amp;token={/envelope/token}"
           title="Resource overview page" style="margin-right:3px;">
          <img class="icon icon-sm" src="/img/{$type}.svg" alt="{$type}"/>
        </a>
      </xsl:if>
      <xsl:if test="boolean ($asset-type)">
        <a href="/omp?cmd=get_assets&amp;type={$asset-type}&amp;token={/envelope/token}"
           title="Resource overview page" style="margin-right:3px;">
          <img class="icon icon-sm" src="/img/{$asset-type}.svg" alt="{$asset-type}"/>
        </a>
      </xsl:if>
      <xsl:if test="boolean ($info-type)">
        <a href="/omp?cmd=get_info&amp;type={$info-type}&amp;token={/envelope/token}"
           title="Resource overview page" style="margin-right:3px;">
          <img class="icon icon-sm" src="/img/{$info-type}.svg" alt="{$info-type}"/>
        </a>
      </xsl:if>
      <xsl:value-of select="$title"/>
    </h1>
  </div>
</xsl:template>

<xsl:template name="details-window-line-actions">
  <xsl:param name="type"/>
  <xsl:param name="name"/>
  <xsl:param name="ultimate"/>
  <xsl:param name="clone" select="true ()"/>
  <xsl:param name="new" select="true ()"/>
  <xsl:param name="edit" select="true ()"/>

  <xsl:if test="$new">
    <h4>New <xsl:value-of select="$name"/></h4>
    <p>
      To create a new <xsl:value-of select="$name"/> click the new icon
      <img src="/img/new.svg" class="icon icon-sm" alt="New {$name}" title="New {$name}"/>
      which goes to the <a href="new_{$type}.html?token={/envelope/token}">
      New <xsl:value-of select="$name"/></a> page.
    </p>
  </xsl:if>

  <xsl:if test="$clone">
    <h4>Clone <xsl:value-of select="$name"/></h4>
    <p>
      To clone a <xsl:value-of select="$name"/> click the clone icon
      <img src="/img/clone.svg" class="icon icon-sm" alt="Clone" title="Clone"/>
      which goes to the details page of the clone.
    </p>
  </xsl:if>

  <h4><xsl:value-of select="$name"/>s</h4>
  <p>
    Pressing the list icon
    <img src="/img/list.svg" class="icon icon-sm" alt="{$name}s" title="{$name}s"/>
    will switch to the
    <a href="{$type}s.html?token={/envelope/token}">
      <xsl:value-of select="$name"/>s
    </a> page.
  </p>

  <h4>Delete <xsl:value-of select="$name"/></h4>
  <p>
    Pressing the "Delete <xsl:value-of select="$name"/>" icon
    <xsl:choose>
      <xsl:when test="$ultimate">
        <img src="/img/delete.svg" class="icon icon-sm" alt="Delete {$name}" title="Delete {$name}"/>
        will delete the resource.
      </xsl:when>
      <xsl:otherwise>
        <img src="/img/trashcan.svg" class="icon icon-sm" alt="Delete {$name}" title="Delete {$name}"/>
        will move the resource to the trashcan.
      </xsl:otherwise>
    </xsl:choose>
  </p>

  <xsl:if test="$new">
    <h4>Edit <xsl:value-of select="$name"/></h4>
    <p>
      Pressing the "Edit <xsl:value-of select="$name"/>" icon
      <img src="/img/edit.svg" class="icon icon-sm" alt="Edit {$name}" title="Edit {$name}"/>
      will switch to an overview of the configuration for this
      <xsl:value-of select="$type"/> and allows editing its properties.
    </p>
  </xsl:if>

  <h4>Export <xsl:value-of select="$name"/> as XML</h4>
  <p>
    Export the <xsl:value-of select="$name"/> as XML by clicking on the
    export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
  </p>
</xsl:template>

<xsl:template name="object-used-by">
  <xsl:param name="name"/>
  <xsl:param name="used_by"/>

  <h3><xsl:value-of select="$used_by"/>s using this <xsl:value-of select="$name"/></h3>
  <p>
    This table provides an overview of the <xsl:value-of select="$used_by"/>s
    that are associated with this <xsl:value-of select="$name"/>.
    Details of these <xsl:value-of select="$used_by"/>s can be seen after a
    click on the <xsl:value-of select="$used_by"/>'s name.
  </p>
</xsl:template>

<xsl:template name="list-window-line-actions">
  <xsl:param name="type"/>
  <xsl:param name="used_by"/>
  <xsl:param name="noclone"/>
  <xsl:param name="noedit"/>
  <xsl:param name="noexport"/>
  <xsl:param name="notrashcan"/>
  <xsl:param name="showenable"/>
  <a name="actions"></a>
  <h3>Actions</h3>

  <xsl:choose>
    <xsl:when test="$showenable">
      <h4>Enable / Disable <xsl:value-of select="$type"/></h4>
      <p>
      Pressing the enable icon
      <img src="/img/enable.svg" class="icon icon-sm" alt="Enable {$type}" title="Enable {$type}"/>
      will set the activity status of the <xsl:value-of select="$type"/> to active
      while pressing the disable button
      <img src="/img/disable.svg" class="icon icon-sm" alt="Disable {$type}" title="Disable {$type}"/>
      will set it to inactive.
      </p>
    </xsl:when>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$notrashcan">
    </xsl:when>
    <xsl:otherwise>
      <h4>Move <xsl:value-of select="$type"/> to Trashcan</h4>
      <p>
       Pressing the trashcan icon
       <img src="/img/trashcan.svg" class="icon icon-sm" alt="Move to Trashcan" title="To Trashcan"/>
       will move the item to the trashcan and update the list.
      </p>
      <xsl:choose>
        <xsl:when test="$used_by">
          <p>
           Note that if a <xsl:value-of select="$type"/> is associated with at least one
           <xsl:value-of select="$used_by"/>, it is not possible to move it. In this case
           the button is greyed out
           <img src="/img/trashcan_inactive.svg" class="icon icon-sm" alt="Move to Trashcan" title="To Trashcan"/>.
          </p>
        </xsl:when>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$noedit">
    </xsl:when>
    <xsl:otherwise>
      <a name="edit_{gsa:type-string ($type)}"></a>
      <h4>Edit <xsl:value-of select="$type"/></h4>
      <p>
       Pressing the "Edit <xsl:value-of select="$type"/>" icon
       <img src="/img/edit.svg" class="icon icon-sm" alt="Edit {$type}" title="Edit {$type}"/>
       will switch to an overview of the configuration for this <xsl:value-of select="$type"/> and
       allows editing the <xsl:value-of select="$type"/>'s properties.
      </p>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$noclone">
    </xsl:when>
    <xsl:otherwise>
      <h4>Clone <xsl:value-of select="$type"/></h4>
      <p>
       Pressing the clone icon
       <img src="/img/clone.svg" class="icon icon-sm" alt="Clone" title="Clone"/>
       will create a duplicate of the <xsl:value-of select="$type"/>.
      </p>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$noexport">
    </xsl:when>
    <xsl:otherwise>
      <h4>Export <xsl:value-of select="$type"/></h4>
      <p>
        Export the <xsl:value-of select="$type"/> as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="name-column">
  <xsl:param name="type" select="'task'"/>
  <xsl:param name="type-name" select="gsa:type-name ($type)"/>
  <xsl:param name="comment" select="'comment'"/>
  <tr class="odd">
    <td>Name</td>
    <td>
      Shows the name of the <xsl:value-of select="$type-name"/>.
      <br/>
      <xsl:if test="boolean ($comment)">
        If there is a <xsl:value-of select="$comment"/> on the
        <xsl:value-of select="$type-name"/>
        it is shown in brackets below the name.
      </xsl:if>
      <div>
        The right hand side of this column may contain an icon:
        <table style="margin-left: 10px">
          <tr>
            <td valign="top">
              <img src="/img/view_other.svg"
                class="icon icon-sm"
                border="0"
                alt="Global {$type-name}"
                title="Global {$type-name}"/>
            </td>
            <td>
              The <xsl:value-of select="$type-name"/> is either owned by
              another user, or it is global.  A global
              <xsl:value-of select="$type-name"/> is accessible by anyone.
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>
</xsl:template>

<xsl:template name="filtering">
  <a name="filtering"></a>
  <h3>Filtering</h3>
  <p>
    The Filtering section of the window shows how the displayed list has been
    selected.
  </p>
  <p>
    Modifying any of the values in the "Filter" field and clicking
    the refresh icon <img src="/img/refresh.svg" class="icon icon-sm" alt="Refresh" title="Refresh"/>
    will update the displayed list.  The filter syntax is described on the
    <a href="/help/powerfilter.html?token={/envelope/token}">powerfilter</a>
    page.
  </p>
  <p>
    Entering a name in the second field and clicking
    the new icon <img src="/img/new.svg" class="icon icon-sm" alt="New" title="New"/>
    will create a new filter from the filtering currently being applied to the
    list.
  </p>
  <p>
    The current filtering can also be changed by
    selecting a filter from the dropdown on the right and clicking the refresh
    icon <img src="/img/refresh.svg" class="icon icon-sm" alt="Refresh" title="Refresh"/>.
  </p>
  <p>
    Clicking the list icon <img src="/img/list.svg" class="icon icon-sm" border="0" alt="Filters"/>
    goes to the full list of filters on the
    <a href="filters.html?token={/envelope/token}">Filters</a> page.
  </p>
</xsl:template>

<xsl:template name="sorting">
  <p>
    The sorting of the table can be changed by clicking on a column heading.
    The current sort column appears as a keyword in the powerfilter, like
    "sort=name" or "sort-reverse=name".
  </p>
</xsl:template>

<xsl:template name="hosts_note">
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
              (e.g. <tt>fe80::222:64ff:fe76:4cea</tt>).</li>
          <li>an IPv6 address range in long format
              (e.g. <tt>::12:fe5:fb50-::12:fe6:100</tt>)</li>
          <li>an IPv6 address range in short format
              (e.g. <tt>::12:fe5:fb50-fb80</tt>)</li>
          <li>an IPv6 address range in CIDR notation
              (e.g. <tt>fe80::222:64ff:fe76:4cea/120</tt>)</li>
        </ul>
        These options can be mixed (e.g.
        <tt>192.168.13.1, myhost2.domain, fe80::222:64ff:fe76:4cea,
            192.168.13.0/24</tt>).
      </li>
      <li>
        The netmask in CIDR notation is limited to 20 for IPv4
        and 116 for IPv6 (4095 hosts).
      </li>
    </ul>
  </p>
</xsl:template>

<xsl:template match="help">
  <div id="list-window-table">
    <xsl:apply-templates mode="help"/>
  </div>
</xsl:template>

<xsl:template mode="help" match="*">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Page Not Found'"/>
  </xsl:call-template>

  <div class="section-box">
    <div style="text-align:left">
      <p>
        The help page you requested could not be found. If you have followed a
        link and got this page, the location of the help page may have changed.
        In this case, please use the <a href="contents.html?token={/envelope/token}">table of
          contents</a> to navigate to the page you were looking for.
      </p>

      <p>
        We apologize for any inconvenience.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="about.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'About GSA'"/>
  </xsl:call-template>

  <div class="section-box">
    <div style="text-align:left">
      <table><tr><td valign="top">

      <h1>Greenbone Security Assistant</h1>
      <h3>
        <xsl:choose>
          <xsl:when test="string-length (/envelope/vendor_version) &gt; 0">
            <xsl:value-of select="/envelope/vendor_version"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:text>Version </xsl:text>
            <xsl:value-of select="/envelope/version"/>
          </xsl:otherwise>
        </xsl:choose>
      </h3>
      <p>
      The Greenbone Security Assistant (GSA) is the web-based graphical
      user interface of the Open Vulnerability Assessment System (OpenVAS).
      GSA connects to OpenVAS Manager via the OpenVAS Management Protocol (OMP).
      By implementing the full feature set of OMP, GSA offers a straight-forward,
      yet powerful method to manage network vulnerability scans.
      </p>

      <p>
      Copyright 2009-2017 by <a href="http://www.greenbone.net" target="_blank">Greenbone Networks GmbH</a>
      </p>

      <p>
      License: GNU General Public License version 2 or any later version
      (<a href="gplv2.html?token={/envelope/token}">full license text</a>)
      </p>

      <p>
      Contact: For updates, feature proposals and bug reports
      contact the <a href="http://www.greenbone.net/en/contact/" target="_blank">
      Greenbone team</a> or visit the <a href="http://www.openvas.org" target="_blank">OpenVAS homepage</a>.
      </p>

      <p>
      Cookies: This web application uses cookies to store session information. The cookie is not
      stored on the server-side hard disk and not submitted anywhere. It is lost when the session is closed or expired.
      The cookie is also temporarily stored in your browser where you can examine the content.
      </p>

      </td><td valign="top">
      <img border="5" src="/img/gsa_splash.svg" style="height:400px;"/>
      </td>
      </tr></table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="host_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Host Details'"/>
    <xsl:with-param name="asset-type" select="'host'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_ASSETS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#host">host</a>.
        This includes the name, OS, severity and the last update time of
        the host.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'host'"/>
        <xsl:with-param name="name" select="'Host'"/>
        <xsl:with-param name="close" select="false ()"/>
        <xsl:with-param name="ultimate" select="true ()"/>
      </xsl:call-template>

      <h3>Identifiers</h3>
      <p>
        This table provides an overview of the characteristics that were used to
        identify the host.  Identifiers include "ip", "OS", "hostname", "MAC" and
        "DNS-via-TargetDefinition".
      </p>
      <p>
        Information in the table includes the identifier value and creation time,
        and the source of the identifier.
      </p>
      <p>
        An identifier can be deleted by clicking the delete icon
        <img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="hosts.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Hosts'"/>
    <xsl:with-param name="asset-type" select="'host'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_ASSETS'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all the
        <a href="glossary.html?token={/envelope/token}#host">host</a>s
        found in the
        <a href="glossary.html?token={/envelope/token}#asset">asset</a>
        database.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'host'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Hostname</td>
          <td>
            Most recently identified hostname of the asset.
          </td>
        </tr>
        <tr class="odd">
          <td>IP</td>
          <td>
            Most recently identified IP of the asset.
          </td>
        </tr>
        <tr class="even">
          <td>OS</td>
          <td>
            Icon for most recently identified operating system on the host.
          </td>
        </tr>
        <tr class="odd">
          <td>Severity</td>
          <td>
            The highest result severity on the host from the most recently
            recorded report.
          </td>
        </tr>
        <tr class="even">
          <td>Updated</td>
          <td>
            The time the asset was last updated.
          </td>
        </tr>
      </table>

      <h3>New Host</h3>
      <p>
        To create a new host click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Host" title="New Host"/> which
        goes to the <a href="new_host.html?token={/envelope/token}">New Host</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of hosts as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Host'"/>
        <xsl:with-param name="noclone" select="1"/>
        <xsl:with-param name="notrashcan" select="1"/>
      </xsl:call-template>

      <h4>Create Target from Host</h4>
      <p>
        To create a new Target based on a Host click the
        Create Target from Host icon
        <img src="/img/new.svg" class="icon icon-sm" title="Create Target from Host"/>,
        which will open the
        <a href="/help/new_target.html?token={/envelope/token}">New Target</a>
        dialog with an option to use the selected Host Asset selected.
      </p>
      <p>
        The corresponding "Create Target from..." bulk action at the bottom of
        the table will open the dialog with the option to use the chosen
        selection of Hosts.
      </p>

      <h4>Delete Host</h4>
      <p>
        Pressing the delete icon <img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/> will
        remove the host immediately, including all host identifiers.  The list of assets will
        be updated.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="hosts_classic.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Hosts (Classic)'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_report&amp;type=assets&amp;overrides=1&amp;levels=hm&amp;token={/envelope/token}">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <p>
       This page provides an overview of all the hosts found in all tasks.
      </p>

      <a name="filtering"></a>
      <h2>Host Filtering</h2>
      <p>
        The Host Filtering window shows how the hosts of the scan have been
        filtered to produce the overview.  Modifying any of the values and clicking
        the "Apply" button will update the overview.
      </p>

      <a name="overrides"></a>
      <h3>Overrides</h3>
      <p>
       By default the configured <a href="glossary.html?token={/envelope/token}#override">overrides</a> are applied.
       The selection allows to switch to a view without applying overrides.
       In the Filtered Hosts table the hosts and the severity counts might change
       when switching this selection.
       By pressing the refresh
       <img src="/img/refresh.svg" class="icon icon-sm" alt="Refresh" title="Refresh"/> icon a change is confirmed.
      </p>
      <p>
       The selection that is active for the present page is marked with a hook (&#8730;).
      </p>

      <a name="filtered"></a>
      <h2>Filtered Hosts</h2>
      <p>
        The Filtered Hosts window shows all the hosts, filtered
        according to the Hosts Filtering window.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>IP</td>
          <td>
            IP address of the host.
          </td>
        </tr>
        <tr>
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'High'"/>
            </xsl:call-template>
          </td>
          <td>
            Number of high results on most recent report.
          </td>
        </tr>
        <tr class="odd">
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'Medium'"/>
            </xsl:call-template>
          </td>
          <td>
            Number of medium results on most recent report.
          </td>
        </tr>
        <tr>
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'Low'"/>
            </xsl:call-template>
          </td>
          <td>
            Number of low results on most recent report.
          </td>
        </tr>
        <tr class="odd">
          <td>Last Report</td>
          <td>
            Link to most recent report.
          </td>
        </tr>
        <tr>
          <td>OS</td>
          <td>
            Icon for detected operating system in most recent report.
          </td>
        </tr>
        <tr class="odd">
          <td>Ports</td>
          <td>
            Number of open ports found in most recent report.
          </td>
        </tr>
        <tr>
          <td>Apps</td>
          <td>
            Number of applications detected in most recent report, according
            to CPEs.
          </td>
        </tr>
        <tr class="odd">
          <td>Reports</td>
          <td>
            Number of complete reports that include this host.
          </td>
        </tr>
        <tr>
          <td>Distance</td>
          <td>
            Distance to host from server running the Scanner, according to
            most recent report.
          </td>
        </tr>
        <tr>
          <td valign="top">Prognosis</td>
          <td>
            The maximum severity for the host, predicted from what is currently
            known about the host. Severity is determined by comparing the
            detected applications for this host to a list of vulnerable ones.
            Note that the host might be only vulnerable for specific
            configurations or combinations of applications.
          </td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Prognostic Report</h4>
      <p>
       Pressing the
       <a href="glossary.html?token={/envelope/token}#prognostic_report">prognostic report</a>
       icon
       <img src="/img/prognosis.svg" class="icon icon-sm" alt="Prognostic Report" title="Prognostic Report"/>
       will switch to a prognostic report on this host.
      </p>

      <a name="host_details"></a>
      <h2>Host Details</h2>
      <p>
       Provides detailed information about the host.
       This includes all the information from the Filtered Hosts table, plus the list of
       open ports and the list of applications.
      </p>

      <a name="scap_missing"></a>
      <h2>Warning: SCAP Database Missing</h2>
      <p>
        This warning dialog occurs when the SCAP database is missing on the OMP server.
      </p>
      <p>
        The prognostic reporting requires the SCAP data.  As a result all prognostic
        report icons
        <img src="/img/prognosis.svg" class="icon icon-sm" alt="Prognostic Report" title="Prognostic Report"/>
        will be greyed out
        <img src="/img/prognosis_inactive.svg" class="icon icon-sm" alt="Prognostic Report" title="Prognostic Report"/>
        when the database is missing.
      </p>
      <p>
        The SCAP data is updated during a SCAP data feed sync.
        Most likely the data will appear after the next such feed sync.
        This is usually taken care of automatically by a periodic
        background process.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="agent_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Agent Details'"/>
    <xsl:with-param name="type" select="'agent'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_AGENTS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about an
        <a href="glossary.html?token={/envelope/token}#agent">Agent</a>.
        This includes the Name, creation time, modification time,
        comment and installer package trust state and time.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'agent'"/>
        <xsl:with-param name="name" select="'Agent'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="agents.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Agents'"/>
    <xsl:with-param name="type" select="'agent'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_AGENTS'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all configured
        <a href="glossary.html?token={/envelope/token}#agent">Agents</a>,
        and summarizes the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'agent'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Trust</td>
          <td>
            <b>yes</b>: the signature file that was uploaded or that was present
            in the Feed proofs that the agent was not compromised at upload
            time.
            <br/>
            <b>no</b>: Signature and agent do not match or signature key is not
            trusted.
            <br/>
            <b>unknown</b>: Any case where trust could not be tested adequately.
          </td>
        </tr>
      </table>

      <h3>New Agent</h3>
      <p>
        To create a new agent click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Agent" title="New Agent"/> which
        goes to the <a href="new_agent.html?token={/envelope/token}">New Agent</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of agents as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>
      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Agent'"/>
      </xsl:call-template>

      <h4>Download Installer Package</h4>
      <p>
       Pressing the "Download Installer Package" icon
       <img src="/img/agent.svg" class="icon icon-sm" alt="Download Installer Package"
            title="Download Installer Package"/>
       will download an installation of the agent package.
      </p>

      <h4>Verify Agent</h4>
      <p>
       Pressing the "Verify Agent" icon
       <img src="/img/verify.svg" class="icon icon-sm" alt="Verify Agent" title="Verify Agent"/>
       will verify the trust on the agent installer package.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_agent.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Agent'"/>
    <xsl:with-param name="type" select="'agent'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
          <xsl:with-param name="command" select="'CREATE_AGENT'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#agent">Agent</a>
        the dialog offers these entries.
        Hit the button "Create Agent" to submit the new agent.
        The Agents page will be shown.
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
      </table>
      <p>
        When a signature file is provided, the agent file will be verified using
        this signature at upload time to determine the trust.
      </p>
      <p>
        When no signature file is provided, a suitable signature is searched for
        in the NVT Feed. If found, the trust is determined based on this
        signature file.
      </p>

      <h4>Agents</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Agents" title="Agents"/>
       will switch to the <a href="agents.html?token={/envelope/token}">Agents</a>
       page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="credentials.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Credentials'"/>
    <xsl:with-param name="type" select="'credential'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CREDENTIALS'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all configured
        <a href="glossary.html?token={/envelope/token}#credential">Credentials</a>.
        and summarizes the essential aspects of it.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'credential'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Type</td>
          <td>Shows the type of the credential.</td>
        </tr>
        <tr class="odd">
          <td>Allow insecure use</td>
          <td>Whether the credential can be used for unencrypted or otherwise insecure authentication methods.</td>
        </tr>
        <tr class="even">
          <td>Login</td>
          <td>Shows the login name that was provided for this credential.</td>
        </tr>
      </table>

      <h3>New Credential</h3>
      <p>
        To create a new credential click the
        new icon <img src="/img/new.svg" class="icon icon-sm"
                      alt="New Credential" title="New Credential"/>
        which goes to the
        <a href="new_credential.html?token={/envelope/token}">New Credential</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of credentials as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>
      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Credential'"/>
      </xsl:call-template>

      <h4>Download RPM Package</h4>
      <p>
       Pressing the RPM icon
       <img src="/img/rpm.svg" class="icon icon-sm" alt="Download RPM Package" title="Download RPM Package"/>
       will download a ".rpm" installation package.
      </p>
      <p>
       With installing this package on a RPM-based systems (e.g. SUSE, RedHat, Fedora, CentOS)
       a low privileged user account is created on that target system to allow
       the scan engine to access the system retrieve information about installed software
       and other product information. De-installation of the package will disable the access.
      </p>

      <h4>Download Debian Package</h4>
      <p>
       Pressing the Debian icon
       <img src="/img/deb.svg" class="icon icon-sm" alt="Download Debian Package" title="Download Debian Package"/>
       will download a ".deb" installation package.
      </p>
      <p>
       With installing this package on a dpkg-based systems (e.g. Debian, Ubuntu)
       a privileged user account is created on that target system to allow
       the scan engine to access the system retrieve information about installed software
       and other product information. De-installation of the package will disable the access.
      </p>

      <h4>Download Exe Package</h4>
      <p>
       Pressing the Exe icon
       <img src="/img/exe.svg" class="icon icon-sm" alt="Download Exe Package" title="Download Exe Package"/>
       will download a ".exe" installation package.
      </p>
      <p>
       With installing this package on a Windows systems (e.g. XP, 2003)
       a low privileged user account is created on that target system to allow
       the scan engine to access the system retrieve information about installed software
       and other product information. De-installation of the package will disable the access.
      </p>

      <h4>Download Public Key</h4>
      <p>
       Pressing the public key icon
       <img src="/img/key.svg" class="icon icon-sm" alt="Download Public Key" title="Download Public Key"/>
       will download a SSH Public Key in ASCII form.
      </p>
      <p>
       This key corresponds to the keys
       used for RPM and Debian packages (not for Exe-Packages).
       The key file is intended to support expert users to prepare targets systems for
       local security checks on their own (i.e. without the provided RPM/Debian
       packages).
      </p>

      <p>
       Note that depending on the method that was chosen to specify a password
       (manually or autogenerated), some actions might not be available.
       Specifically, when the password was supplied manually, just the Delete,
       Edit, Clone and Export actions are available.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_credential.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Credential'"/>
    <xsl:with-param name="type" select="'credential'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
          <xsl:with-param name="command" select="'CREATE_CREDENTIAL'"/>
      </xsl:call-template>

      <p>
        Credentials for local security checks are required to allow
        <a href="glossary.html?token={/envelope/token}#nvt">NVTs</a> to log into target systems
        for the purpose of locally check there e.g. for the presence
        of all vendor security patches.
      </p>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#credential">Credential</a>
        the dialog offers these entries.
        Hit the button "Create Credential" to submit the new credential.
        The Credentials page will be shown.
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
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>For the Windows systems</td>
        </tr>
        <tr class="odd">
          <td>Type</td>
          <td>yes</td>
          <td>--</td>
          <td>Selection</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Allow insecure use</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>

        <tr class="gbntablehead2">
          <td colspan="5">
            Additional options for type &quot;Username + Password&quot;
          </td>
        </tr>
        <tr class="even">
          <td>Auto-generate</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Username</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric<br/>If not autogenerate also "\@_.-"</td>
          <td>jsmith<br/>
              myDomain\jsmith<br/>
              jsmith@myDomain</td>
        </tr>
        <tr class="even">
          <td>Password</td>
          <td>yes</td>
          <td>40</td>
          <td>Free form text</td>
          <td>hx7ZgI2n</td>
        </tr>

        <tr class="gbntablehead2">
          <td colspan="5">
            Additional options for type &quot;Username + SSH Key&quot;
          </td>
        </tr>
        <tr class="even">
          <td>Auto-generate</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Username</td>
          <td>yes</td>
          <td>80</td>
          <td>Alphanumeric<br/>If not autogenerate also "\@_.-"</td>
          <td>jsmith<br/>
              myDomain\jsmith<br/>
              jsmith@myDomain</td>
        </tr>
        <tr class="even">
          <td>Passphrase</td>
          <td>yes</td>
          <td>40</td>
          <td>Free form text</td>
          <td>hx7ZgI2n</td>
        </tr>
        <tr class="odd">
          <td>Private key</td>
          <td>yes</td>
          <td>--</td>
          <td>File containing an SSH private key</td>
          <td></td>
        </tr>

        <tr class="gbntablehead2">
          <td colspan="5">
            Additional options for type &quot;Client Certificate&quot;
          </td>
        </tr>
        <tr class="odd">
          <td>Certificate</td>
          <td>yes</td>
          <td>--</td>
          <td>File containing a client certificate in PEM format</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Private key</td>
          <td>yes</td>
          <td>--</td>
          <td>File containing an a private key in PEM format</td>
          <td></td>
        </tr>

        <tr class="gbntablehead2">
          <td colspan="5">
            Additional options for type &quot;SNMP&quot;
          </td>
        </tr>
        <tr class="even">
          <td>Community</td>
          <td>if no Username + Password given</td>
          <td>40</td>
          <td>Free form text</td>
          <td>hx7ZgI2n</td>
        </tr>
        <tr class="odd">
          <td>Username</td>
          <td>if no Community given</td>
          <td>80</td>
          <td>Alphanumeric<br/>If not autogenerate also "\@_.-"</td>
          <td>jsmith<br/>
              myDomain\jsmith<br/>
              jsmith@myDomain</td>
        </tr>
        <tr class="even">
          <td>Password</td>
          <td>if no Community given</td>
          <td>40</td>
          <td>Free form text</td>
          <td>hx7ZgI2n</td>
        </tr>
        <tr class="odd">
          <td>Privacy Password</td>
          <td>no</td>
          <td>40</td>
          <td>Free form text</td>
          <td>hx7ZgI2n</td>
        </tr>
        <tr class="even">
          <td>Auth Algorithm</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Privacy Algorithm</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
      </table>

      <p>
        The dialog to create a new credential pair allows to either specify a password
        or to generate a secure password.
        Note that if the latter option was chosen, users are not able or allowed to
        access either passwords nor so-called private keys.
        Instead, installer packages are created that can be installed on target
        systems. Details of these installers are explained in the
        <a href="credentials.html?token={/envelope/token}#actions">Actions</a> section of the credentials help page.
        These actions are not available if the password was specified manually.
      </p>
      <p>
        <b>Please note</b> that you will need to associate one or more
        <a href="glossary.html?token={/envelope/token}#target">targets</a> with the credential you installed
        on them.
        Only this finally allows the scan engine to apply the suitable credentials.
      </p>

      <p>
        Note: According to documentation of Microsoft Domain Controller,
        if your Login uses German umlauts, you can use "ss" for "ß", "a" for "ä" etc.
        In other cases, Login names with German umlauts will not work.
      </p>

      <h4>Insecure use</h4>
      <p>
        With the option "Allow insecure use" enabled the credential can be used
        for unencrypted or otherwise insecure authentication methods.
      </p>

      <h4>Credentials</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Credentials" title="Credentials"/>
       will switch to the
       <a href="credentials.html?token={/envelope/token}"> Credentials
       </a> page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="credential_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Credential Details'"/>
    <xsl:with-param name="type" select="'credential'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CREDENTIALS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about an
        <a href="glossary.html?token={/envelope/token}#credential">Credential</a>.
        This includes name, comment, login, ID, creation time and modification
        time.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'credential'"/>
        <xsl:with-param name="name" select="'Credential'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Credential'"/>
        <xsl:with-param name="used_by" select="'Target'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_alert.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Alert'"/>
    <xsl:with-param name="type" select="'alert'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_ALERT'"/>
      </xsl:call-template>

      <a name="newalert"></a>

      <p>
       Alerts can be added to <a href="glossary.html?token={/envelope/token}#task">tasks</a>.
       Alerts are hooked into the system. Whenever a configured event happens
       (e.g. a task finished), a chosen condition is checked (e.g. vulnerability
       with high severity class detected).
       If the condition is met, an action is performed (e.g. an email is sent to a
       specified address).
      </p>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#alert">Alert</a>
        the dialog offers these entries.
        Hit the button "Create Alert" to submit the new alert.
        The Alerts page will be shown.
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
        <tr class="even">
          <td>
            Report Filter
            <xsl:if test="not (gsa:may-op ('get_filters'))">*</xsl:if>
          </td>
          <td>no</td>
          <td>--</td>
          <td>Choice</td>
          <td></td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_filters'))">
        <b>*</b> not available with the current OMP Server connection.
      </xsl:if>

      <h4>Alerts</h4>

      <p>
        Pressing the list icon
        <img src="/img/list.svg" class="icon icon-sm" alt="Alerts" title="Alerts"/>
        will switch to the <a href="alerts.html?token={/envelope/token}">Alerts</a>
        page.
      </p>

      <h2>Alert Methods</h2>

      <h3>Email</h3>

      <p>
        An email will be sent to the given address.
      </p>

      <p>
        The following replacements will be done in the Subject:
      </p>

      <ul>
        <li> $$: $ </li>
        <li> $d: date that SecInfo check was last performed (blank for Task alerts)</li>
        <li> $e: event description </li>
        <li> $n: task name (blank for SecInfo alerts)</li>
        <li> $N: alert name</li>
        <li> $q: the type of SecInfo event: "New", "Updated" or blank for Task alerts</li>
        <li> $s: the type of SecInfo: "NVT", "CERT-Bund Advisory", ... or blank for Task alerts</li>
        <li> $S: $s, but plural: "NVTs", "CERT-Bund Advisories", ...</li>
        <li> $T: Total number of resources in the list for SecInfo alerts; 0 for Task alerts.</li>
        <li> $u: owner of the alert or current user if the alert was triggered manually</li>
        <li> $U: UUID of the alert</li>
      </ul>

      <p>
        The following replacements will be done in the Message:
      </p>

      <ul>
        <li> $$: $ </li>
        <li> $c: condition description </li>
        <li> $d: date that SecInfo check was last performed (blank for Task alerts)</li>
        <li> $e: event description </li>
        <li> $F: name of filter </li>
        <li> $f: filter term </li>
        <li> $H: host summary </li>
        <li> $i: the report text or list of SecInfo resources (only when including the report/list)</li>
        <li> $n: task name (blank for SecInfo alerts)</li>
        <li> $N: alert name</li>
        <li> $r: report format name </li>
        <li> $q: the type of SecInfo event: "New", "Updated" or blank for Task alerts</li>
        <li> $s: the type of SecInfo: "NVT", "CERT-Bund Advisory", ... or blank for Task alerts</li>
        <li> $S: $s, but plural: "NVTs", "CERT-Bund Advisories", ...</li>
        <li> $t: a note when the report was truncated </li>
        <li> $T: Total number of resources in the list for SecInfo alerts; 0 for Task alerts.</li>
        <li> $u: Owner of the alert or current user if the alert was triggered manually</li>
        <li> $U: UUID of the alert</li>
        <li> $z: timezone </li>
      </ul>

      <h3>HTTP Get</h3>

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
        <li> $c: condition description </li>
        <li> $e: event description </li>
        <li> $n: task name </li>
      </ul>

      <h3>SCP</h3>

      <p>
        The report will be copied to the given destination using "scp" with
        the given login credentials.
      </p>

      <p>
        The following replacements will be done in the "Path" field:
      </p>

      <ul>
        <li> $$: $ </li>
        <li> $n: task name </li>
      </ul>

      <p>
        Optionally, the "Known Hosts" field can list a number of known hosts.
        Each line specifies a single host in the format "<code>host protocol public_key</code>",
        for example:
      </p>

      <p>
        <pre>    localhost ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...P3pCquVb</pre>
      </p>

      <p>
        Note that the host name must exactly match the "Host" field.  If "Host" is
        an IP then the host in "Known Hosts" must also be an IP.
      </p>

      <p>
        The "Known Hosts" field will be used in
        addition to the system's default SSH known hosts configuration.
      </p>

      <h3>SNMP</h3>

      <p>
        An SNMP trap will be sent to the given agent.
      </p>

      <p>
        The following replacements will be done in the Message:
      </p>

      <ul>
        <li> $$: $ </li>
        <li> $d: date that SecInfo check was last performed (blank for Task alerts)</li>
        <li> $e: event description </li>
        <li> $n: task name (blank for SecInfo alerts)</li>
        <li> $q: the type of SecInfo event: "New", "Updated" or blank for Task alerts</li>
        <li> $s: the type of SecInfo: "NVT", "CERT-Bund Advisory", ... or blank for Task alerts</li>
        <li> $S: $s, but plural: "NVTs", "CERT-Bund Advisories", ...</li>
        <li> $T: Total number of resources in the list for SecInfo alerts; 0 for Task alerts.</li>
      </ul>

      <h3>SMB</h3>

      <p>
        The report will be copied to the given destination using the SMB
        protocol with the given login credentials.
      </p>

      <p>
        The "Share Path" contains the part of the UNC path that contains the
        host and the share name, e.g. "\\host\share".
      </p>

      <p>
        The "File Path" field will
        The following replacements will be done in the "Path" field:
        <xsl:call-template name="path_placeholders_list"/>
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="alerts.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Alerts'"/>
    <xsl:with-param name="type" select="'alert'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_ALERTS'"/>
      </xsl:call-template>

      <a name="alerts"></a>

      <p>
       This table provides an overview of all configured
       <a href="glossary.html?token={/envelope/token}#alert">Alerts</a>.
       The complete contents of the alert entries
       are shown (name, first run, next run, period and duration).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'alert'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Event</td>
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
        <tr class="even">
          <td>Filter</td>
          <td>Report filter.</td>
        </tr>
      </table>

      <h3>New Alert</h3>
      <p>
        To create a new alert click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Alert" title="New Alert"/> which
        goes to the <a href="new_alert.html?token={/envelope/token}">New Alert</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of alerts as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Alert'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>

      <h4>Test Alert</h4>
      <p>
       By clicking on the start icon
       <img src="/img/start.svg" class="icon icon-sm" alt="Test Alert" title="Test Alert"/>
       the corresponding alert is immediately executed with some
       dummy data.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="alert_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Alert Details'"/>
    <xsl:with-param name="type" select="'alert'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_ALERTS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about an
        <a href="glossary.html?token={/envelope/token}#alert">Alert</a>.
        This includes the Name, comment, creation time, modification time,
        condition, event, method and filter.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'alert'"/>
        <xsl:with-param name="name" select="'Alert'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Alert'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="port_lists.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Port Lists'"/>
    <xsl:with-param name="type" select="'port_list'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_PORT_LISTS'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all configured
        <a href="glossary.html?token={/envelope/token}#port_list">
            Port Lists
        </a>
        and summarizes the essential aspects of them.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'port_list'"/>
        </xsl:call-template>
        <tr class="even">
         <td>Port Counts Total</td>
         <td>
           The total number of ports in the port list.
         </td>
        </tr>
        <tr class="even">
         <td>Port Counts TCP</td>
         <td>
           The total number of TCP ports in the port list.
         </td>
        </tr>
        <tr class="even">
         <td>Port Counts UDP</td>
         <td>
           The total number of UDP ports in the port list.
         </td>
        </tr>
      </table>

      <a name="predefined_port_lists"></a>
      <h2>Predefined Port Lists</h2>
      <p>
        The predefined port lists include:
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Name</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>All IANA assigned TCP 2012-02-10</td>
          <td>
            All TCP ports assigned by IANA, as at 10 February 2012.
          </td>
        </tr>
        <tr class="odd">
          <td>All IANA assigned TCP and UDP 2012-02-10</td>
          <td>
            All TCP and UDP ports assigned by IANA, as at 10 February 2012.
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP</td>
          <td>
            Every TCP port.
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP and Nmap 5.51 top 100 UDP</td>
          <td>
            Every TCP port, and the top 100 UDP ports according to Nmap 5.51.
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP and Nmap 5.51 top 1000 UDP</td>
          <td>
            Every TCP port, and the top 1000 UDP ports according to Nmap 5.51.
          </td>
        </tr>
        <tr class="odd">
          <td>All privileged TCP</td>
          <td>
            Every privileged TCP port.
          </td>
        </tr>
        <tr class="odd">
          <td>All privileged TCP and UDP</td>
          <td>
            Every privileged TCP port and every privileged UDP port.
          </td>
        </tr>
        <tr class="odd">
          <td>Nmap 5.51 top 2000 TCP and top 100 UDP</td>
          <td>
            The top 2000 TCP ports and the top 100 UDP ports, according to Nmap 5.51.
          </td>
        </tr>
        <tr class="odd">
          <td>OpenVAS Default</td>
          <td>
            The TCP ports that are scanned by the OpenVAS-4 Scanner
            when passed the "default" port_range preference.
          </td>
        </tr>
      </table>

      <h3>New Port List</h3>
      <p>
        To create a new Port List click the new icon
        <img src="/img/new.svg" class="icon icon-sm" alt="New Port List"
             title="New Port List"/>
        which goes to the <a href="new_port_list.html?token={/envelope/token}">New
        Port List</a> page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of Port Lists as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Port List'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_port_list.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Port List'"/>
    <xsl:with-param name="type" select="'port_list'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
          <xsl:with-param name="command" select="'CREATE_PORT_LIST'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#port_list">Port List</a>
        the dialog offers these entries.
        Hit the button "Create Port List" to submit the new Port List.
        Hit the button "Import Port List" to import a new Port List.
        The Port Lists page will be shown.
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
          <td>All privileged UDP</td>
        </tr>
        <tr class="odd">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>Every privileged UDP port.</td>
        </tr>
        <tr class="odd">
          <td>Port Ranges</td>
          <td>yes</td>
          <td>400</td>
          <td>Comma separated list of port ranges, either directly or from a file</td>
          <td>U:1-1023</td>
        </tr>
      </table>

      Note on <b>Port Ranges</b>:
      <ul>
        <li>
          The port ranges parameter is a comma-separated list of values.  The
          list can be input directly or uploaded in a file.  In the file both
          newlines and commas can separate values.  Each value in the list
          can be
          <ul>
            <li>a single port (e.g. <tt>7</tt>)</li>
            <li>a range (e.g. <tt>9-11</tt>)</li>
          </ul>
          These options can be mixed (e.g. <tt>1-3,7,9-11</tt>).
        </li>
        <li>
          A value in the list can be preceded by a protocol specifier.  Either
          "T:" or "U:".  This has the effect of setting the protocol for all
          following ranges.  For example <tt>T:1-3,U:7,9-11</tt> defines the TCP
          ports 1, 2 and 3, and the UDP ports 7, 9, 10 and 11.
        </li>
        <li>
          Multiple protocol specifiers toggle the protocol.  For example
          <tt>T:1-3,U:7,T:9-11</tt> defines the TCP ports 1, 2, 3, 9, 10 and 11,
          and the UDP port 7.
        </li>
        <li>
          Initially the protocol is TCP.  So for example <tt>1-3,U:7</tt>
          defines the TCP ports 1, 2, and 3, and the UDP port 7.
        </li>
      </ul>

      <a name="import_port_list"></a>
      <h1>Import Port List</h1>
      <p>
        To import a port list, select the import file and hit the
        "Import Port List" button to submit the Port List.
        The list of port lists will be updated.
        Note that the import will fail with an error message if the port list
        already exists on your system, or if an existing port list has the
        same name.
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
          <td>Import Port List</td>
          <td>yes</td>
          <td>--</td>
          <td>File</td>
          <td>/tmp/port_list.xml</td>
        </tr>
      </table>

      <h4>Port Lists</h4>
      <p>
        Pressing the list icon
        <img src="/img/list.svg" class="icon icon-sm" alt="Port Lists" title="Port Lists"/>
        will switch to the
        <a href="port_lists.html?token={/envelope/token}">Port Lists</a>
        page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="port_list_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Port List Details'"/>
    <xsl:with-param name="type" select="'port_list'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_PORT_LISTS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#port_list">
        Port List</a>.
        This includes the name, creation time, modification time, port
        count, tcp ports count, udp ports count, port ranges and targets using
        this port list.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'port_list'"/>
        <xsl:with-param name="name" select="'Port List'"/>
      </xsl:call-template>

      <h3>Port Ranges</h3>
      <p>
        This table lists all the port ranges in the port list.
      </p>
      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Port List'"/>
        <xsl:with-param name="used_by" select="'Target'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="report_formats.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Report Formats Details'"/>
    <xsl:with-param name="type" select="'report_format'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_REPORT_FORMATS'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all configured
        <a href="glossary.html?token={/envelope/token}#report_format">
            Report Formats
        </a>
        and summarizes the essential aspects of them.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'report_format'"/>
          <xsl:with-param name="comment" select="'summary'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Extension</td>
          <td>
              Extension of the resulting Report Format.
          </td>
        </tr>
        <tr class="odd">
          <td>Content Type</td>
          <td>
            Content Type of the resulting Report Format.
          </td>
        </tr>
        <tr class="even">
          <td>Trust</td>
          <td>
            <b>yes</b>: the signature embedded in report format or that was
            present in the Feed proves that the Report Format was not
            compromised at upload time<br/>
            <b>no</b>: Signature and Report Format do not match or signature key
            is not trusted.<br/>
            <b>unknown</b>: Any case where trust could not be tested
            adequately.<br/>
            Last verification date is also shown between brackets.
          </td>
        </tr>
      </table>

      <a name="predefined_report_formats"></a>
      <h3>Predefined Report Formats</h3>
      <p>
        The predefined formats include:
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Name</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>PDF</td>
          <td>
            A single PDF file is created from the report details.
          </td>
        </tr>
        <tr class="even">
          <td>HTML</td>
          <td>
            A single HTML file is created from the report details.
            This is similar to the page created via action "Details"
            but is a self-contained document that could be viewed
            independent of GSA.
          </td>
        </tr>
        <tr class="odd">
          <td>XML</td>
          <td>
            A single XML file is created from the report details.
            This should be the basis for creating your own style
            for a report or post-process the results in other ways.
          </td>
        </tr>
        <tr class="even">
          <td>TXT</td>
          <td>
            A single plain text file is created from the report details.
          </td>
        </tr>
        <tr class="odd">
          <td>NBE</td>
          <td>
            A single NBE file is created. This format is supported
            by OpenVAS-Client and in the past often used for
            post-processing the results. It is offered primarily
            for compatibility purposes. It is recommended to
            set up post-processing based on the XML file, not
            based on the NBE file.
          </td>
        </tr>
        <tr class="even">
          <td>ITG</td>
          <td>
            Any tabular results of IT-Grundschutz scans are collected
            from the report and assembled to a single CSV file for
            simple integration into spreadsheet applications or
            databases.
          </td>
        </tr>
        <tr class="odd">
          <td>CPE</td>
          <td>
            Any tabular results of CPE inventory scans are collected
            from the report and assembled to a single CSV file for
            simple integration into spreadsheet applications or
            databases.
          </td>
        </tr>
      </table>

      <h3>New Report Format</h3>
      <p>
        To create a new Report Format click the new icon
        <img src="/img/new.svg" class="icon icon-sm" alt="New Report Format"
             title="New Report Format"/>
        which goes to the <a href="new_report_format.html?token={/envelope/token}">New
        Report Format</a> page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of Report Format as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Report Format'"/>
      </xsl:call-template>

      <h4>Verify Report Format</h4>
      <p>
       Pressing the Verify icon
       <img src="/img/verify.svg" class="icon icon-sm" alt="Verify" title="Verify"/>
       will verify the trust on the Report Format file.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_report_format.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Report Format'"/>
    <xsl:with-param name="type" select="'report_format'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
          <xsl:with-param name="command" select="'CREATE_REPORT_FORMAT'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#report_format">Report Format</a>
        the dialog offers these entries.
        Hit the button "Import Report Format" to submit the new Report Format.
        The Report Formats page will be shown.
        Note that the import will fail with an error message if the report
        format already exists on your system, or if an existing Report Format
        has the same name.
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
          <td>Import XML Report Format</td>
          <td>yes</td>
          <td>--</td>
          <td>File</td>
          <td>/tmp/custom_reporter.xml</td>
        </tr>
      </table>

      <h4>Report Formats</h4>
      <p>
        Pressing the list icon
        <img src="/img/list.svg" class="icon icon-sm" alt="Report Formats" title="Report Formats"/>
        will switch to the
        <a href="report_formats.html?token={/envelope/token}">Report Formats</a>
        page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="report_format_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Report Format Details'"/>
    <xsl:with-param name="type" select="'report_format'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_REPORT_FORMATS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#report_format">
        Report Format</a>.
        This includes the name, creation time, modification time, extension,
        content type, trust, activity, summary, description and parameters.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'report_format'"/>
        <xsl:with-param name="name" select="'Report Format'"/>
      </xsl:call-template>

      <h3>Parameters</h3>
      <p>
        This table provides a list of the parameters that control the
        creation of reports that have this format.
      </p>
      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Report Format'"/>
        <xsl:with-param name="used_by" select="'Alert'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configs.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scan Configs'"/>
    <xsl:with-param name="type" select="'config'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all configured
        <a href="glossary.html?token={/envelope/token}#config">Scan Configs</a>.
        A summary of the scan config entries is shown.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'scan_config'"/>
        </xsl:call-template>
        <tr>
          <td>Families: Total</td>
          <td>The number of NVT families that would be considered
              with the current NVT set. "N/A" means that the
              number is not available at the moment.</td>
        </tr>
        <tr class="odd">
          <td>Families: Trend</td>
          <td>This field can have two states: "Grow"
              (<img src="/img/trend_more.svg" class="icon icon-sm"/>) or
              "Static" (<img src="/img/trend_nochange.svg" class="icon icon-sm"/>). "Grow" means that
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
              (<img src="/img/trend_more.svg" class="icon icon-sm"/>) or "Static"
              (<img src="/img/trend_nochange.svg" class="icon icon-sm"/>). "Grow" means that
              the NVT selection associated with the Scan Config specified to include
              new NVTs that occurs in the NVT set at least for one family.
              "Static" means, that the NVT selection associated with the Scan Config
              has an explicit definition which NVTs are to be considered.</td>
        </tr>
      </table>

      <h3>New Scan Config</h3>
      <p>
        To create a new scan config click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Scan Config" title="New Scan config"/> which
        goes to the <a href="new_config.html?token={/envelope/token}">New Scan Config</a>
        page.
      </p>

      <a name="export"></a>
      <h3>Exporting</h3>
      <p>
        Export the current list of scan configs as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Scan Config'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_config.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Scan Config'"/>
    <xsl:with-param name="type" select="'config'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
          <xsl:with-param name="command" select="'CREATE_CONFIG'"/>
      </xsl:call-template>

      <a name="new_config"></a>
      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#config">Scan Config</a>
        the dialog offers these entries.
        Hit the button "Create Scan Config" to submit the new Scan Config.
        Hit the button "Import Scan Config" to import a new Scan Config.
        The Scan Configs page will be shown.
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

      <a name="import_config"></a>
      <h1>Import Scan Config</h1>
      <p>
        To import a scan config, select the configuration file and hit the
        "Import Scan Config" to submit the scan config.
        The list of scan configs will be updated.
        Note that if the name of the scan config already exists in your system,
        a numeric suffix will be added to the name of the imported scan config.
      </p>
      <p>
        To create a file that can be imported (e.g. if you have multiple GSA running
        on different machines), refer to the
        <a href="configs.html?token={/envelope/token}#export">export action</a>.
      </p>

      <h4>Scan Configs</h4>
      <p>
        Pressing the list icon
        <img src="/img/list.svg" class="icon icon-sm" alt="Scan Configs" title="Scan Configs"/>
        will switch to the
        <a href="configs.html?token={/envelope/token}">Scan Configs</a>
        page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="schedule_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Schedule Details'"/>
    <xsl:with-param name="type" select="'schedule'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_SCHEDULES'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#schedule">Schedule</a>.
        This includes the Name, creation time, modification time,
        comment, date of the first run and next run, timezone, period
        and duration.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'schedule'"/>
        <xsl:with-param name="name" select="'Schedule'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Schedule'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="schedules.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Schedules'"/>
    <xsl:with-param name="type" select="'schedule'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_SCHEDULES'"/>
      </xsl:call-template>

      <p>
       This table provides an overview of all configured
       <a href="glossary.html?token={/envelope/token}#schedule">Schedules</a>.
       The complete contents of the schedule entries
       are shown (name, first run, next run, period and duration).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'schedule'"/>
        </xsl:call-template>
        <tr class="even">
          <td>First Run</td>
          <td>
              Date and time for the first run of the task.
          </td>
        </tr>
        <tr class="odd">
          <td>Next Run</td>
          <td>
            Date and time for the next run of the task.
          </td>
        </tr>
        <tr class="even">
          <td>Period</td>
          <td>
              Period after which the task should run again.
          </td>
        </tr>
        <tr class="odd">
          <td>Duration</td>
          <td>
              Maximum duration of a task.
          </td>
        </tr>
      </table>

      <h3>New Schedule</h3>
      <p>
        To create a new schedule click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Schedule" title="New Schedule"/> which
        goes to the <a href="new_schedule.html?token={/envelope/token}">New Schedule</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of schedules as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Schedule'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_schedule.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Schedules'"/>
    <xsl:with-param name="type" select="'schedule'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_SCHEDULE'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#schedule">Schedule</a>
        the dialog offers these entries.
        Hit the button "Create Schedule" to submit the new schedule.
        The Schedules page will be shown.
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
          <td>Single Targets</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>Targets with only one host</td>
        </tr>
        <tr class="odd">
          <td>First Run</td>
          <td>yes</td>
          <td>--</td>
          <td>Choice</td>
          <td>05:30 10 Jan 2013</td>
        </tr>
        <tr class="even">
          <td>Timezone</td>
          <td>no</td>
          <td>80</td>
          <td>Choice</td>
          <td>Europe/Berlin</td>
        </tr>
        <tr class="odd">
          <td>Period</td>
          <td>no</td>
          <td>--</td>
          <td>Choice</td>
          <td>5 Days</td>
        </tr>
        <tr class="even">
          <td>Duration</td>
          <td>no</td>
          <td>--</td>
          <td>Choice</td>
          <td>3 Hours</td>
        </tr>
      </table>

      <h4>Schedules</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Schedules" title="Schedules"/>
       will switch to the <a href="schedules.html?token={/envelope/token}">Schedules</a>
       page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template name="scanner-actions">
  <h4>Verify Scanner</h4>
  <p>
    Verify that the Scanner is online, and that the Manager is able to
    connect to it with the provided certificates.
  </p>
  <h4>Download Certificate</h4>
    <p>
     Pressing the "Download Certificate" icon
     <img src="/img/key.svg" class="icon icon-sm" alt="Download Certificate"
          title="Download Certificate"/>
     will download the Certificate.
    </p>
  <h4>Download CA Certificate</h4>
    <p>
     Pressing the "Download CA Certificate" icon
     <img src="/img/key.svg" class="icon icon-sm" alt="Download CA Certificate"
          title="Download CA Certificate"/>
     will download the CA's Certificate.
    </p>
</xsl:template>

<xsl:template mode="help" match="scanners.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scanners'"/>
    <xsl:with-param name="type" select="'scanner'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_SCANNERS'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all configured
        <a href="glossary.html?token={/envelope/token}#scanner">Scanners</a>.
        (name, host, port and type).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'scanner'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Host</td>
          <td>Host of the scanner.</td>
        </tr>
        <tr class="odd">
          <td>Port</td>
          <td>Network port of the scanner.</td>
        </tr>
        <tr class="even">
          <td>Type</td>
          <td>Type of the scanner</td>
        </tr>
      </table>

      <h3>New Scanner</h3>
      <p>
        To create a new scanner click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Scanner" title="New Scanner"/> which
        goes to the <a href="new_scanner.html?token={/envelope/token}">New Scanner</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of scanners as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Scanner'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>
      <xsl:call-template name="scanner-actions"/>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scanner_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scanner Details'"/>
    <xsl:with-param name="type" select="'scanner'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_SCANNERS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#scanner">Scanner</a>.
        This includes the Name, creation time, modification time,
        comment, host, port and type of the scanner.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'scanner'"/>
        <xsl:with-param name="name" select="'Scanner'"/>
      </xsl:call-template>
      <xsl:call-template name="scanner-actions"/>

      <h2>Online Response of Scanner</h2>
      <p>
        If the Scanner is of type OSP, is available and it is possible to
        connect and verify it using the provided CA Certificate, Certificate and
        Private Key, the following information is also fetched and provided.
      </p>
      <p>
        Scanner name: Name of the Scanner tool wrapped by the OSP Scanner.
      </p>
      <p>
        Scanner version: Version of the Scanner tool wrapped by the OSP Scanner.
      </p>
      <p>
        OSP Daemon: Name of the OSP daemon.
      </p>
      <p>
        Protocol: Version of the OSP protocol.
      </p>
      <h3>Description</h3>
      <p>
        Detailed description as fetched from the Scanner.
      </p>

      <h3>Scanner parameters</h3>
      <p>
        This table provides an overview of the Scanner parameters as fetched
        from the OSP scanner. This includes the ID, Description, Type and
        Default value of the parameter. These will be used as Scanner
        preferences When creating a new
        <a href="glossary.html?token={/envelope/token}#config">Scan Config</a>
        based on this Scanner.
      </p>
      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Scanner'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="users.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Users'"/>
    <xsl:with-param name="type" select="'user'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_USERS'"/>
      </xsl:call-template>

      <a name="users"></a>

      <p>
       The administration of users is only accessible for users who own
       the "Administrator" role.
      </p>

      <p>
       This table provides an overview of all configured
       users.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'user'"/>
          <xsl:with-param name="comment" select="false ()"/>
        </xsl:call-template>
        <tr class="even">
          <td>Roles</td>
          <td>Shows the roles of the user.</td>
        </tr>
        <tr class="odd">
          <td>Groups</td>
          <td>Shows the groups of the user.</td>
        </tr>
        <tr class="even">
          <td>Host Access</td>
          <td>Host access rules of the user.</td>
        </tr>
        <tr class="odd">
          <td>Authentication Type</td>
          <td>Local, LDAP or RADIUS</td>
        </tr>
      </table>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'User'"/>
        <xsl:with-param name="notrashcan" select="1"/>
      </xsl:call-template>

      <h4>Delete User</h4>
      <p>
       Pressing the delete icon
       <img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/>
       will delete the user account.
      </p>
      <p>
       It is not possible to remove the last Administrator, which
       is the same as removing the currently used account.
      </p>

      <a name="newuser"></a>
      <h2>New User</h2>
      <p>
       For creating a user the dialog offers these entries.
       Hit the button "Create User" to submit the new user.
       The list of users will be updated.
      </p>
      <p>
       Note on <b>Host Access</b>: If "Deny all and allow:" or "Allow all and deny:" is chosen, the text field should
       contain a list of <b>Hosts</b>.
       <xsl:call-template name="hosts_note"/>
      </p>
      <p>
       Note on <b>Interface Access</b>: If "Deny all and allow:" or "Allow all and deny:" is chosen, the text field should
       contain a list of comma-separated interface names.
      </p>
      <p>
       Note on <b>Roles</b>:
      </p>
      <p>
       You can choose from all the Roles available on the
       <a href="roles.html?token={/envelope/token}">Roles</a>
       page, except for Super Admin.  This includes the
       <a href="roles.html?token={/envelope/token}#predefined">predefined Roles</a>
       described on the help page.
      </p>
      <p>
       It is possible to assign multiple roles to a User which will grant the
       permissions of each role. For example a User with the roles "Info" and
       "Monitor" will be able to view both SecInfo and system reports.
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
          <td>yes *</td>
          <td>40</td>
          <td>Free form text</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Roles</td>
          <td>no</td>
          <td>---</td>
          <td>Choice</td>
          <td>User</td>
        </tr>
        <tr class="even">
          <td>Host access</td>
          <td>yes</td>
          <td>---</td>
          <td>"Allow all", or either "Allow all and deny:" or "Deny all and allow:" with additional entry</td>
          <td>"Allow all", "Allow all and deny:" and "<tt>192.168.13.2/31,192.168.14.12</tt>"</td>
        </tr>
        <tr class="even">
          <td>Interface access</td>
          <td>yes</td>
          <td>---</td>
          <td>"Allow all", or either "Allow all and deny:" or "Deny all and allow:" with additional entry</td>
          <td>"Allow all", "Allow all and deny:" and "<tt>eth0, eth2, eth3</tt>"</td>
        </tr>
      </table>
      <p>
        If per-User-LDAP Authentication is configured, an additional checkbox
        ("Allow LDAP- Authentication only") is shown. When ticked, the user can only
        log in via the configured LDAP-Server.
      </p>
      <p>
        * The password field is optional when this checkbox is ticked.
      </p>

      <p>
        If RADIUS Authentication is configured, an additional checkbox
        ("Allow RADIUS Authentication Only") is shown. When ticked, the user can only
        log in via the configured RADIUS server.
      </p>

      <a name="peruserldapauthentication"></a>
      <h2>LDAP per-User Authentication</h2>
      <p>
       These settings are only visible if the backend
       is configured to support "per-User" LDAP authentication.
      </p>
      <p>
       Changes will be saved after confirming with the "Save" button,
       but <b>only get into effect after</b> the backend is restarted.
      </p>
      <p>
       In "per-User" Authentication, host access rules and role are stored locally.
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
          <td>The Distinguishable Name (DN) for authentication. Place a single %s where the
              username should be inserted.</td>
          <td>Regular LDAP:<br/>
              cn=users,ou=center,dc=org<br/>
	      Using the uid attribute:<br/>
	      uid=users,ou=center,dc=org<br/>
	      In this last case, "uid=user" will be used as filter, and
	      "ou=center,dc=org" <br/>
	      will be used as base object to perform a search and
	      to retrieve the corresponding DN for the authentication:<br/>
              <br/>
              Active Directory:<br/>
              %s@mydomain<br/>
              or<br/>
              mydomain\%s</td>
        </tr>
      </table>

      <a name="radiusauthentication"></a>
      <h2>RADIUS Authentication</h2>
      <p>
       These settings are only visible if the backend is configured to support
       RADIUS authentication.
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Description</td>
          <td>Example</td>
        </tr>
        <tr class="odd">
          <td>Enable</td>
          <td>Whether or not to use RADIUS authentication.</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>RADIUS Host</td>
          <td>Hostname or IP of the RADIUS service. The default 1812 UDP port
              will be used. </td>
          <td>radius.example.com</td>
        </tr>
        <tr class="odd">
          <td>Secret Key</td>
          <td>The RADIUS Secret Key to be used for authentication.</td>
          <td>testing123</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="user_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'User Details'"/>
    <xsl:with-param name="type" select="'user'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_USERS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#user">User</a>.
        This includes the name, role and groups.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'user'"/>
        <xsl:with-param name="name" select="'User'"/>
        <xsl:with-param name="ultimate" select="'1'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="permissions.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Permissions'"/>
    <xsl:with-param name="type" select="'permission'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    | <a href="standard_actions.html?token={/envelope/token}">Standard Actions</a>
    | <a href="filtering.html?token={/envelope/token}">Filtering</a>
    | <a href="permission_details.html?token={/envelope/token}">Permission Details</a>
    | <a href="new_permission.html?token={/envelope/token}">New/Edit Permission Dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_PERMISSIONS'"/>
      </xsl:call-template>

      <p>
        The help for
        <a href="new_permission.html?token={/envelope/token}">New Permission</a>
        gives an
        <a href="new_permission.html?token={/envelope/token}#overview">overview</a>
        of the permission concept.
      </p>
      <p>
        This table provides an overview of all configured
        <a href="glossary.html?token={/envelope/token}#permission">Permissions</a>.
        The complete contents of the permission entries
        are shown (name, comment, resource type, resource, subject type, subject).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'permission'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Description</td>
          <td>Description of the permission.</td>
        </tr>
        <tr class="odd">
          <td>Resource Type</td>
          <td>Type of resource that the permission applies to, if one was provided.</td>
        </tr>
        <tr class="even">
          <td>Resource</td>
          <td>Name of resource that the permission applies to.</td>
        </tr>
        <tr class="odd">
          <td>Subject Type</td>
          <td>Type of subject to whom the permission is given: User, Role or
              Group.</td>
        </tr>
        <tr class="even">
          <td>Subject</td>
          <td>Subject to whom the permission is given.</td>
        </tr>
      </table>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_permission.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New/Edit Permission'"/>
    <xsl:with-param name="type" select="'permission'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    | <a href="/help/permissions.html?token={/envelope/token}">Permissions</a>
    | <a href="permission_details.html?token={/envelope/token}">Permission Details</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_PERMISSION'"/>
      </xsl:call-template>

      <p>
        The New Permission page provides a low level interface for creating
        <a href="glossary.html?token={/envelope/token}#permission">permission</a>s.
      </p>
      <p>
        For creating a new permission the dialog offers these entries.
        Hit the button "Create Permission" to submit the new permission.
        The Permissions page will be shown.
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
          <td>--</td>
          <td>Choice</td>
          <td>CREATE_TASK</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>Permissions for tier1 users</td>
        </tr>
        <tr class="odd">
          <td>Subject</td>
          <td>yes</td>
          <td>--</td>
          <td>Choice</td>
          <td>
            User: User1
          </td>
        </tr>
        <tr class="even">
          <td>Resource ID</td>
          <td>no</td>
          <td>--</td>
          <td>UUID</td>
          <td>03c8aa9e-a062-4e32-bf8d-cd02d76902ec</td>
        </tr>
        <tr class="odd">
          <td>Resource Type</td>
          <td>no</td>
          <td>--</td>
          <td>Type: User, Role or Group</td>
          <td>Role</td>
        </tr>
      </table>

      <a name="overview"></a>
      <h4>Conceptual Overview</h4>

      <p>
        A permission applies to a <b>subject</b>.  The subject is either a user, role
        or group.  The permission enables the subject to perform the associated
        action.
      </p>

      <p>
        There are two types of permissions:
      </p>
      <ul>
        <li>
          <b>Command Permissions</b>
          <p>
            Command permissions are linked to the protocol used by the task
            management server, the
            <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OpenVAS Management Protocol (OMP)</a>.
            Each command permission applies to a specific
            <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OMP</a>
            command.  The name of the
            permission is the relevant command.
          </p>
          <p>
            A command permission may either be command level or resource level.
          </p>
          <ul>
            <li>
              <b>Command Level</b>
              <p>
                Omitting the resource creates a command level permission.  This
                gives the subject the ability to run the associated OMP command.
              </p>
              <p>
                For example, the predefined "Admin" role, has a command level
                permission "GET_USERS".  This gives Admin users the
                ability to access the list of users.
              </p>
              <p>
                Command level permissions override resource level permissions.
              </p>
            </li>
            <li>
              <b>Resource Level</b>
              <p>
                A resource level permission allows the subject to run the given OMP
                command on a specific resource.  Examples of resources include
                tasks, targets and schedules.
              </p>
              <p>
                For example, a permission named "GET_SCHEDULES" can be added with
                "Resource ID" set to the ID of a schedule, and subject set to a
                particular user.  This will give the user the ability to view the
                schedule.  The schedule will show up on the user's Schedules page.
              </p>
            </li>
          </ul>
        </li>
        <li>
          <b>Super Permissions</b>
          <p>
            Every resource is either global, or has an owner.  Examples of
            resources include tasks, targets and schedules.
          </p>
          <p>
            Super permissions give the subject effective ownership of all the
            resources owned by a user, role or group.
          </p>
          <p>
            For example, a user Alice can be given Super permission on user Bob.
            This gives gives Alice full access to all of Bob's resources.
            Alice can modify and run all of Bob's tasks, view Bob's reports,
            delete Bob's schedules, etc.
          </p>
          <p>
            Super permissions can be given on:
          </p>
          <ul>
            <li>
              <b>Users</b>
              <p>
                Subject has access to all resources owned by the user.
              </p>
            </li>
            <li>
              <b>Roles</b>
              <p>
                Subject has access to all resources owned by any user who
                has the role.
              </p>
            </li>
            <li>
              <b>Groups</b>
              <p>
                Subject has access to all resources owned by any user in
                the group.
              </p>
            </li>
            <li>
              <b>Everyone</b>
              <p>
                Subject has access to all resources.
              </p>
              <p>
                This is the permission given to the role Super Admin.  It
                is not possible to create this permission.  The only way
                to grant this permission is by assigning the Super Admin
                role to the user, which can only be done on the command
                line of the Management service.
              </p>
            </li>
          </ul>
          <p>
            The commands that a user may run are still determined by the
            command level permissions that have been granted to a user.
          </p>
          <p>
            In order to contain privileges, users may only grant Super
            permissions on users, roles and groups that they created.
            The exception to this is a Super Admin user, who may grant
            Super permissions on any user, role or group.
          </p>
        </li>
      </ul>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_permissions.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Create Multiple Permission'"/>
    <xsl:with-param name="type" select="'permission'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">
      <br/>
      <p>
        This form allows you to create a set of
        predefined permissions for a specific resource. If you accessed the
        page from a resource details page it can also create permissions for
        related resources.
      </p>
      <h3>Permission types</h3>
      <h4>Read</h4>
      <p>
        Granting "read" permissions means granting the permission to view the
        the resource on list pages and its details page (get_[...]).
      </p>
      <h4>Proxy</h4>
      <p>
        Granting "proxy" permissions means granting the permissions for
        normal viewing and manipulation of a resource, not including deleting
        it. For most types this means granting reading permissions ("get_[...]")
        as well as the permission to modify it ("modify_[...]").
      </p>
      <p>
        However, some types also include additional permissions:
        <ul>
          <li><b>Tasks</b> also include permissions to start, stop and
          resume the task (start_task, stop_task and resume_task).</li>
          <li><b>Alerts</b> additionally have the permission to test them
          (test_alert).</li>
          <li><b>Report Formats, Agents</b> and <b>Scanners</b> include the
          permission to validate them (validate_[...]).</li>
        </ul>
      </p>
      <h3>Related resources</h3>
      <p>
        For some types the "Create Multiple Permissions" form can also create
        permissions as described above for related resources:
      </p>
      <p>
        <ul>
          <li>For <b>Tasks</b> this can include the Alerts and their Filters, the Target as well as its related Credentials and Port List, the Schedule, the Scanner and the Scan Config.</li>
          <li><b>Targets</b> can include the up to three LSC Credentials
          (SSH, SMB and ESXi) and the Port List.</li>
          <li><b>Alerts</b> can include the Filter that is used on the Report.</li>
        </ul>
      </p>
      <p>
        You can select whether to include these or even to create permissions
        just for the related resources from the last dropdown of the form.
        You can view the details of the related resources by clicking the
        links listed below the dropdown.
      </p>
      <p>
        Keep in mind that related resources are only available if the page
        was accessed from a resource details page like
        <a href="/help/task_details.html?token={/envelope/token}">Task Details</a>.<br/>
        If related resources are available you will also not be able to
        select a different type and ID.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="permission_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Permission Details'"/>
    <xsl:with-param name="type" select="'permission'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    | <a href="standard_actions.html?token={/envelope/token}">Standard Actions</a>
    | <a href="permissions.html?token={/envelope/token}">Permissions</a>
    | <a href="new_permission.html?token={/envelope/token}">New/Edit Permission Dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_PERMISSIONS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#permission">Permission</a>.
        This includes the name, comment, resource type, subject name and type
        and resource name and type.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="resource_permissions.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Resource Permissions'"/>
    <xsl:with-param name="type" select="'permission'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">
      <br/>
      <p>
        The Resource Permissions window shown on details pages contains a list
        of
        <a href="glossary.html?token={/envelope/token}#permission">Permissions</a>
        specific to the current resource. Its layout is the same as on to the
        <a href="permissions.html?token={/envelope/token}">Permissions list</a>
        page.
      </p>
      <h3>New Permission</h3>
      <p>
        The "New Permission" icon
        <img src="/img/new.svg" alt="New Permission" title="New Permission"/>
        will open the
        <a href="new_permission.html?token={/envelope/token}">New Permission</a>
        page with the UUID of the current resource already filled into the form.
      </p>
      <p>
        The selection of permissions will also be limited to ones relevant
        to the current resource, with the "get" permission selected by default.
        <br/>
        For example, on a Target the available permissions are "delete_target",
        "get_targets" and "modify_target", with "get_targets" preselected.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="roles.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Roles'"/>
    <xsl:with-param name="type" select="'role'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_ROLES'"/>
      </xsl:call-template>

      <p>
       This table provides an overview of all configured
       <a href="glossary.html?token={/envelope/token}#role">Roles</a>.
        A summary of the role entries is shown.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'role'"/>
        </xsl:call-template>
      </table>

      <a name="predefined"></a>
      <h3>Predefined Roles</h3>
      <p>
        Certain roles are always present.  It is not possible to modify these roles.
      </p>

      <ul>
        <li>
          <b>Super Admin</b>
          <p>
            Highest level of permission.  Able to perform
            any action.  Automatically has full access to
            all resources (Task, Targets, etc.) of all users.
          </p>
        </li>
        <li>
          <b>Admin</b>
          <p>
            An administrator.  Able to perform any action, including
            administrative actions like creating users, roles and groups.
          </p>
          <p>
            An Admin is capable of accessing the resources of other users.
            However, the Admin must set this up manually, and this is limited
            to the users, roles and groups that the Admin created.
          </p>
        </li>
        <li>
          <b>User</b>
          <p>
            A regular user.  May perform everyday actions like creating and
            running tasks.
          </p>
        </li>
        <li>
          <b>Observer</b>
          <p>
            An observer.  Has read-only access.  Observers are capable only
            of viewing.  That is, an observer is forbidden from creating,
            removing, modifying or using all tasks, targets, configs, etc.
          </p>
          <p>
            An Observer only has access to those resources
            that have been explicitly shared with the observer.
          </p>
        </li>
        <li>
          <b>Info</b>
          <p>
            Access to SecInfo pages only.  Able to modify their personal
            settings, for example to change their password.
          </p>
        </li>
        <li>
          <b>Guest</b>
          <p>
            Access to SecInfo pages only, for anonymous login.  Like the Info
            role, but not able to modify personal settings.
          </p>
          <p>
            This role caters for the optional "Login as guest" link on the
            Login page.  The role has just enough capability to
            view the security data in the SecInfo menu.
          </p>
        </li>
        <li>
          <b>Monitor</b>
          <p>
            A system performance monitor.  Access to the system reports only.
          </p>
        </li>
      </ul>

      <h3>Exporting</h3>
      <p>
        Export the current list of roles as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Role'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="role_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Role Details'"/>
    <xsl:with-param name="type" select="'role'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_ROLES'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#role">Role</a>.
        This includes the Name, creation time, modification time,
        comment and users.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'role'"/>
        <xsl:with-param name="name" select="'Role'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="contents.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Contents'"/>
  </xsl:call-template>

  <div class="section-box">
    <div style="text-align:left">

      <h1>Contents</h1>
      <p>
       Small <a href="/help/contents.html?token={/envelope/token}" title="Help"><img src="/img/help.svg" class="icon icon-sm"/></a>
       icons all over the web interface will jump you into the respective contents.
       Alternatively you can browse the following structure.
      </p>

      <div class="bullet-list">
        <ul>
          <li> Scans </li>
          <ul>
            <li> <a href="tasks.html?token={/envelope/token}">Tasks</a></li>
              <ul>
                <li> <a href="new_task.html?token={/envelope/token}">New Task</a></li>
                <li> <a href="task_details.html?token={/envelope/token}">Task Details and Reports</a></li>
                <li> <a href="view_report.html?token={/envelope/token}">View Report</a></li>
                <li> <a href="results.html?token={/envelope/token}">Results</a> </li>
                  <ul>
                    <li> <a href="result_details.html?token={/envelope/token}">Result Details</a></li>
                  </ul>
              </ul>
            <li> <a href="notes.html?token={/envelope/token}">Notes</a> </li>
              <ul>
                <li> <a href="new_note.html?token={/envelope/token}">New Note</a></li>
                <li> <a href="note_details.html?token={/envelope/token}">Note Details</a></li>
              </ul>
            <li> <a href="overrides.html?token={/envelope/token}">Overrides</a></li>
              <ul>
                <li> <a href="new_override.html?token={/envelope/token}">New Override</a></li>
                <li> <a href="override_details.html?token={/envelope/token}">Override Details</a></li>
              </ul>
          </ul>
          <li> Assets </li>
          <ul>
            <li> <a href="hosts.html?token={/envelope/token}">Hosts</a></li>
              <ul>
                <li> <a href="new_host.html?token={/envelope/token}">New Host</a></li>
                <li> <a href="host_details.html?token={/envelope/token}">Host Details</a></li>
              </ul>
            <li> <a href="oss.html?token={/envelope/token}">Operating Systems</a></li>
              <ul>
                <li> <a href="os_details.html?token={/envelope/token}">Operating System Details</a></li>
              </ul>
            <li> <a href="hosts_classic.html?token={/envelope/token}">Hosts (Classic)</a></li>
          </ul>
          <li> SecInfo </li>
          <ul>
            <li> <a href="nvts.html?token={/envelope/token}">NVTs</a></li>
              <ul>
                <li> <a href="nvt_details.html?token={/envelope/token}">NVT Details</a></li>
              </ul>
            <li> <a href="cves.html?token={/envelope/token}">CVEs</a></li>
              <ul>
                <li> <a href="cve_details.html?token={/envelope/token}">CVE Details</a></li>
              </ul>
            <li> <a href="cpes.html?token={/envelope/token}">CPEs</a></li>
              <ul>
                <li> <a href="cpe_details.html?token={/envelope/token}">CPE Details</a></li>
              </ul>
            <li> <a href="ovaldefs.html?token={/envelope/token}">OVAL Definitions</a></li>
              <ul>
                <li> <a href="ovaldef_details.html?token={/envelope/token}">OVAL Definition Details</a></li>
              </ul>
            <li> <a href="cert_bund_advs.html?token={/envelope/token}">CERT-Bund Advisories</a></li>
              <ul>
                <li> <a href="cert_bund_adv_details.html?token={/envelope/token}">CERT-Bund Advisory Details</a></li>
              </ul>
            <li> <a href="dfn_cert_advs.html?token={/envelope/token}">DFN-CERT Advisories</a></li>
              <ul>
                <li> <a href="dfn_cert_adv_details.html?token={/envelope/token}">DFN-CERT Advisory Details</a></li>
              </ul>
            <li> <a href="allinfo.html?token={/envelope/token}">All SecInfo</a></li>
          </ul>
          <li> Configuration</li>
          <ul>
            <li> <a href="configs.html?token={/envelope/token}">Scan Configs</a></li>
            <ul>
              <li> <a href="new_config.html?token={/envelope/token}">New Scan Config</a></li>
              <li> <a href="config_details.html?token={/envelope/token}">Scan Config Details</a></li>
              <li> <a href="config_family_details.html?token={/envelope/token}">Scan Config Family Details</a></li>
              <li> <a href="config_nvt_details.html?token={/envelope/token}">Scan Config NVT Details</a></li>
              <li> <a href="config_editor.html?token={/envelope/token}">Scan Config Editor</a></li>
              <li> <a href="config_editor_nvt_families.html?token={/envelope/token}">Scan Config Family Editor</a></li>
              <li> <a href="config_editor_nvt.html?token={/envelope/token}">Scan Config NVT Editor</a></li>
            </ul>
            <li> <a href="targets.html?token={/envelope/token}">Targets</a></li>
              <ul>
                <li> <a href="new_target.html?token={/envelope/token}">New/Edit Target</a></li>
                <li> <a href="target_details.html?token={/envelope/token}">Target Details</a></li>
              </ul>
            <li> <a href="credentials.html?token={/envelope/token}">Credentials</a></li>
              <ul>
                <li> <a href="new_credential.html?token={/envelope/token}">New Credential</a></li>
                <li> <a href="credential_details.html?token={/envelope/token}">Credential Details</a></li>
              </ul>
            <li> <a href="agents.html?token={/envelope/token}">Agents</a></li>
              <ul>
                <li> <a href="new_agent.html?token={/envelope/token}">New Agent</a></li>
                <li> <a href="agent_details.html?token={/envelope/token}">Agent Details</a></li>
              </ul>
            <li> <a href="alerts.html?token={/envelope/token}">Alerts</a></li>
              <ul>
                <li> <a href="new_alert.html?token={/envelope/token}">New Alert</a></li>
                <li> <a href="alert_details.html?token={/envelope/token}">Alert Details</a></li>
              </ul>
            <li> <a href="tags.html?token={/envelope/token}">Tags</a></li>
              <ul>
                <li> <a href="new_tag.html?token={/envelope/token}">New Tag</a></li>
                <li> <a href="tag_details.html?token={/envelope/token}">Tag Details</a></li>
              </ul>
            <li> <a href="filters.html?token={/envelope/token}">Filters</a></li>
              <ul>
                <li> <a href="new_filter.html?token={/envelope/token}">New Filter</a></li>
                <li> <a href="filter_details.html?token={/envelope/token}">Filter Details</a></li>
              </ul>
            <li> <a href="schedules.html?token={/envelope/token}">Schedules</a></li>
              <ul>
                <li> <a href="new_schedule.html?token={/envelope/token}">New Schedule</a></li>
                <li> <a href="schedule_details.html?token={/envelope/token}">Schedule Details</a></li>
              </ul>
            <li> <a href="permissions.html?token={/envelope/token}">Permissions</a></li>
              <ul>
                <li> <a href="new_permission.html?token={/envelope/token}">New Permission</a></li>
                <li> <a href="new_permissions.html?token={/envelope/token}">Create Multiple Permissions</a></li>
                <li> <a href="permission_details.html?token={/envelope/token}">Permission Details</a></li>
              </ul>
            <li> <a href="port_lists.html?token={/envelope/token}">Port Lists</a></li>
              <ul>
                <li> <a href="new_port_list.html?token={/envelope/token}">New Port List</a></li>
                <li> <a href="port_list_details.html?token={/envelope/token}">Port List Details</a></li>
              </ul>
            <li> <a href="report_formats.html?token={/envelope/token}">Report Formats</a></li>
              <ul>
                <li> <a href="new_report_format.html?token={/envelope/token}">New Report Format</a></li>
                <li> <a href="report_format_details.html?token={/envelope/token}">Report Format Details</a></li>
              </ul>
          </ul>
          <li> Administration</li>
          <ul>
            <li> <a href="users.html?token={/envelope/token}">Users</a></li>
              <ul>
                <li> <a href="user_details.html?token={/envelope/token}">User Details</a></li>
                <li> <a href="new_user.html?token={/envelope/token}">New User</a></li>
              </ul>
            <li> <a href="groups.html?token={/envelope/token}">Groups</a></li>
              <ul>
                <li> <a href="new_group.html?token={/envelope/token}">New Group</a></li>
                <li> <a href="group_details.html?token={/envelope/token}">Group Details</a></li>
              </ul>
            <li> <a href="roles.html?token={/envelope/token}">Roles</a></li>
              <ul>
                <li> <a href="new_role.html?token={/envelope/token}">New Role</a></li>
                <li> <a href="role_details.html?token={/envelope/token}">Role Details</a></li>
              </ul>
            <li> <a href="feed_management.html?token={/envelope/token}">Feed</a></li>
          </ul>
          <li> Miscellaneous</li>
          <ul>
            <li> <a href="standard_actions.html?token={/envelope/token}">Standard Actions</a></li>
            <li> <a href="trashcan.html?token={/envelope/token}">Trashcan</a></li>
            <li> <a href="my_settings.html?token={/envelope/token}">My Settings</a></li>
            <li> <a href="performance.html?token={/envelope/token}">Performance</a></li>
            <li> <a href="cvss_calculator.html?token={/envelope/token}">CVSS Calculator</a></li>
            <li> <a href="filtering.html?token={/envelope/token}">Filtering</a></li>
            <li> <a href="powerfilter.html?token={/envelope/token}">Powerfilter</a></li>
            <li> <a href="user-tags.html?token={/envelope/token}">User Tags list</a></li>
            <li> <a href="nvts.html?token={/envelope/token}">NVT Details</a></li>
            <li> <a href="qod.html?token={/envelope/token}">Quality of Detection (QoD)</a></li>
            <li> Protocol Documentation</li>
              <ul>
                <li> <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OMP (OpenVAS Management Protocol)</a></li>
              </ul>
            <li> <a href="error_messages.html?token={/envelope/token}">Error Messages</a></li>
            <li> <a href="glossary.html?token={/envelope/token}">Glossary</a></li>
          </ul>
        </ul>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cpe_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'CPE Details'"/>
    <xsl:with-param name="info-type" select="'cpe'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        A page that provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#cpe">CPE</a>.
        This includes the all referencing CVEs, creation time, modification time,
        deprecation status and the overall status.
      </p>

      <h2>Reported vulnerabilities</h2>
      <p>
        This table provides an overview of the
        <a href="glossary.html?token={/envelope/token}#cve">CVEs</a>
        that are associated with the CPE (if any).
        Details of these CVEs can be seen after a click on the CVE name.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cve_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'CVE Details'"/>
    <xsl:with-param name="info-type" select="'cve'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
       A page that provides the original detailed information about a CVE.
       This includes the dates of publication and last modification, the
       description, CVSS information, list of vulnerable products and
       references.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="ovaldef_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'OVAL Definition Details'"/>
    <xsl:with-param name="info-type" select="'ovaldef'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        A page that provides detailed information about an
        <a href="glossary.html?token={/envelope/token}#ovaldef">OVAL Definition</a>.
        This includes the creation time, modification time, version number,
        title, definition class and detailed description.
      </p>
      <h2>Affected</h2>
      <p>
        One or more tables that describe the systems affected by the definition.
        Each entry consists of one family and a list of platforms and products.
      </p>
      <h2>Criteria</h2>
      <p>
        Shows a tree of the definition&apos;s criteria. Logical operators are
        <b>bold</b> with comments in <i>italics</i>. Leaf node comments are
        written in normal font with their associated OVAL-IDs
        (tests and extend-definitions) in <i>italics</i>.
      </p>
      <h2>References</h2>
      <p>
        A table containing references for the OVAL definition, each entry
        consisting of a source type, ID, and URL.
      </p>
      <h2>Repository history</h2>
      <p>
        Shows the current status (e.g. draft, interim, accepted) and a table
        showing the history of the definition. The first column describes the
        type of event (i.e. submission, change and status changes). The
        following columns are the date and the contributors, if applicable.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cert_bund_adv_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'CERT-Bund Advisory Details'"/>
    <xsl:with-param name="info-type" select="'cert_bund_adv'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        A page that provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#cert_bund_adv">CERT-Bund Advisory</a>.
        This includes the creation time, modification time, title, affected software and platforms, effect of an attack, whether remote attacks are possible, CERT-Bund risk rating and main reference.
      </p>
      <h3>Categories</h3>
      <p>
        This list contains the categories the advisory belongs to.
      </p>
      <h3>Description</h3>
      <p>
        This section contains a description of the affected products and of the vulnerability.
      </p>
      <h3>Referenced CVEs</h3>
      <p>
        This list provides an overview of the
        <a href="glossary.html?token={/envelope/token}#cve">CVEs</a>
        that are referenced by the advisory.
        Details of these CVEs can be by clicking on them.
      </p>
      <h3>Other links</h3>
      <p>
        This list contains links to sources of additional information on the vulnerability.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="dfn_cert_adv_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'DFN-CERT Advisory Details'"/>
    <xsl:with-param name="info-type" select="'dfn_cert_adv'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        A page that provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">DFN-CERT Advisory</a>.
        This includes the creation time, modification time, summary and a link
        URL to the full advisory.
      </p>
      <h3>Referenced CVEs</h3>
      <p>
        This list provides an overview of the
        <a href="glossary.html?token={/envelope/token}#cve">CVEs</a>
        that are referenced by the advisory.
        Details of these CVEs can be by clicking on them.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="error_messages.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Error Messages'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div class="pull-right">
      <a href="/omp?cmd=unknown_cmd&amp;token={/envelope/token}">Provoke a harmless internal error</a>
      (use <img src="/img/help.svg" class="icon icon-sm"/> to get back here)
    </div>
    <div style="text-align:left">

      <br/>

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
          two other options helps, you should log out of GSA. As long
          as GSA is still running, you will get the login dialog.
        </li></p>
      </ol>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="feed_management.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Feed Status'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_feeds&amp;token={/envelope/token}">Jump to dialog</a></div>
    <div style="text-align:left">
      <br/>
      <a name="feed_synchronization"></a>
      <p>
       This dialog shows the synchronization status of your NVT collection and
       SecInfo and general information about the Feed Services:
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Type</td>
          <td>The feed type (NVT, SCAP or CERT).</td>
        </tr>
        <tr class="even">
          <td>Content</td>
          <td>The types of information provided by the feed.</td>
        </tr>
        <tr class="odd">
          <td>Origin</td>
          <td>
            The name of the Feed Service your installation is configured to use.
            Hover over the name for a tooltip containing a description provided
            by the tool which will be used to synchronize your NVT collection
            or SecInfo with the Feed Service.
          </td>
        </tr>
        <tr class="even">
          <td>Version</td>
          <td>The version number of the feed data.</td>
        </tr>
        <tr class="odd">
          <td>Status</td>
          <td>
            Status information of the feed like the time since the last
            update.
          </td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="filter_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Filter Details'"/>
    <xsl:with-param name="type" select="'filter'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_FILTERS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#filter">Filter</a>.
        This includes the name, comment, term and type.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'filter'"/>
        <xsl:with-param name="name" select="'Filter'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Filter'"/>
        <xsl:with-param name="used_by" select="'Alert'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="filters.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Filters'"/>
    <xsl:with-param name="type" select="'filter'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_FILTERS'"/>
      </xsl:call-template>

      <p>
       This table provides an overview of all configured
       <a href="glossary.html?token={/envelope/token}#filter">Filters</a>.
       The complete contents of the filter entries
       are shown (name, comment, term and type).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'filter'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Term</td>
          <td>The filter term.  This describes how filtering will take place.</td>
        </tr>
        <tr class="odd">
          <td>Type</td>
          <td>
            The type of filter.  A filter can apply to a specific resource.  If
            blank then the filter applies to all resources.
          </td>
        </tr>
      </table>

      <h3>New Filter</h3>
      <p>
        To create a new filter click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Filter" title="New Filter"/> which
        goes to the <a href="new_filter.html?token={/envelope/token}">New Filter</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of filters as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Filter'"/>
        <xsl:with-param name="used_by" select="'Alert'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="glossary.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Glossary'"/>
  </xsl:call-template>

  <div class="section-box">,
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
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

      <a name="agent"></a>
      <h2>Agent</h2>
      <p>
        The agent facility provides storage for agent tools. Basically it
        is a store with integrated signature verification. Agents can be
        downloaded from here for manual installation on target systems.
        This agent feature is unrelated to the other elements of the user
        interface.
      </p>
      <p>
        Agents are tools installed and running on a target system.
        They collect or analyse information on the target system
        that might help to judge about vulnerabilities.
      </p>
      <p>
        During a vulnerability scan the agent is queried and
        status or results are retrieved. This is not the default
        behaviour. Special NVTs need to be configured to
        use an agent.
      </p>
      <p>
        Agents may work asynchronously regarding the scan: A first
        scan enables a function on the agent (for example search
        for weak passwords which may take a very long time)
        and a second scan retrieves whatever was identified since
        the last contact.
      </p>
      <p>
        In practice agents are used only for very specific cases
        and special circumstances. Today, most functionality is
        available either via methods of authenticated scans or
        via standard tools (for example: End-Point-Security)
        on the target systems.
      </p>

      <a name="alert"></a>
      <h2>Alert</h2>
      <p>
       An alert is an action that can be triggered at certain events.
       Usually this means notification, e.g. via e-mail in case of
       new found vulnerabilities.
      </p>

      <a name="asset"></a>
      <h2>Asset</h2>
      <p>
        Assets are discovered on the network during a vulnerability scan, or
        entered manually by the user.
        Currently Assets include Hosts and Operating Systems.
      </p>

      <a name="cert_bund_adv"></a>
      <h2>CERT-Bund Advisory (CERT_BUND_ADV)</h2>
      <p>
        An advisory published by CERT-Bund. See the
        <a href="/help/cert_bund_advs.html?token={/envelope/token}#about">
        &quot;About CERT-Bund&quot; section of the CERT-Bund Advisories page</a>
        for more information.
      </p>

      <a name="cpe"></a>
      <h2>CPE</h2>
      <p>
        Common Platform Enumeration is a structured naming scheme for
        information technology systems, platforms, and packages. Based upon the
        generic syntax for Uniform Resource Identifiers (URI), CPE includes a
        formal name format, a language for describing complex platforms, a
        method for checking names against a system, and a description format
        for binding text and tests to a name.
      </p>

      <p>
        (Source http://cpe.mitre.org).
      </p>

      <p>
        A CPE name starts with "cpe:/", followed by up to seven colon-separated components:
        <ul>
          <li>part (h, o or a)</li>
          <li>vendor</li>
          <li>product</li>
          <li>version</li>
          <li>update</li>
          <li>edition</li>
          <li>language</li>
        </ul>
        e.g. <code>cpe:/o:linux:kernel:2.6.0</code>
      </p>

      <a name="cve"></a>
      <h2>CVE</h2>
      <p>
        Common Vulnerabilities and Exposures is a dictionary of publicly known
        information security vulnerabilities and exposures.
      </p>
      <p>
        (Source: http://cve.mitre.org).
      </p>

      <a name="cvss"></a>
      <h2>CVSS</h2>
      <p>
        The Common Vulnerability Scoring System (CVSS) is an open framework to
        characterize vulnerabilities.
      </p>
      <p>
        (Source: http://www.first.org/cvss/cvss-guide).
      </p>

      <a name="dfn_cert_adv"></a>
      <h2>DFN-CERT Advisory (DFN_CERT_ADV)</h2>
      <p>
        An advisory published by DFN-CERT. See the
        <a href="/help/dfn_cert_advs.html?token={/envelope/token}#about">
        &quot;About DFN-CERT&quot; section of the DFN-CERT Advisories page</a>
        for more information.
      </p>

      <a name="filter"></a>
      <h2>Filter</h2>
      <p>
       A filter describes how to select a certain subset from a group of
       resources.
      </p>

      <a name="group"></a>
      <h2>Group</h2>
      <p>
       A group is a collection of users.
      </p>

      <a name="host"></a>
      <h2>Host</h2>
      <p>
       A host is a single system that may be scanned.  A
       <a href="#target">target</a> consists of one or more hosts.  Hosts may
       be recorded in the <a href="#asset">asset</a> database.
      </p>

      <a name="note"></a>
      <h2>Note</h2>
      <p>
       A note is a textual comment associated with an <a href="#nvt">NVT</a>.
       Notes show up in <a href="#report">reports</a>, below the results
       generated by the NVT.  A note can be applied to a particular
       result, task, severity class, port and/or host, so that the note appears only
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
       <a href="#config">Scan Config</a>.
      </p>

      <a name="ovaldef"></a>
      <h2>OVAL Definition (OVALDEF)</h2>
      <p>
        A definition as specified by the OVAL (Open Vulnerability and Assessment
        Language), version 5.10.1. It can be used for different classes of
        security data like vulnerabilities, patches or compliance policies.
      </p>
      <p>
        (Source: http://oval.mitre.org).
      </p>

      <a name="override"></a>
      <h2>Override</h2>
      <p>
       An override is a rule to change the severity of items
       within one or many <a href="#report">report</a>s.
      </p>
      <p>
       Overrides are especially useful to mark report items
       as False Positives (e.g. an incorrect or expected finding)
       or emphasize items that are of higher severity in the
       observed scenario.
      </p>

      <a name="permission"></a>
      <h2>Permission</h2>
      <p>
        A permission grants a <a href="#user">user</a>, <a href="#role">role</a>
        or <a href="#group">group</a> the right to perform a
        specific action.
      </p>

      <a name="port_list"></a>
      <h2>Port List</h2>
      <p>
       A port list is a list of ports.  Each <a href="#target">Target</a> is
       associated with a Port List.  This determines which ports are scanned
       during a scan of the Target.
      </p>

      <a name="prognostic_report"></a>
      <h2>Prognostic Report</h2>
      <p>
        Prognostic scans allow an upfront analysis about potential
        vulnerabilities of hosts. This happens without accessing these
        systems via the network and therefore the scan duration is
        virtually zero.
      </p>
      <p>
        Prognostic scans use product detections from previous scans and
        compare this inventory data with the most current security
        information (CVE) to match which products (meanwhile) are known to
        be vulnerable.
      </p>

      <a name="qod"></a>
      <h2>Quality of detection (QoD)</h2>
      <p>
        The QoD is a value between 0% and 100% describing the
        reliability of the executed vulnerability detection
        or product detection.
      </p>
      <p>
        For a more detailed description see the
        <a href="qod.html?token={/envelope/token}">QoD help page</a>.
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
       <a href="#config">Scan Config</a> that
       determines the extend of the report is part of the
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

      <a name="result"></a>
      <h2>Result</h2>
      <p>
       A single result generated by the scanner as part of a
       <a href="#report">report</a>, for example a vulnerability warning or a
       log message.
      </p>

      <a name="role"></a>
      <h2>Role</h2>
      <p>
       A role defines a set of <a href="#permission">permissions</a> that can be applied to a user or
       a <a href="#group">group</a>.
      </p>

      <a name="scan"></a>
      <h2>Scan</h2>
      <p>
       A scan is a <a href="#task">task</a> in progress.
       For each task only one scan can be active.
       The result of a scan is a <a href="#report">report</a>.
      </p>
      <p>
       The status of all active scans can be seen
       in the <a href="/omp?cmd=get_tasks?token={/envelope/token}">task overview</a>.
       The progress is shown as a percentage of
       total number of tests to be executed. The
       duration of a scan is determined by the number
       <a href="#target">targets</a> and the complexity
       of the <a href="#config">Scan Config</a>
       and ranges from 1 minute to many hours or even days.
      </p>
      <p>
       The task overview offers an option to stop a scan.
       The resulting report will then be incomplete.
      </p>

      <a name="scanner"></a>
      <h2>Scanner</h2>
      <p>
        A scanner is an OpenVAS Scanner daemon or compatible OSP daemon on
        which the <a href="#scan">scan</a> will be run.
      </p>

      <a name="config"></a>
      <h2>Scan Config</h2>
      <p>
       A scan config covers the selection
       of <a href="#nvt">NVTs</a> as well as general
       and very specific (expert) parameters for the scan server
       and for some of the NVTs.
      </p>
      <p>
       Not covered by a Scan Config is the selection
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

      <a name="tag"></a>
      <h2>Tag</h2>
      <p>
       A tag is a short data package consisting of a name and a value that is
       attached to a resource of any kind and contains user-defined information
       on this resource.
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
       and a <a href="#config">scan config</a>.
       Executing a task initiates a <a href="#scan">scan</a>.  Each scan
       produces a <a href="#report">report</a>.
       As a result, a task collects a series of reports.
      </p>
      <p>
       A task's target and scan config are static.
       Thus, the resulting sequence of reports describes the
       change of security status over time.
       However, a task may be marked as <b>alterable</b> when there are
       no reports present.  For such a task the target and scan config
       may be changed at any time, which may be convenient in certain
       situations.
      </p>
      <p>
       A <b>container task</b> is a task whose sole function is to hold
       imported reports.  Running a container task is forbidden.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="gplv2.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'GNU General Public License Version 2'"/>
  </xsl:call-template>

  <div class="section-box">
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

<xsl:template mode="help" match="group_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Group Details'"/>
    <xsl:with-param name="type" select="'group'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_GROUPS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#group">Group</a>.
        This includes the name, comment and users.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'group'"/>
        <xsl:with-param name="name" select="'Group'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="groups.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Groups'"/>
    <xsl:with-param name="type" select="'group'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_GROUPS'"/>
      </xsl:call-template>

      <p>
       This table provides an overview of all configured
       <a href="glossary.html?token={/envelope/token}#group">Groups</a>.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'group'"/>
        </xsl:call-template>
      </table>

      <h3>New Group</h3>
      <p>
        To create a new group click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Group" title="New Group"/> which
        goes to the <a href="new_group.html?token={/envelope/token}">New Group</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of groups as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Group'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template name="path_placeholders_list">
      <ul>
        <li><b>%C</b> - The creation date in the format YYYYMMDD.<br/>
        This gives the current date if a creation is not available, e.g.
        when exporting lists of resources.</li>
        <li><b>%c</b> - The creation time in the format HHMMSS.<br/>
        Falls back to the current time similar to %C.
        </li>
        <li><b>%D</b> - The current date in the format YYYYMMDD.</li>
        <li><b>%F</b> - The name of the format plugin used (XML for lists and types other than reports).</li>
        <li><b>%M</b> - The modification date in the format YYYYMMDD.<br/>
        If the modification date is not available this gives either creation
        date or the current date if a creation date is not available as well,
        e.g. when exporting lists of resources.</li>
        <li><b>%m</b> - The modification time in the format HHMMSS.<br/>
        Falls back to the creation time or current time similar to %M.</li>
        <li><b>%N</b> - The name of the resource or the associated task for
        reports. Lists and types without a name will use the type (see <b>%T</b>).</li>
        <li><b>%T</b> - The resource type, e.g. "task", "port_list".
        Pluralized for list pages.</li>
        <li><b>%t</b> - The current time in the format HHMMSS.</li>
        <li><b>%U</b> - The unique ID of the resource or "list" for lists of multiple resources.</li>
        <li><b>%u</b> - The name of the currently logged in user.</li>
        <li><b>%%</b> - The percent sign (%)</li>
      </ul>
</xsl:template>

<xsl:template mode="help" match="my_settings.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'My Settings'"/>
    <xsl:with-param name="type" select="'my_setting'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_SETTINGS'"/>
      </xsl:call-template>

      <p>
        This page lists the settings of the current user, like the user's timezone.
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Name of setting.</td>
        </tr>
        <tr class="even">
          <td>Value</td>
          <td>Value of setting.  For passwords the value is replaced with a sequence of *'s.</td>
        </tr>
      </table>

      <a name="edit"></a>
      <h2>Edit My Settings</h2>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'MODIFY_SETTING'"/>
      </xsl:call-template>

      <p>
        This table provides an editable version of the current user's settings.
      </p>

      <a name="timezone"></a>
      <h3>Timezone</h3>
      <p>
        The timezone used for the current user.  This is used across the
        entire user interface, and is the default timezone for reports.
      </p>
      <p>
        After setting the timezone, it is a good idea to check the time in the GSA
        header bar.  If the timezone was correctly selected this should show the
        current time.
      </p>

      <h3>Password</h3>
      <p>
        The password for logging into the GSA.
      </p>

      <h3>User Interface Language</h3>
      <p>
        The language used in the user interface.  If "Browser Language"
        is selected then the language requested by the browser will be used.
      </p>

      <h3>Rows Per Page</h3>
      <p>
        The default number of rows displayed in any listing.  This may be
        overridden by the default filter settings.
      </p>

      <h3>Wizard Rows</h3>
      <p>
        The number of rows up to which a wizard will be displayed.
      </p>
      <p>
        If the number of rows in a listing is above this value, and there is
        a wizard associated with the listing, then the wizard be hidden.
      </p>

      <h3>Details/List/Report Export File Name</h3>
      <p>
        The format used for the default file name for exported resource lists,
        resource details and reports respectively. The format string can
        contain alphanumeric characters, hyphens, underscores and placeholders
        that will be replaced as follows:
      </p>
      <xsl:call-template name="path_placeholders_list"/>
      <a name="severity_class"/>
      <h3>Severity Class</h3>
      <p>
        The severity classes split up the CVSS range into 3 ranges: High,
        Medium and Low. These ranges are used to apply colors for the
        severity bar in order to easily identify and compare severities of
        interest.
      </p>
      <p>
        Possible values include:
        <ul>
          <li>
            <b>NVD Vulnerability Severity Ratings:</b> The National Vulnerability Database (NVD)
            applies this mapping for their published content. See also http://nvd.nist.gov/cvss.cfm of
            the National Institute of Standards and Technology (NIST) of the U.S. government.
            <ul>
              <li>High: 7.0 - 10.0 </li>
              <li>Medium: 4.0 - 6.9 </li>
              <li>Low: 0.0 - 3.9 </li>
            </ul>
          </li>
          <li>
            <b>BSI Schwachstellenampel (Germany):</b> The German Federal Office for
            Information Security (Bundesamt für Sicherheit in der Informationstechnik, BSI)
            applies this mapping for their vulnerability traffic lights (German: "Schwachstellenampel").
            See also this document of BSI in German language:
            https://www.allianz-fuer-cybersicherheit.de/ACS/DE/_downloads/cybersicherheitslage/schwachstellenampel/BSI-CS_028.pdf
            <ul>
              <li>High: 7.0 - 10.0  ("rot": kritisch)</li>
              <li>Medium: 4.0 - 6.9 ("gelb": geringfügig-kritisch)</li>
              <li>Low: 0.0 - 3.9 ("grün": nicht kritisch)</li>
            </ul>
          </li>
          <li>
            <b>OpenVAS Classic:</b> Applies the traditional OpenVAS ratings:
            <ul>
              <li>High: 5.1 - 10.0 </li>
              <li>Medium: 2.1 - 5.0 </li>
              <li>Low: 0.0 - 2.0 </li>
            </ul>
          </li>
          <li>
            <b>PCI-DSS:</b> Applies the following mapping.
            <ul>
              <li>High: 4.0 - 10.0 </li>
              <li>None: 0.0 - 3.9 </li>
            </ul>
          </li>
        </ul>
      </p>
      <h3>Dynamic Severity</h3>
      <p>
        When set to <i>Yes</i>, the severity of scan results will be the
        current CVSS base score of the NVT. If set to <i>No</i>, the severity
        at the time of the scan will be shown.
      </p>
      <h3>Default Severity</h3>
      <p>
        The default severity to assign to results without a severity
        value.
      </p>
      <p>
        Currently this only applies to CVE results where the CVE cannot be
        found in the SCAP database. For other result types the scanner must
        provide a severity score.
      </p>

      <h3>Default Resources</h3>
      <p>
        Default selections for various resource creation pages like
        <a href="new_task.html?token={/envelope/token}">New Task</a> or
        <a href="new_target.html?token={/envelope/token}">New/Edit Target</a>
        and wizards.
      </p>
      <p>
        <b>Important Note:</b> These settings will only affect the initial selections
        inside Greenbone Security Assistant. Commands sent directly via
        <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OMP</a>
        will still use the built-in defaults.
        For example, creating a new Target using OMP without giving a Port List
        will always use the "OpenVAS Default" Port List, regardless of the
        default defined here.
      </p>
      <h4>Default Alert</h4>
      <p>
        Default <a href="glossary.html?token={/envelope/token}#alert">Alert</a>.
      </p>
      <h4>Default OpenVAS Scan Config</h4>
      <p>
        Default <a href="glossary.html?token={/envelope/token}#config">Scan Config</a> for new Tasks using OpenVAS scanners.
      </p>
      <h4>Default OSP Scan Config</h4>
      <p>
        Default <a href="glossary.html?token={/envelope/token}#config">Scan Config</a> for new Tasks using OSP scanners.
      </p>
      <h4>Default SSH Credential</h4>
      <p>
        Default Credential for logging in via SSH.
      </p>
      <h4>Default SSH Credential</h4>
      <p>
        Default Credential for logging in via SMB.
      </p>
      <h4>Default ESXi Credential</h4>
      <p>
        Default Credential for logging in to ESXi.
      </p>
      <h4>Default Port List</h4>
      <p>
        Default <a href="glossary.html?token={/envelope/token}#port_list">Port List</a> for new Targets.
      </p>
      <h4>Default Report Format</h4>
      <p>
        Default <a href="glossary.html?token={/envelope/token}#report_format">Report Format</a> for report downloading.
      </p>
      <h4>Default OpenVAS Scan Config</h4>
      <p>
        Default OpenVAS <a href="glossary.html?token={/envelope/token}#scanner">Scanner</a> for new Tasks.
      </p>
      <h4>Default OSP Scan Config</h4>
      <p>
        Default OSP <a href="glossary.html?token={/envelope/token}#scanner">Scanner</a> for new Tasks.
      </p>
      <h4>Default Schedule</h4>
      <p>
        Default <a href="glossary.html?token={/envelope/token}#schedule">Schedule</a> for new Tasks.
      </p>
      <h4>Default Target</h4>
      <p>
        Default <a href="glossary.html?token={/envelope/token}#target">Target</a> for new Tasks.
      </p>

      <h3>Resource Filters</h3>
      <p>
        Default filter applied for a particular resource. The dropdown menu will list
        <a href="filters.html?token={/envelope/token}">Filters</a> that have the
        same type as the resource.
        '--' means no filter will be applied and in this case other values such
        as Rows Per page will be used.
      </p>

      <h4>Agents filter</h4>
      <p>
        Default filter to use when getting the <a href="agents.html?token={/envelope/token}">Agents</a> page.
      </p>
      <h4>Alerts filter</h4>
      <p>
        Default filter to use when getting the <a href="alerts.html?token={/envelope/token}">Alerts</a> page.
      </p>
      <h4>Configs filter</h4>
      <p>
        Default filter to use when getting the <a href="configs.html?token={/envelope/token}">Configs</a> page.
      </p>
      <h4>Credentials filter</h4>
      <p>
        Default filter to use when getting the <a href="credentials.html?token={/envelope/token}">Credentials</a> page.
      </p>
      <h4>Filters filter</h4>
      <p>
        Default filter to use when getting the <a href="filters.html?token={/envelope/token}">Filters</a> page.
      </p>
      <h4>Notes filter</h4>
      <p>
        Default filter to use when getting the <a href="notes.html?token={/envelope/token}">Notes</a> page.
      </p>
      <h4>Overrides filter</h4>
      <p>
        Default filter to use when getting the <a href="overrides.html?token={/envelope/token}">Overrides</a> page.
      </p>

      <h4>Port Lists filter</h4>
      <p>
        Default filter to use when getting the <a href="port_lists.html?token={/envelope/token}">Port Lists</a> page.
      </p>
      <h4>Report Formats filter</h4>
      <p>
        Default filter to use when getting the <a href="report_formats.html?token={/envelope/token}">Report Formats</a> page.
      </p>
      <h4>Schedules filter</h4>
      <p>
        Default filter to use when getting the <a href="schedules.html?token={/envelope/token}">Schedules</a> page.
      </p>
      <h4>Tags filter</h4>
      <p>
        Default filter to use when getting the <a href="tags.html?token={/envelope/token}">Tags</a> page.
      </p>
      <h4>Targets filter</h4>
      <p>
        Default filter to use when getting the <a href="targets.html?token={/envelope/token}">Targets</a> page.
      </p>
      <h4>Tasks filter</h4>
      <p>
        Default filter to use when getting the <a href="tasks.html?token={/envelope/token}">Tasks</a> page.
      </p>
      <h4>CPEs filter</h4>
      <p>
        Default filter to use when getting the <a href="cpes.html?token={/envelope/token}">CPEs</a> page.
      </p>
      <h4>CVEs filter</h4>
      <p>
        Default filter to use when getting the <a href="cves.html?token={/envelope/token}">CVEs</a> page.
      </p>
      <h4>NVTs filter</h4>
      <p>
        Default filter to use when getting the <a href="nvts.html?token={/envelope/token}">NVTs</a> page.
      </p>
      <h4>OVAL filter</h4>
      <p>
        Default filter to use when getting the <a href="ovaldefs.html?token={/envelope/token}">OVAL Definitions</a> page.
      </p>
      <h4>CERT-Bund filter</h4>
      <p>
        Default filter to use when getting the <a href="cert_bund_advs.html?token={/envelope/token}">CERT-Bund Advisories</a> page.
      </p>
      <h4>DFN-CERT filter</h4>
      <p>
        Default filter to use when getting the <a href="dfn_cert_advs.html?token={/envelope/token}">DFN-CERT Advisories</a> page.
      </p>
      <h4>All SecInfo filter</h4>
      <p>
        Default filter to use when getting the <a href="allinfo.html?token={/envelope/token}">All SecInfo</a> page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_filter.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Filter'"/>
    <xsl:with-param name="type" select="'filter'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_FILTER'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#filter">Filter</a>
        the dialog offers these entries.
        Hit the button "Create Filter" to submit the new filter.
        The Filters page will be shown.
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
          <td>Single Targets</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>Targets with only one host</td>
        </tr>
        <tr class="odd">
          <td>Term</td>
          <td>--</td>
          <td>200</td>
          <td><a href="/help/powerfilter.html?token={/envelope/token}">Powerfilter</a></td>
          <td><tt>ips=1 first=1 rows=-2</tt></td>
        </tr>
        <tr class="even">
          <td>Type</td>
          <td>no</td>
          <td>--</td>
          <td>Type name</td>
          <td>target</td>
        </tr>
      </table>

      <h4>Filters</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Filters" title="Filters"/>
       will switch to the <a href="filters.html?token={/envelope/token}">Filters</a>
       page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_group.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Group'"/>
    <xsl:with-param name="type" select="'group'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_GROUP'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#group">Group</a>
        the dialog offers these entries.
        Hit the button "Create Group" to submit the new group.
        The Groups page will be shown.
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
          <td>Testing Team</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>All testers</td>
        </tr>
        <tr class="odd">
          <td>Users</td>
          <td>--</td>
          <td>1000</td>
          <td>Space or comma separated list of users</td>
          <td>alice bob</td>
        </tr>
      </table>

      <h4>Groups</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Groups" title="Groups"/>
       will switch to the <a href="groups.html?token={/envelope/token}">Groups</a>
       page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_host.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Host'"/>
    <xsl:with-param name="asset-type" select="'host'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_ASSET'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#host">Host</a>
        the dialog offers these entries.
        Hit the button "Create Host" to submit the new host.
        The Hosts page will be shown.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150"></td>
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
          <td>127.0.0.9</td>
        </tr>
      </table>

      <h4>Hosts</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Hosts" title="Hosts"/>
       will switch to the hosts page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_note.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Note'"/>
    <xsl:with-param name="type" select="'note'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_NOTE'"/>
      </xsl:call-template>

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
          <td>Severity</td>
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
        <tr class="even">
          <td>Text</td>
          <td>yes</td>
          <td>600</td>
          <td>Free form text</td>
          <td>This issue will go away when we switch to GNU/Hurd.</td>
        </tr>
      </table>

      <h4>Notes</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Notes" title="Notes"/>
       will switch to the notes page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_override.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Override'"/>
    <xsl:with-param name="type" select="'override'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_OVERRIDE'"/>
      </xsl:call-template>

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
          <td>NVT OID</td>
          <td>yes</td>
          <td>--</td>
          <td>OID</td>
          <td>1.3.6.1.4.1.25623.1.0.10263</td>
        </tr>
        <tr class="even">
          <td>Active</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button + Numeric (second radio option)</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Hosts</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button + Hosts List (second radio option)</td>
          <td>192.168.0.123</td>
        </tr>
        <tr class="even">
          <td>Port</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button + Port Name (second radio option)</td>
          <td>22/tcp</td>
        </tr>
        <tr class="odd">
          <td>Severity</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>New Severity</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button + Choice (second radio option) or severity (CVSS) score (third radio option)</td>
          <td>7.5</td>
        </tr>
        <tr class="odd">
          <td>Task</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button + Choice (second radio option)</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Result</td>
          <td>yes</td>
          <td>--</td>
          <td>Radio button + UUID (second radio option)</td>
          <td>bb062bc9-4a61-45c2-af26-135e74be2f66</td>
        </tr>
        <tr class="odd">
          <td>Text</td>
          <td>yes</td>
          <td>600</td>
          <td>Free form text</td>
          <td>This issue will go away when we switch to GNU/Hurd.</td>
        </tr>
      </table>

      <h4>Overrides</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Overrides" title="Overrides"/>
       will switch to the overrides page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_role.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Role'"/>
    <xsl:with-param name="type" select="'role'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_ROLE'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#role">Role</a>
        the dialog offers these entries.
        Hit the button "Create Role" to submit the new role.
        The Roles page will be shown.
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
          <td>Testing Team</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>All testers</td>
        </tr>
        <tr class="odd">
          <td>Users</td>
          <td>--</td>
          <td>1000</td>
          <td>Space or comma separated list of users</td>
          <td>alice bob</td>
        </tr>
      </table>

      <h4>Roles</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Roles" title="Roles"/>
       will switch to the <a href="roles.html?token={/envelope/token}">Roles</a>
       page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_scanner.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Scanner'"/>
    <xsl:with-param name="type" select="'scanner'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_SCANNER'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#scanner">Scanner</a>
        the dialog offers these entries.
        Hit the button "Create Scanner" to submit the new scanner.
        The Scanners page will be shown.
      </p>
      <p>
        CA Certificate: The CA certificate with which, the certificate presented
        by the Scanner was signed. It is used by the Manager to verify the
        authenticity of the remote host.
      </p>
      <p>
        Certificate: The Certificate that will be used to authenticate with the
        Scanner. It should be signed by the CA Certificate, so that the Scanner
        can verify that the Manager's connection is an authorized client connection.
      </p>
      <p>
        Private Key: The private key matching the Certificate that will be used
        to authenticate with the Scanner.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150"></td>
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
          <td>OSP w3af Scanner</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>Scanner object for OSP w3af scanner</td>
        </tr>
        <tr class="odd">
          <td>Host</td>
          <td>Yes</td>
          <td>80</td>
          <td>Alphanumeric</td>
          <td>192.168.3.200</td>
        </tr>
        <tr class="even">
          <td>Port</td>
          <td>Yes</td>
          <td>80</td>
          <td>Integer</td>
          <td>1234</td>
        </tr>
        <tr class="odd">
          <td>Type</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td>OSP Scanner</td>
        </tr>
        <tr class="even">
          <td>CA Certificate</td>
          <td>yes</td>
          <td>--</td>
          <td>File</td>
          <td>/usr/var/lib/openvas/CA/cacert.pem</td>
        </tr>
        <tr class="odd">
          <td>Certificate</td>
          <td>yes</td>
          <td>--</td>
          <td>File</td>
          <td>/usr/var/lib/openvas/CA/clientcert.pem</td>
        </tr>
        <tr class="even">
          <td>Private Key</td>
          <td>yes</td>
          <td>--</td>
          <td>File</td>
          <td>/usr/var/lib/openvas/private/CA/clientkey.pem</td>
        </tr>
      </table>

      <h4>Scanners</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Scanners" title="Scanners"/>
       will switch to the scanners page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_tag.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Tag'"/>
    <xsl:with-param name="type" select="'tag'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_TAG'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#tag">Tag</a>
        the dialog offers these entries.
        Hit the button "Create Tag" to submit the new tag.
        The Tags page will be shown.
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
          <td>Alphanumeric and -_,: \./</td>
          <td>geo:long</td>
        </tr>
        <tr class="even">
          <td>Value</td>
          <td>no</td>
          <td>200</td>
          <td>Alphanumeric and -_, \./</td>
          <td>50.231</td>
        </tr>
        <tr class="odd">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric and -_;'äüöÄÜÖß, \./</td>
          <td>Longitude of the target</td>
        </tr>
        <tr class="even">
          <td>Attach to Type</td>
          <td>--</td>
          <td>--</td>
          <td>Any resource type</td>
          <td>Target</td>
        </tr>
        <tr class="odd">
          <td>Attach to ID</td>
          <td>no</td>
          <td>--</td>
          <td>Either empty or a valid ID of an existing resource</td>
          <td>12508a75-e1f9-4acd-85b9-d1f3ea48db37</td>
        </tr>
        <tr class="even">
          <td>Active</td>
          <td>--</td>
          <td>--</td>
          <td>Yes or No.</td>
          <td>Yes</td>
        </tr>
      </table>

      <h4>Tags</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Tags" title="Tags"/>
       will switch to the tags page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_target.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New/Edit Target Dialog'"/>
    <xsl:with-param name="type" select="'target'"/>
  </xsl:call-template>

    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    | <a href="/help/targets.html?token={/envelope/token}">Targets</a>
    | <a href="target_details.html?token={/envelope/token}">Target Details</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_TARGET'"/>
      </xsl:call-template>

      <p>
        For creating a new or editing a existing
        <a href="glossary.html?token={/envelope/token}#target">Target</a>
        the dialog offers these entries.
        Hit the button "Create"/"New" to submit your changes.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150"></td>
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
          <td>Hosts: Manual</td>
          <td>--</td>
          <td>200</td>
          <td>Comma separated list of IPs and/or hostnames.</td>
          <td><tt>192.168.1.23,192.168.1.2/31, webserv1.mycompany.tld</tt></td>
        </tr>
        <tr class="odd">
          <td>Hosts: From file</td>
          <td>--</td>
          <td>--</td>
          <td>
            File containing comma separated list of IPs and/or hostnames,
            optionally over multiple lines.
          </td>
          <td><tt>192.168.1.23,192.168.1.2/31, webserv1.mycompany.tld</tt></td>
        </tr>
        <tr class="even">
          <td>Hosts: From host assets</td>
          <td>--</td>
          <td>--</td>
          <td>
            Use a selection of Hosts from the Asset Management.
            (Only available if dialog was opened from the
            <a href="/help/hosts.html?token={/envelope/token}">Hosts</a>
            list page)
          </td>
          <td>--</td>
        </tr>
        <tr class="odd">
          <td>Exclude Hosts</td>
          <td>--</td>
          <td>200</td>
          <td>Same as Hosts.</td>
          <td><tt>192.168.1.23, 192.168.1.125, webbackup.mycompany.tld</tt></td>
        </tr>
        <tr class="even">
          <td>Reverse Lookup Only</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td>Yes (Scan only hosts that reverse-lookup.)</td>
        </tr>
        <tr class="odd">
          <td>Reverse Lookup Unify</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td>Yes (Deduplicate hosts based on reverse-lookup value.)</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>Covers both of our web staging systems</td>
        </tr>
        <tr class="odd">
          <td>
            Port List
            <xsl:if test="not (gsa:may-op ('get_port_lists'))">*</xsl:if>
          </td>
          <td>yes</td>
          <td>--</td>
          <td>Any of the <a href="port_lists.html?token={/envelope/token}">configured port lists</a>.</td>
          <td>All privileged TCP</td>
        </tr>
        <tr class="even">
          <td>
            SSH Credential
            <xsl:if test="not (gsa:may-op ('get_credentials'))">*</xsl:if>
          </td>
          <td>no</td>
          <td>--</td>
          <td>Any of the <a href="credentials.html?token={/envelope/token}">configured credentials</a>.</td>
          <td>Security Scan Account for SSH</td>
        </tr>
        <tr class="odd">
          <td>
            SSH Port
            <xsl:if test="not (gsa:may-op ('get_credentials'))">*</xsl:if>
          </td>
          <td>no</td>
          <td>400</td>
          <td>A port number.</td>
          <td>22</td>
        </tr>
        <tr class="even">
          <td>
            SMB Credential
            <xsl:if test="not (gsa:may-op ('get_credentials'))">*</xsl:if>
          </td>
          <td>no</td>
          <td>--</td>
          <td>Any of the <a href="credentials.html?token={/envelope/token}">configured credentials</a>.</td>
          <td>Security Scan Account for SMB</td>
        </tr>
        <tr class="odd">
          <td>
            ESXi Credential
            <xsl:if test="not (gsa:may-op ('get_credentials'))">*</xsl:if>
          </td>
          <td>no</td>
          <td>--</td>
          <td>Any of the <a href="credentials.html?token={/envelope/token}">configured credentials</a>.</td>
          <td>Security Scan Account for ESXi</td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_port_lists')) or not (gsa:may-op ('get_credentials'))">
        <b>*</b> not available with the current OMP Server connection.
      </xsl:if>

      <xsl:call-template name="hosts_note"/>

    </div>
</xsl:template>

<xsl:template mode="help" match="new_task.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New Task'"/>
    <xsl:with-param name="type" select="'task'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_TASK'"/>
      </xsl:call-template>

      <p>
       To create a
       <a href="glossary.html?token={/envelope/token}#task">task</a>,
       this dialog offers the following entries.
       Hit the button "Create Task" to create the new task.
       The list of tasks will be shown.
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
          <td>Rome</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Scan Targets</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td>Localhost</td>
        </tr>
        <tr class="even">
          <td>
            Alerts
            <xsl:if test="not (gsa:may-op ('get_alerts'))">*</xsl:if>
          </td>
          <td>no</td>
          <td>---</td>
          <td>Choice</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>
            Schedule
            <xsl:if test="not (gsa:may-op ('get_schedules'))">*</xsl:if>
          </td>
          <td>no</td>
          <td>---</td>
          <td>Choice</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Add results to Assets </td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Alterable Task</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>OpenVAS Scanner</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Scan Config</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td>Full and fast</td>
        </tr>
        <tr class="odd">
          <td>Network Source Interface</td>
          <td>no</td>
          <td>---</td>
          <td>Alphanumeric</td>
          <td>eth1</td>
        </tr>
        <tr class="even">
          <td>Order for target hosts</td>
          <td>no</td>
          <td>---</td>
          <td>Choice</td>
          <td>Sequential</td>
        </tr>
        <tr class="odd">
          <td>Maximum concurrently executed NVTs per host</td>
          <td>no</td>
          <td>10</td>
          <td>Numeric</td>
          <td>2</td>
        </tr>
        <tr class="even">
          <td>Maximum concurrently scanned hosts</td>
          <td>no</td>
          <td>10</td>
          <td>Numeric</td>
          <td>10</td>
        </tr>
        <tr class="odd">
          <td>Scanner: OSP Scanner</td>
          <td>yes</td>
          <td>---</td>
          <td>Choice</td>
          <td></td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_alerts')) or not (gsa:may-op ('get_schedules')) or not (gsa:may-op ('get_scanners')) or not (gsa:may-op ('get_groups'))">
        <b>*</b> not available with the current OMP Server connection.
      </xsl:if>

      <xsl:if test="gsa:may-op ('get_tags') and gsa:may-op ('create_tag')">
        <h2>Tag</h2>
        <p>
          To automatically add a
          <a href="glossary.html?token={/envelope/token}#tg">Tag</a>
          after creating the task, check "Add Tag" checkbox and select the
          name of the tag from the dropdown box. Optionally, you can also
          add a value to the tag in the "with Value" text field.
        </p>
      </xsl:if>

      <h1>New Container Task</h1>

      <p>
       To create a
       <a href="glossary.html?token={/envelope/token}#task">container task</a>,
       this dialog offers the following entries.
       Hit the button "Create Task" to create the new task.
       The list of tasks will be shown.
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
          <td>Rome</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Report</td>
          <td>yes</td>
          <td>--</td>
          <td>File</td>
          <td>/tmp/report.xml</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_user.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'New User'"/>
    <xsl:with-param name="type" select="'user'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'CREATE_USER'"/>
      </xsl:call-template>

      <p>
        For creating a new
        <a href="glossary.html?token={/envelope/token}#user">User</a>
        the dialog offers these entries.
        Hit the button "Create User" to submit the new user.
        The Users page will be shown.
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
          <td>Testing Team</td>
        </tr>
        <tr class="even">
          <td>Comment</td>
          <td>no</td>
          <td>400</td>
          <td>Alphanumeric</td>
          <td>All testers</td>
        </tr>
        <tr class="odd">
          <td>Users</td>
          <td>--</td>
          <td>1000</td>
          <td>Space or comma separated list of users</td>
          <td>alice bob</td>
        </tr>
      </table>

      <h4>Users</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Users" title="Users"/>
       will switch to the <a href="users.html?token={/envelope/token}">Users</a>
       page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="note_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Note Details'"/>
    <xsl:with-param name="type" select="'note'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_NOTES'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#note">Note</a>.
        This includes the NVT, creation time, modification time,
        all constraints on the note and the full text of the note.
      </p>
      <p>
       Clicking on the NVT name will go to the NVT Details page.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'note'"/>
        <xsl:with-param name="name" select="'Note'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="notes.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Notes'"/>
    <xsl:with-param name="type" select="'note'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_NOTES'"/>
      </xsl:call-template>

      <a name="notes"></a>
      <p>
       This table provides an overview of all
       <a href="glossary.html?token={/envelope/token}#note">notes</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>
            The name of the NVT to which the note applies.  The name is truncated if
            it is too long for the column.
            <br/>
            <div>
              The right hand side of this column may contain an icon:
              <table style="margin-left: 10px">
                <tr>
                  <td valign="top">
                    <img src="/img/view_other.svg"
                      class="icon icon-sm"
                         border="0"
                         alt="Note owned by Sally"
                         title="Note owned by Sally"/>
                  </td>
                  <td>
                    The note is owned by another user.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td>Text</td>
          <td>An excerpt from the beginning of the text of the note.  If the note has
              been orphaned because the task it applies to was removed, then "Orphan"
              appears above the excerpt, in bold.
          </td>
        </tr>
      </table>

      <h3>New Note</h3>
      <p>
        To create a new note click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Note" title="New Note"/> which
        goes to the <a href="new_note.html?token={/envelope/token}">New Note</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of notes as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Note'"/>
      </xsl:call-template>

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

<xsl:template mode="help" match="performance.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Performance'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_system_reports&amp;duration=86400&amp;slave_id=0&amp;token={/envelope/token}">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_SYSTEM_REPORTS'"/>
      </xsl:call-template>

      <a name="performance"></a>
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

<xsl:template mode="help" match="reports.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Reports'"/>
    <xsl:with-param name="type" select="'report'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_REPORTS'"/>
      </xsl:call-template>

      <a name="reports"></a>
      <p>
       This table provides an overview of all configured
       <a href="glossary.html?token={/envelope/token}#report">reports</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150px">Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Date</td>
          <td>
            Shows the date the report was created.
          </td>
        </tr>
        <tr class="even">
          <td>Status</td>
          <td>The status of a report is one of these:
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Running">
                    <div class="progressbar_bar" style="width:42px;"></div>
                    <div class="progressbar_text">42 %</div>
                   </div>
                </td>
                <td>
                  An active scan for this report is running and has completed 42%.
                  The percentage refers
                  to the number of hosts multiplied with the number of NVTs. Thus,
                  it may not correspond perfectly with the duration of the scan.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Requested">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Requested</div>
                  </div>
                </td>
                <td>
                  This task has just been started and prepares to delegate the scan
                  to the scan engine.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Delete Requested">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Delete Requested</div>
                  </div>
                </td>
                <td>
                  The user has recently deleted the task. Currently the manager
                  server cleans up the database which might take some time because
                  any reports associated with this task will be removed as well.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Stop Requested">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Stop Requested</div>
                  </div>
                </td>
                <td>
                  The user has recently stopped the scan. Currently the manager
                  server has submitted this command to the scanner, but the scanner
                  has not yet cleanly stopped the scan.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Stopped">
                    <div class="progressbar_bar_request" style="width:15px;"></div>
                    <div class="progressbar_text">
                      Stopped at <xsl:value-of select="15"/> %
                    </div>
                  </div>
                </td>
                <td>
                  The scan was stopped by the user.  The scan was
                  15% complete when it stopped.  Also, this status is set in cases
                  where the scan was stopped due to other arbitrary circumstances
                  such as power outage.  The report will remain stopped even if the
                  scanner or manager server is restarted, for example on reboot.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Internal Error">
                    <div class="progressbar_bar_error" style="width:100px;"></div>
                    <div class="progressbar_text">Internal Error</div>
                  </div>
                </td>
                <td>
                  The scan resulted in an error.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Done">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Done</div>
                  </div>
                </td>
                <td>
                  The report returned successfully from a scan and produced a report. The
                  report is complete with regard to targets and scan configuration
                  of the report.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Container">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Container</div>
                  </div>
                </td>
                <td>
                  The report is part of a container task.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Task</td>
          <td>The report's task.</td>
        </tr>
        <tr class="even">
          <td>Severity</td>
          <td>
            Severity of the report. The bar will be colored
            according to the severity level defined by the current
            <a href="/help/my_settings.html?token={/envelope/token}#severity_class">Severity Class</a>:
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'8.0'"/>
                    <xsl:with-param name="extra_text" select="' (High)'"/>
                    <xsl:with-param name="title" select="'High'"/>
                  </xsl:call-template>
                </td>
                <td>
                  A red bar is shown if the maximum severity is in the
                  'High' range.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'5.0'"/>
                    <xsl:with-param name="extra_text" select="' (Medium)'"/>
                    <xsl:with-param name="title" select="'Medium'"/>
                  </xsl:call-template>
                </td>
                <td>
                  A yellow bar is shown if the maximum severity is in the
                  'Medium' range.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'2.0'"/>
                    <xsl:with-param name="extra_text" select="' (Low)'"/>
                    <xsl:with-param name="title" select="'Low'"/>
                  </xsl:call-template>
                </td>
                <td>
                  A blue bar is shown if the maximum severity is in the
                  'Low' range.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'0.0'"/>
                    <xsl:with-param name="extra_text" select="' (None)'"/>
                    <xsl:with-param name="title" select="'None'"/>
                  </xsl:call-template>
                </td>
                <td>
                  An empty bar is shown if no vulnerabilities were detected.
                  Perhaps some NVT created a log information, so the report
                  is not necessarily empty.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Scan Results: High</td>
          <td>The number of High results.</td>
        </tr>
        <tr class="even">
          <td>Scan Results: Medium</td>
          <td>The number of Medium results.</td>
        </tr>
        <tr class="odd">
          <td>Scan Results: Low</td>
          <td>The number of Low results.</td>
        </tr>
        <tr class="even">
          <td>Scan Results: Log</td>
          <td>The number of Log results.</td>
        </tr>
        <tr class="odd">
          <td>Scan Results: False Pos.</td>
          <td>The number of False Positive results.</td>
        </tr>
      </table>

      <xsl:call-template name="filtering"/>

      <xsl:call-template name="sorting"/>

      <a name="overrides"></a>
      <h3>Overrides</h3>
      <p>
        By default the configured <a href="glossary.html?token={/envelope/token}#override">overrides</a> are applied.
      </p>
      <p>
        The overrides icon
        indicates whether overrides are applied
        <img src="/img/overrides_enabled.svg" class="icon icon-sm" alt="Overrides are Applied" title="Overrides are Applied"/>
        or not
        <img src="/img/overrides_disabled.svg" class="icon icon-sm" alt="No Overrides" title="No Overrides"/>.
        Clicking the icon toggles overrides.
        In the table view, severity classes, severity numbers and trend might change
        when switching this selection.
      </p>
      <p>
        Note that leaving this page will reset the overrides selection to apply overrides.
      </p>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delta</h4>
      <p>
        Pressing the delta icon
        <img src="/img/delta.svg" class="icon icon-sm" alt="Compare" title="Compare"/> will
        select the report for comparison.
      </p>

      <p>
        Once a report is selected for comparison, the greyed out delta icon
        <img src="/img/delta_inactive.svg" class="icon icon-sm" border="0" alt="Compare"/>
        indicates that the report has been selected.
      </p>

      <p>
        Pressing the second delta icon
        <img src="/img/delta_second.svg" class="icon icon-sm" alt="Compare" title="Compare"/> will
        produce a comparison between the report and the previously selected one.
      </p>

      <p>
        The delta icon is only available when the filtering specifies a single
        task.  For multiple tasks the greyed out delta icon is shown.
      </p>

      <h4>Delete Report</h4>
      <p>
        Pressing the delete icon <img src="/img/delete.svg" alt="Delete" title="Delete"/> will
        remove the report immediately. The list of reports will be updated.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template name="solution-types">
  <p>
    <b><img src="/img/st_workaround.svg" class="icon icon-sm"/> Workaround:</b> Information is available about a configuration or specific deployment scenario that can be used to avoid exposure to the vulnerability. There may be none, one, or more workarounds available. This is typically the “first line of defense” against a new vulnerability before a mitigation or vendor fix has been issued or even discovered.
  </p>
  <p>
    <b><img src="/img/st_mitigate.svg" class="icon icon-sm"/> Mitigation:</b> Information is available about a configuration or deployment scenario that helps to reduce the risk of the vulnerability but that does not resolve the vulnerability on the affected product. Mitigations may include using devices or access controls external to the affected product. Mitigations may or may not be issued by the original author of the affected product, and they may or may not be officially sanctioned by the document producer.
  </p>
  <p>
    <b><img src="/img/st_vendorfix.svg" class="icon icon-sm"/> VendorFix:</b> Information is available about an official fix that is issued by the original author of the affected product. Unless otherwise noted, it is assumed that this fix fully resolves the vulnerability.
  </p>
  <p>
    <b><img src="/img/st_nonavailable.svg" class="icon icon-sm"/> NoneAvailable:</b> Currently there is no fix available. Information should contain details about why there is no fix.
  </p>
  <p>
    <b><img src="/img/st_willnotfix.svg" class="icon icon-sm"/> WillNotFix:</b> There is no fix for the vulnerability and there never will be one. This is often the case when a product has been orphaned, end-of-lifed, or otherwise deprecated. Information should contain details about why there will be no fix issued.
  </p>
</xsl:template>

<xsl:template mode="help" match="results.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Results'"/>
    <xsl:with-param name="type" select="'result'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_REPORTS'"/>
      </xsl:call-template>

      <a name="results"></a>
      <p>
       This table provides an overview of all
       <a href="glossary.html?token={/envelope/token}#result">result</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150px">Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Vulnerability</td>
          <td>
            The name of the NVT that generated the result.
            Clicking on it will go to the
            <a href="result_details.html?token={/envelope/token}">Result Details</a>
            page.
          </td>
        </tr>
        <tr class="even">
          <td>Solution Type (<img src="/img/solution_type.svg" class="icon icon-sm" alt="Solution type" title="Solution type"/>)</td>
          <td>
            The type of solution available for the vulnerability.<br/><br/>
            <xsl:call-template name="solution-types"/>
          </td>
        </tr>
        <tr class="odd">
          <td>Severity</td>
          <td>
            The CVSS severity rating of the result.
          </td>
        </tr>
        <tr class="even">
          <td>QoD</td>
          <td>
            The quality of detection (QoD) percentage of the result.
            See the
            <a href="qod.html?token={/envelope/token}">QoD help page</a>
            for more information.
          </td>
        </tr>
        <tr class="odd">
          <td>Host</td>
          <td>
            The IP address of the host the result applies to.
          </td>
        </tr>
        <tr class="even">
          <td>Port</td>
          <td>
            The port the result applies to.
          </td>
        </tr>
        <tr class="odd">
          <td>Created</td>
          <td>
            The date the result was created.
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="overrides"></a>
      <h3>Overrides</h3>
      <p>
        By default the configured <a href="glossary.html?token={/envelope/token}#override">overrides</a> are applied.
      </p>
      <p>
        The overrides icon
        indicates whether overrides are applied
        <img src="/img/overrides_enabled.svg" class="icon icon-sm" alt="Overrides are Applied" title="Overrides are Applied"/>
        or not
        <img src="/img/overrides_disabled.svg" class="icon icon-sm" alt="No Overrides" title="No Overrides"/>.
        Clicking the icon toggles overrides.
        In the table view, severity classes, severity numbers and trend might change
        when switching this selection.
      </p>
      <p>
        Note that leaving this page will reset the overrides selection to apply overrides.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="standard_actions.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Standard Actions'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <p>
        This table summarizes various standard actions that are applicable to most resources.
        Examples for resource types are Target, Task and Schedule.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Icon</td>
          <td>Description</td>
        </tr>
        <tr class="even">
          <td><img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/></td>
          <td>Export (download) the resource in XML format.</td>
        </tr>
        <tr class="odd">
          <td><img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/></td>
          <td>Remove the resource entirely from the system, immediately.<br/>
              The icon will be greyed out <img src="/img/delete_inactive.svg" class="icon icon-sm" alt="Delete" title="Delete"/>
              when some other resource depends on the resource.
          </td>
        </tr>
        <tr class="even">
          <td><img src="/img/new.svg" class="icon icon-sm" alt="New Resource" title="New Resource"/></td>
          <td>Open a dialog for creating a new resource.</td>
        </tr>
        <tr class="odd">
          <td><img src="/img/trashcan.svg" class="icon icon-sm" alt="Move to Trashcan" title="To Trashcan"/></td>
          <td>
            The resource will be moved to the <a href="trashcan.html?token={/envelope/token}">trashcan</a>.<br/>
            Note that if this resource is associated with at least one other
            resource, it is not possible to move it. In this case the button is greyed out
            <img src="/img/trashcan_inactive.svg" class="icon icon-sm" alt="Move to Trashcan" title="To Trashcan"/>.
          </td>
        </tr>
        <tr class="even">
          <td><img src="/img/edit.svg" class="icon icon-sm" alt="Edit Resource" title="Edit Resource"/></td>
          <td>Open a dialog for editing the properties of the resource.</td>
        </tr>
        <tr class="odd">
          <td><img src="/img/clone.svg" class="icon icon-sm" alt="Clone Resource" title="Clone Resource"/></td>
          <td>Create a duplicate of the resource.</td>
        </tr>
        <tr class="even">
          <td><img src="/img/list.svg" class="icon icon-sm" alt="Resource Table View" title="Resource Table View"/></td>
          <td>Switch to the table view for this resource type.</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="trashcan.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Trashcan'"/>
  </xsl:call-template>

  <div class="selection-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_trash&amp;token={/envelope/token}">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>
      <p>
        This page lists all resources that are currently in the trashcan.
        The listing is grouped by resource type.
        There is a summary table at the top of the page with item counts
        and links into the groups.
      </p>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delete</h4>
      <p>
       Pressing the delete icon <img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/> will
       remove the resource entirely from the system, immediately.  The
       trashcan will be updated.  The icon will be greyed out
       <img src="/img/delete_inactive.svg" class="icon icon-sm" alt="Delete" title="Delete"/>
       when some other resource in the trashcan depends on the resource.
      </p>

      <h4>Restore</h4>
      <p>
       Pressing the restore icon
       <img src="/img/restore.svg" class="icon icon-sm" alt="Restore" title="Restore"/>
       will move the resource out of the trashcan and back into normal
       operation.  The trashcan will be updated.  The icon will be greyed out
       <img src="/img/restore_inactive.svg" class="icon icon-sm" alt="Restore" title="Restore"/>
       when the resource depends on some other resource that
       is in the trashcan.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cvss_calculator.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'CVSS Calculator'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <a name="cvss_calculator"></a>
      <p>
        This page provides an easy to use
        <a href="glossary.html?token={/envelope/token}#cvss">CVSS</a>
        Base Score Calculator.
      </p>
      <h3>From Metrics</h3>
      <p>
        The CVSS Base Metrics values could be selected from the drop-down menus.
        <ul>
          <li>
            <b>Access Vector:</b> Defines how a vulnerability may be exploited.
          </li>
          <li>
            <b>Access Complexity:</b> Defines how hard it is the exploit the vulnerability.
          </li>
          <li>
            <b>Authentication:</b> Defines how many times an attacker needs to authenticate before exploiting the vulnerability.
          </li>
          <li>
            <b>Confidentiality:</b> Defines the impact on the confidentiality of the data on or processed by the system.
          </li>
          <li>
            <b>Integrity:</b> Defines the impact on the integrity of the exploited system.
          </li>
          <li>
            <b>Availability:</b> Defines the impact on the availability of the system.
          </li>
        </ul>
      </p>
      <h3>From Vector</h3>
      <p>
        Insert the Base Vector (eg: <a href="/omp?cmd=cvss_calculator&amp;cvss_vector=AV:N/AC:M/Au:S/C:P/I:P/A:C&amp;token={/envelope/token}">AV:N/AC:M/Au:S/C:P/I:P/A:C</a>)
        in the input box, and hit the "Calculate" button to calculate the CVSS
        Base Score directly from a Base Vector.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="os_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Operating System Details'"/>
    <xsl:with-param name="asset-type" select="'os'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_ASSETS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about an Operating System.
        This includes the name, title, severity, hosts and the last update time of
        the Operating System.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'operating system'"/>
        <xsl:with-param name="name" select="'Operating System'"/>
        <xsl:with-param name="new" select="false ()"/>
        <xsl:with-param name="clone" select="false ()"/>
        <xsl:with-param name="edit" select="false ()"/>
        <xsl:with-param name="ultimate" select="true ()"/>
      </xsl:call-template>

      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Operating System'"/>
        <xsl:with-param name="used_by" select="'Host'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="oss.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Operating Systems'"/>
    <xsl:with-param name="asset-type" select="'os'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_ASSETS'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all the Operating Systems
        found in the
        <a href="glossary.html?token={/envelope/token}#asset">asset</a>
        database.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'OS'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Title</td>
          <td>
            The title of the operating system
          </td>
        </tr>
        <tr class="odd">
          <td>Severity: Latest</td>
          <td>
            The severity of the host that was scanned most recently, where the host is
            running this operating system.
          </td>
        </tr>
        <tr class="even">
          <td>Severity: Average</td>
          <td>
            The average of the most recent severities of the all the hosts in the
            asset database that are running this operating system.
          </td>
        </tr>
        <tr class="odd">
          <td>Hosts</td>
          <td>
            The number of hosts running this Operating System.
          </td>
        </tr>
        <tr class="even">
          <td>Updated</td>
          <td>
            The time the asset was last updated.
          </td>
        </tr>
      </table>

      <h3>Exporting</h3>
      <p>
        Export the current list of operating systems as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Operating System'"/>
        <xsl:with-param name="noclone" select="1"/>
        <xsl:with-param name="noedit" select="1"/>
        <xsl:with-param name="notrashcan" select="1"/>
      </xsl:call-template>

      <h4>Delete Operating System</h4>
      <p>
        Pressing the delete icon <img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/> will
        remove the operating system immediately.
        The list of operating systems will be updated.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="override_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Override Details'"/>
    <xsl:with-param name="asset-type" select="'override'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_OVERRIDES'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#override">Override</a>.
        This includes the NVT, creation time, modification time,
        all constraints on the override and the full text of the override.
      </p>
      <p>
       Clicking on the NVT name will go to the NVT Details page.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'override'"/>
        <xsl:with-param name="name" select="'Override'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="overrides.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Overrides'"/>
    <xsl:with-param name="type" select="'override'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_OVERRIDES'"/>
      </xsl:call-template>

      <a name="overrides"></a>
      <p>
       This table provides an overview of all
       <a href="glossary.html?token={/envelope/token}#override">overrides</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>
            The name of the NVT to which the override applies.  The name is truncated if
            it is too long for the column.
            <br/>
            <div>
              The right hand side of this column may contain an icon:
              <table style="margin-left: 10px">
                <tr>
                  <td valign="top">
                    <img src="/img/view_other.svg"
                         border="0"
                         class="icon icon-sm"
                         alt="Override owned by Sally"
                         title="Override owned by Sally"/>
                  </td>
                  <td>
                    The override is owned by another user.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr class="even">
          <td>From</td>
          <td>The original severity level for which this override applies.</td>
        </tr>
        <tr class="odd">
          <td>To</td>
          <td>The new severity that is assigned to the report item if the override
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

      <h3>New Override</h3>
      <p>
        To create a new override click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Override" title="New Override"/> which
        goes to the <a href="new_override.html?token={/envelope/token}">New Override</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of overrides as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Override'"/>
      </xsl:call-template>

      <a name="editoverride"></a>
      <h2>Edit Override</h2>
      <p>
       A page for modifying a override.  The fields are like those on the
       <a href="#newoverride">New Override</a> page.
      </p>
      <p>
       Hit the button "Save Override" to submit the modification.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="filtering.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Filtering Actions'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="filtering"/>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="powerfilter.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Powerfilter'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>
      <p>
        A powerfilter describes how to reduce a list
        of items to a smaller list.  This filtering is
        similar to the search term given to a search engine.
      </p>
      <p>
        The default powerfilter is usually "rows=10 first=1 sort=name", which
        means to include at most ten items, starting at the first item and
        sorting by column "Name".
      </p>

      <a name="examples"></a>
      <h3>Examples</h3>
      <ul>
        <li>
          127.0.0.1
          <ul>
            <li>
              Include any item that has "127.0.0.1" anywhere in the text of
              any non-numeric column.  This matches 127.0.0.1 and 127.0.0.13, for
              example.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          127.0.0.1 IANA
          <ul>
            <li>
              Include any item that has "127.0.0.1" or "IANA" anywhere in the
              text of any non-numeric column.  This will match targets that have the port
              list "All IANA assigned TCP 2012-02-10", for example.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          127.0.0.1 and IANA
          <ul>
            <li>
              Include any item that has "127.0.0.1" anywhere in the
              text of any non-numeric column, and "IANA" anywhere in the text of any
              non-numeric column.  This will match targets that have the port
              list "All IANA assigned TCP 2012-02-10" that scan host 127.0.0.1,
              for example.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          "Darling Street Headquarters"
          <ul>
            <li>
              Include any item that has the phrase "Darling Street Headquarters"
              anywhere in the text of any non-numeric column.  This will match targets that
              have this phrase in the comment, for example.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          regexp 10.128.[0-9]+.[0-9]+
          <ul>
            <li>
              Include any item that has an IP style string starting "10.128."
              anywhere in the text of any non-numeric column.  This matches 10.128.84.1
              and 10.128.98.2, for example.  This is how to filter with a
              regular expression.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name=Localhost
          <ul>
            <li>
              Include any item that has the exact name "Localhost".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name~local
          <ul>
            <li>
              Include any item that has "local" anywhere in the name.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name:^Local
          <ul>
            <li>
              Include any item who's name starts with "Local".  This is how to
              filter by column with a regular expression.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          port_list~TCP
          <ul>
            <li>
              Include any item that has "TCP" anywhere in the port list name.  This
              shows how to reference a column that has a space in the name: convert
              the space to an underscore.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          modified&gt;2012-05-03 and modified&lt;2012-05-05
          <ul>
            <li>
              Include any item that was modified between 2012-05-03 0h00
              and 2012-05-05 0h00.  This filter covers a range of two complete
              days, the third and fourth of May.
              The timezone used is the current timezone of the user.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          created&gt;2012-05-03T13h00
          <ul>
            <li>
              Include any item that was created after 13h00 on 2012-05-03.  This
              example shows the long date format, which includes hours and
              minutes.
              The timezone used is the current timezone of the user.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          rows=20 first=1 sort=name
          <ul>
            <li>
              Include the first twenty items, sorting by column "Name".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          created&gt;-7d
          <ul>
            <li>
              Include any item that was created within the past seven days.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          title=
          <ul>
            <li>
              Include any item where the column "Title" is empty or not
              available.  When a value is not available the column contains
              "N/A".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          =127.0.0.1
          <ul>
            <li>
              Include any item that has "127.0.0.1" as the exact text of
              any non-numeric column.  This matches 127.0.0.1 but not 127.0.0.13, for
              example.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          tag="geo:long=52.2788"
          <ul>
            <li>
              Include any item that has a tag named "geo:long" with the
              value "52.2788".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          tag~geo
          <ul>
            <li>
              Include any item that has a tag with a name containing "geo".
            </li>
          </ul>
        </li>
      </ul>

      <a name="syntax"></a>
      <h3>Syntax</h3>
      <p>
        A powerfilter consists of any number of whitespace separated keywords.
        Whole keywords are case-folded, so "aBc" works the same as "AbC".
      </p>
      <p>
        Phrases can be quoted with double quotes "like this" to include
        spaces in the keywords.
      </p>

      <h4>Column Keywords</h4>
      <p>
        A keyword can also be
        prefixed with a column using one of the special characters:
        <ul style="list-style: none;">
          <li><b style="margin-right: 10px"><code>=</code></b> equals</li>
          <li><b style="margin-right: 10px"><code>~</code></b> contains</li>
          <li><b style="margin-right: 10px"><code>&lt;</code></b> is less than</li>
          <li><b style="margin-right: 10px"><code>&gt;</code></b> is greater than</li>
          <li><b style="margin-right: 10px"><code>:</code></b> matches the regular expression</li>
        </ul>
        For example "name=Localhost".  In the case of the = and :
        relations the keyword is case sensitive; for other relations the keyword
        is case insensitive as usual.
      </p>
      <p>
        To search for one of the special characters, enclose the term in
        double quotes.
      </p>
      <p>
        In general the column prefix is the name of the column in lowercase,
        with spaces converted to underscores.  So port_list="OpenVAS Default"
        filters by the column "Port List".
      </p>
      <p>
        Some extra fields can be used instead of a column name on most pages:
        <ul>
          <li>uuid -- UUID of item</li>
          <li>comment -- the comment on the item, often displayed in the name column</li>
          <li>modified -- date and time item was last modified</li>
          <li>created -- date and time item was created.</li>
        </ul>
      </p>
      <p>
        The value of a column keyword may be empty, like "name=".  This matches
        empty and not available entries.  When a value is not available the
        column contains "N/A".
      </p>
      <p>
        Note that for performance reasons, using a column keyword is the only
        way to search numeric columns.  For example, to search the "IPs" column
        in the Targets list, use "ips=123".  A general keyword like "123" will
        not consider this column, because it is numeric.
      </p>

      <h4>Special Keywords</h4>
      <p>
        The keyword "<b>and</b>" requires that the
        keywords on either side of it are both present.  The special keyword
        "<b>or</b>" has similar behaviour, but is redundant, since terms are
        normally OR'd.
      </p>
      <p>
        The keyword "<b>not</b>" inverts the sense of the following keyword.
      </p>
      <p>
        The keyword "<b>regexp</b>" makes the following keyword a regular
        expression.  The keyword "<b>re</b>" is shorthand for "regexp".
      </p>
      <p>
        The column keyword "<b>rows</b>" determines the maximum number of rows
        in the resulting table.  For example "rows=10" selects at most 10 rows.
        A value of -1 selects all row, while -2 uses the
        <a href="/help/my_settings.html?token={/envelope/token}">setting</a>
        "Rows Per Page".
      </p>
      <p>
        The column keyword "<b>first</b>" determines the first row
        in the resulting table.  For example "first=1" starts the listing from the
        first row, while "first=5" skips the first four rows.
      </p>
      <p>
        The column keyword "<b>sort</b>" determines the sort order
        of the resulting table.  For example "sort=name" sorts by column name.
        Usually all the columns and the special extra fields like UUID are
        available for sorting.
      </p>
      <p>
        The column keyword "<b>sort-reverse</b>" is like "sort", but sorts
        backwards.
      </p>
      <p>
        The column keyword "<b>tag</b>" selects items with a given tag
        attached. Either the name or the name and value, separated by an equals
        sign (=) can be given. Neither tag name nor value are put into quotes or
        use any other string delimiter.<br/>
        When both name and value are given, the tags must match both. If only
        the name is given, the tag can have any value, including none.<br/>
        The "tag" keyword supports the =, ~ and : relations. &gt; and &lt; will
        behave the same as =.
      </p>
      <p>
        The column keyword "<b>owner</b>" restricts the filtered items to those
        owned by the user with a given name. For example "owner=user123" will
        give only items owned by the user named "user123".<br/>
        If no "owner" keyword is given or "any" is given instead of an user name
        items that are either global or owned by any user are returned.<br/>
        To get only global items and ones owned by the current user, use
        "owner=".
      </p>
      <p>
        The column keyword "<b>permission</b>" restricts the filtered items to
        ones the current user has a certain permission for. For example
        "permission=modify_task" on the tasks page will give tasks the user
        is allowed to modify.<br/>
        If no "permission" keyword is given or "any" is used as a permission
        name, items for any permission are returned.
      </p>

      <h4>Date format</h4>
      <p>
        Dates can be expressed in absolute or relative terms.
      </p>
      <p>
        Absolute dates take the form "2012-05-03T13h00", as in the search term
        "modified&gt;2012-05-03T13h00".  The time is optional, so the form
        "2012-05-03" is also accepted, which means 0h00 on that day.
      </p>
      <p>
        Relative dates are dates expressed a number of units relative to the
        current time.  For example "-7d" means 7 days ago, while "3m" means
        3 minutes in the future.  So the search term "created&gt;-2w" includes
        all resources created in the last two weeks.
      </p>
      <p>
        The modifier letters for relative dates are <b>s</b>econd,
        <b>m</b>inute, <b>h</b>our, <b>d</b>ay, <b>w</b>eek, <b>M</b>onth and
        <b>y</b>ear.  For simplicity, month means the last 30 days, and year
        means the past 365 days.
      </p>

      <h4>Special Resource-Specific Keywords</h4>

      <p>
        For some resource types the powerfilter offers extra keywords.
      </p>

      <h5>Tasks, Reports, Results</h5>
      <p>
        For Tasks, Reports and Results the powerfilter can contain the special
         keywords "apply_overrides" and "min_qod".
      </p>
      <p>
        "apply_overrides" sets whether overrides are applied to the
         results, which can also affect the overall severity of a report
         or task.
      </p>
      <p>
        "min_qod" specifies an overall minimum QoD. Results below this QoD
        are neither shown nor considered in the overall severity of a report
        or task.
      </p>

      <h5>Tasks</h5>

      <p>
        In addition to the keywords above Task filters can include the keywords
        "schedule" and "next_due".
      </p>
      <p>
        "schedule" allows filtering and sorting by the name of the task's
        schedule.  To include only scheduled tasks, use "not schedule=".
      </p>
      <p>
        "next_due" allows filtering and sorting by the next time the task
        is due to run.  For example, "next_due>2d" will list all scheduled
        tasks that are due to start more than two days from now.
      </p>

      <h5>Results</h5>
      <p>
        In addition to the keywords above Result filters can include the
        keywords "autofp", "levels", "notes" and "overrides".
      </p>
      <p>
        "autofp" controls whether results are automatically marked as
        "False Positive". "1" means the CVEs marked as closed must match fully,
        "2" means partial matches are sufficient.
      </p>
      <p>
        In a delta report "delta_states" specifies which states are shown.
        The value given is a string of letters, each representing a state
        that will be included:
        "c" for "<b>c</b>hanged",
        "g" for "<b>g</b>one",
        "n" for "<b>n</b>ew" and
        "s" for "<b>s</b>ame".
      </p>
      <p>
        "levels" is a compact way to select the severity levels shown.
        The value given is a string of letters, each representing a severity
        level that will be included:
        "h" for "<b>h</b>igh",
        "m" for "<b>m</b>edium",
        "l" for "<b>l</b>ow",
        "g" for "lo<b>g</b>" and
        "f" for "<b>f</b>alse positive".
      </p>
      <p>
        "notes" specifies whether Notes are are shown.
      </p>
      <p>
        "overrides" specifies whether Overrides are are shown. This option is
        independent from "apply_overrides" and does <i>not</i> change whether
        Overrides are applied to the results.
      </p>


      <h5>Notes</h5>

      <p>
        Additionally, the Notes table can be filtered by certain fields that
        appear on the Note Details page.  These fields are: Hosts, Port,
        Task (task_name and task_uuid) and Result.
      </p>

      <h5>Overrides</h5>

      <p>
        Additionally, the Overrides table can be filtered by certain fields that
        appear on the Override Details page.  These fields are: Hosts, Port,
        Task (task_name and task_uuid) and Result.
      </p>

      <h5>Permissions</h5>

      <p>
        Additionally, the Permissions can be filtered for orphaned permissions by
        using "orphan=1". Those are permissions where the referring resource were
        meanwhile deleted. With "orphan=0" you exclude the orhphaned entries.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="task_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Task Details'"/>
    <xsl:with-param name="asset-type" select="'task'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_task&amp;task_id=343435d6-91b0-11de-9478-ffd71f4c6f29&amp;overrides=1&amp;token={/envelope/token}">Jump to dialog with sample content</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_TASKS'"/>
      </xsl:call-template>

      <p>
       This information dialog lists the details of a task.
      </p>
      <p>
       The details include name,
       status, number of reports, number of notes and number of overrides.
       It also lists the current settings for target host scanning order, network source
       interface, <a href="glossary.html?token={/envelope/token}#config">Scan Config</a>,
       <a href="glossary.html?token={/envelope/token}#target">Target</a>,
       <a href="glossary.html?token={/envelope/token}#alert">Alert</a>,
       <a href="glossary.html?token={/envelope/token}#schedule">Schedule</a> and
       <a href="glossary.html?token={/envelope/token}#scanner">Scanner</a>.
      </p>
      <p>
        Further information about certain details is available by clicking on
        the respective item.  For example, clicking on the number of notes
        goes to a listing of these notes.
      </p>
      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'task'"/>
        <xsl:with-param name="name" select="'Task'"/>
      </xsl:call-template>
      <h4>Start Task</h4>
      <p>
        To start the task click the start icon
        <img src="/img/start.svg" class="icon icon-sm" alt="Start Task" title="Start Task"/>.
      </p>
      <h4>Stop Task</h4>
      <p>
        To stop the task click the stop icon
        <img src="/img/stop.svg" class="icon icon-sm" alt="Stop Task" title="Stop Task"/>.  This icon
        is only available when the task is running.
      </p>
      <h4>Resume Task</h4>
      <p>
        To resume the task after it has stopped, click the resume icon
        <img src="/img/resume.svg" class="icon icon-sm" alt="Resume Task" title="Resume Task"/>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scan Config Details'"/>
    <xsl:with-param name="type" select="'config'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#config">Scan Config</a> together with the
        associated configuration parameters.
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'config'"/>
        <xsl:with-param name="name" select="'Scan Config'"/>
      </xsl:call-template>

      <h4>Sync Config</h4>
      <p>
        Pressing the sync config icon <img src="/img/refresh.svg" class="icon icon-sm" alt="Sync Config" title="Sync Config"/> will
        synchronize the OSP config with its scanner. This icon is only visible for OSP configurations.
      </p>

      <p>
      The synchronization follows these rules:
      </p>

      <ul>
      <li>New scanner parameters are added to the config and the default will be applied.</li>
      <li>Removed parameters (present in the config, but not in the scanner) are removed.</li>
      <li>Parameters that were already present, are not changed, even if the default changed.</li>
      <li>Parameter presence/absence is based on parameter name AND type AND default value.
          For example, if an OSP scanner changes only a parameter's type, the old one is
          removed and a new one is inserted.</li>
      </ul>

      <h2>Network Vulnerability Test Families</h2>
      <p>
       This table provides an overview of the selected NVTs and NVT Families.
       A Trend icon next to the Family column of the table indicates whether new
       families will automatically be included ("Grow") <img src="/img/trend_more.svg" class="icon icon-sm" alt="Grow" title="Grow"/>
       or not ("Static") <img src="/img/trend_nochange.svg" class="icon icon-sm" alt="Static" title="Static"/>.
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
          <td>Trend</td>
          <td>Shows the Trend, which indicates whether new NVTs of this family are
              automatically added to the configuration ("Grow") <img src="/img/trend_more.svg" class="icon icon-sm" alt="Grow" title="Grow"/> or
              not ("Static") <img src="/img/trend_nochange.svg" class="icon icon-sm" alt="Static" title="Static"/>. </td>
        </tr>
      </table>

      <h3>Actions</h3>

      <h4>Scan Config Family Details</h4>
      <p>
       A click on the Family name
       will show an intermediate detailed <a href="config_family_details.html?token={/envelope/token}">list of NVTs</a> and its preferences.
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
          <td>Shows the name of a preference for an NVT.</td>
        </tr>
        <tr class="odd">
          <td>Value</td>
          <td>Shows current value of a preference for an NVT.</td>
        </tr>
      </table>

      <h3>Actions</h3>

      <h4>Scan Config NVT Details</h4>
      <p>
       A click on the NVT name will open the
       <a href="config_nvt_details.html?token={/envelope/token}">Scan Config NVT Details</a> dialog with detailed information about a certain NVT
       and all its preferences.
      </p>

      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Scan Config'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scan Config Editor'"/>
    <xsl:with-param name="asset-type" select="'config'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <p>
       The Scan Config Editor allows modification of all parameters of a
       <a href="glossary.html?token={/envelope/token}#config">Scan Config</a>.
       These include a selection of <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>s and the
       specifications how the selection should automatically updated, NVT Preferences
       and Timeouts and advanced Scanner Preferences.
      </p>
      <p>
       Note that only Scan Configs that are not currently in use by a
       <a href="glossary.html?token={/envelope/token}#task">Task</a> allow modifications.
      </p>

      <h1>Edit Scan Config Details</h1>
      <p>
       This dialog shows the name and comment of a given
       <a href="glossary.html?token={/envelope/token}#config">Scan Config</a> together with the
       associated configuration parameters itself. It also shows the scanner of a config, if it is of type OSP.
       It allows to adjust all parameters of the Scan Config.
      </p>
      <p>
       Note: In order to save modifications, the button labelled "Save Config" must
       be clicked. The edit action <img src="/img/edit.svg" class="icon icon-sm" alt="Edit" title="Edit"/>
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
              header allows to specify whether new families will automatically be
              included ("Grow") <img src="/img/trend_more.svg" class="icon icon-sm" alt="Grow" title="Grow"/> or not ("Static")
              <img src="/img/trend_nochange.svg" class="icon icon-sm" alt="Static" title="Static"/>.</td>
        </tr>
        <tr class="even">
          <td>NVT's selected</td>
          <td>Shows the number of NVTs that would be considered with the current
              selection and the total number of NVTs in this family.</td>
        </tr>
        <tr class="odd">
          <td>Trend</td>
          <td>Allows modification of the trend for this family. If the trend is set to
             "Grow" <img src="/img/trend_more.svg" class="icon icon-sm" alt="Grow" title="Grow"/>, new NVTs of this family are
              automatically added to the configuration. If it is set to "Static"
              <img src="/img/trend_nochange.svg" class="icon icon-sm" alt="Static" title="Static"/>, the selection will not be
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
       A click on the edit icon <img src="/img/edit.svg" class="icon icon-sm" alt="Edit" title="Edit"/>
       will save the modifications and show the
       <a href="config_editor_nvt_families.html?token={/envelope/token}">Edit Scan Config Family Details</a>
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
          <td>Shows the name of a preference for an NVT.</td>
        </tr>
        <tr class="odd">
          <td>Value</td>
          <td>Shows current value of a preference for an NVT.</td>
        </tr>
      </table>

      <h3>Actions</h3>

     <h4>Scan Config NVT Details</h4>
      <p>
       A click on the NVT name will open the
       <a href="config_nvt_details.html?token={/envelope/token}">Scan Config NVT Details</a> dialog
       with detailed information about the NVT and all its preferences.
      </p>

      <h4>Edit Scan Config NVT Details</h4>

      <p>
       A click on the edit icon <img src="/img/edit.svg" class="icon icon-sm" alt="Edit" title="Edit"/>
       will open the <a href="config_editor_nvt.html?token={/envelope/token}">Edit Scan Config NVT Details</a>
       dialog with detailed information about a certain NVT and all its preferences.
       This page will provide an overview over all preferences and the currently set
       Timeout for this NVT and allow modifications.
      </p>

      <h2>Tasks using this Config</h2>
      <p>
       The tasks that use the shown config are listed.
       A click on the task name will open
       the <a href="task_details.html?token={/envelope/token}">Task Details</a> page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor_nvt_families.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scan Config Editor NVT Families'"/>
    <xsl:with-param name="asset-type" select="'config'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <a name="editconfigfamilydetails"></a>
      <p>
       This page gives an overview of <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>s of one
       family in a <a href="glossary.html?token={/envelope/token}#config">Scan Config</a>.
      </p>

      <h2>Edit Network Vulnerability Tests</h2>
      <p>
       This table provides an overview of NVTs of one family in a Scan Config
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
        <tr class="even">
          <td>Severity</td>
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
       A click on the NVT name
       will lead to the page listing <a href="config_nvt_details.html?token={/envelope/token}">NVT details</a>.
      </p>

      <h4>Select and Edit NVT Details</h4>
      <p>
       A click on the edit icon <img src="/img/edit.svg" class="icon icon-sm" alt="Edit" title="Edit"/> will add the NVT to the selection
       and lead to a page that lists <a href="config_editor_nvt.html?token={/envelope/token}">NVT details and allows to modify preferences</a> and
       the timeout.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor_nvt.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scan Config Editor NVT'"/>
    <xsl:with-param name="asset-type" select="'config'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <p>
       This dialog shows information of a single <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>
       and its preference settings within a
        <a href="glossary.html?token={/envelope/token}#config">Scan Config</a>.
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
          <td>
            The value for the NVT Preference in the given Scan Config.
            For different Preference Types, different input methods are shown.
            <br/><br/>
            Note that file preferences must be UTF-8 encoded.
          </td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_family_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scan Config Family Details'"/>
    <xsl:with-param name="asset-type" select="'config'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <a name="configfamilydetails"></a>
      <p>
       This page gives an overview of <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>s of one
       family in a <a href="glossary.html?token={/envelope/token}#config">Scan Config</a>.
      </p>

      <h2>Network Vulnerability Tests</h2>
      <p>
       This table provides an overview of NVTs of one family in a Scan Config.
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
        <tr class="even">
          <td>Severity</td>
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
       A click on the NVT name
       will lead to the page listing <a href="config_nvt_details.html?token={/envelope/token}">NVT details</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_nvt_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Scan Config NVT Details'"/>
    <xsl:with-param name="asset-type" select="'config'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <p>
       This dialog shows information of a single <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>
       and its preference settings within a
       <a href="glossary.html?token={/envelope/token}#config">Scan Config</a>.
      </p>

      <h2>Network Vulnerability Test</h2>

      <h3>Details</h3>
      <p>
       Provides information like the name of the NVT, a summary, its OID, Family
       Affiliation and References. Most NVTs have a CVSS value.
      </p>

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
          <td>The value for the NVT Preference in the given Scan Config.</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="tag_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Tag Details'"/>
    <xsl:with-param name="asset-type" select="'tag'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#tag">Tag</a>.
        This includes the name, value, comment, resource it is attached to,
        whether it is active and whether it is orphaned (attached to a
        nonexistent resource).
      </p>

      <xsl:call-template name="details-window-line-actions">
        <xsl:with-param name="type" select="'tag'"/>
        <xsl:with-param name="name" select="'Tag'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="target_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Target Details'"/>
    <xsl:with-param name="type" select="'target'"/>
  </xsl:call-template>

    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    | <a href="standard_actions.html?token={/envelope/token}">Standard Actions</a>
    | <a href="targets.html?token={/envelope/token}">Targets</a>
    | <a href="new_target.html?token={/envelope/token}">New/Edit Target Dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_TARGETS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a
        <a href="glossary.html?token={/envelope/token}#target">Target</a>.
        This includes the name, comment, hosts, exclude hosts and the maximum
        number of hosts to scan.
        If credentials are associated with the target, their names can be seen.
        A click on a credential name will show more information about the
        associated credential.
      </p>

      <xsl:call-template name="object-used-by">
        <xsl:with-param name="name" select="'Target'"/>
        <xsl:with-param name="used_by" select="'Task'"/>
      </xsl:call-template>
    </div>
</xsl:template>

<xsl:template mode="help" match="tags.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Tags'"/>
    <xsl:with-param name="type" select="'tag'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <p>
       This table provides an overview of all
       <a href="glossary.html?token={/envelope/token}#tag">tags</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'tag'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Value</td>
          <td>The value associated with the tag.</td>
        </tr>
        <tr class="odd">
          <td>Attach type</td>
          <td>The resource type the tag is attached to.</td>
        </tr>
        <tr class="even">
          <td>Attach Name</td>
          <td>The Name of the resource the tag is attached to if available,
          the ID otherwise.<br/>
          Clicking a resource name with a link will open the details page of
          the resource.
          </td>
        </tr>
        <tr class="odd">
          <td>Modified</td>
          <td>The date the tag was last modified.</td>
        </tr>
      </table>

      <h3>New Tag</h3>
      <p>
        To create a new tag click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Tag" title="New Tag"/> which
        goes to the <a href="new_tag.html?token={/envelope/token}">New Tag</a>
        page.
      </p>

      <h3>Exporting</h3>
      <p>
        Export the current list of tags as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Tag'"/>
        <xsl:with-param name="showenable" select="1"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="user-tags.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'User Tags List'"/>
    <xsl:with-param name="asset-type" select="'tag'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <p>
       This table provides an overview of all active
       <a href="glossary.html?token={/envelope/token}#tag">tags</a>
       attached to a resource.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>Shows name of the tag</td>
        </tr>
        <tr class="even">
          <td>Value</td>
          <td>The value associated with the tag.</td>
        </tr>
        <tr class="odd">
          <td>Comment</td>
          <td>The comment of the tag.</td>
        </tr>
      </table>

      <h3>New Tag</h3>
      <p>
        To create a new tag for the current resource click the
        new icon <img src="/img/new.svg" class="icon icon-sm" alt="New Tag" title="New Tag"/> which
        goes to the <a href="new_tag.html?token={/envelope/token}">New Tag</a>
        page.
      </p>

      <xsl:call-template name="list-window-line-actions">
        <xsl:with-param name="type" select="'Tag'"/>
        <xsl:with-param name="showenable" select="1"/>
        <xsl:with-param name="noclone" select="1"/>
        <xsl:with-param name="noexport" select="1"/>
      </xsl:call-template>

      <h2>Add Tag</h2>
      <p>
        If Tags exist for the current resource or one of same type the
        &quot;Add Tag&quot; bar will appear above the User Tags list.
        After selecting a tag name from the drop-down box and entering the
        value in the text box (optional) a new tag with these properties
        can be quickly added to the current resource without going to the
        <a href="new_tag.html?token={/envelope/token}">New Tag</a>
        page by clicking the new icon
        <img src="/img/new.svg" class="icon icon-sm" alt="New Tag" title="New Tag"/>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="targets.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Targets'"/>
    <xsl:with-param name="type" select="'target'"/>
  </xsl:call-template>

    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    | <a href="standard_actions.html?token={/envelope/token}">Standard Actions</a>
    | <a href="filtering.html?token={/envelope/token}">Filtering</a>
    | <a href="target_details.html?token={/envelope/token}">Target Details</a>
    | <a href="new_target.html?token={/envelope/token}">New/Edit Target Dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_TARGETS'"/>
      </xsl:call-template>

      <p>
       This table provides an overview of all configured
       <a href="glossary.html?token={/envelope/token}#target">Targets</a>.
       The complete contents of the target entries
       are shown (name, comment and hosts).
       If credentials are linked to the target, they are listed as well.
      </p>

      <xsl:call-template name="sorting"/>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <xsl:call-template name="name-column">
          <xsl:with-param name="type" select="'target'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Hosts</td>
          <td>The comma separated list of target hosts, specified
              either via hostname or IP.</td>
        </tr>
        <tr class="odd">
          <td>IPs</td>
          <td>The total number of IPs that results from the hosts specification
              hosts exclusion.
              This is a max-value estimate as it doesn't take into account
              scan-time features like resolving excluded hostnames and options
              like reverse lookup only and unify.</td>
        </tr>
        <tr class="even">
          <td>Port List</td>
          <td>Associated port list, that can be clicked on to view details.</td>
        </tr>
        <tr class="odd">
          <td>Credentials: SSH</td>
          <td>Associated SSH credential, that can be clicked on to view details.</td>
        </tr>
        <tr class="even">
          <td>Credentials: SMB</td>
          <td>Associated SMB credential, that can be clicked on to view details.</td>
        </tr>
        <tr class="odd">
          <td>Credentials: ESXi</td>
          <td>Associated ESXi credential, that can be clicked on to view details.</td>
        </tr>
      </table>

      <xsl:call-template name="hosts_note"/>
    </div>
</xsl:template>

<xsl:template mode="help" match="tasks.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Tasks'"/>
    <xsl:with-param name="type" select="'task'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_TASKS'"/>
      </xsl:call-template>

      <a name="tasks"></a>
      <p>
       This table provides an overview of all configured
       <a href="glossary.html?token={/envelope/token}#task">tasks</a> and summarizes
       the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>
            Shows name of the task. Names are not
            necessarily unique, so the same name
            may appear multiply. An internal ID
            distinguishes the tasks.
            <br/>
            If there is a comment on the task it is shown in brackets below
            the name.
            <div>
              The right hand side of this column may contain a number of icons:
              <table style="margin-left: 10px">
                <tr>
                  <td valign="top">
                    <img src="/img/alterable.svg"
                         border="0"
                         class="icon icon-sm"
                         alt="Task is alterable"
                         title="Task is alterable"/>
                  </td>
                  <td>
                    The task is marked as alterable. This allows some
                    properties to be edited which would otherwise be locked
                    once reports exist for the task.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/sensor.svg"
                         border="0" class="icon icon-sm"
                         alt="Task is configured to run on slave scanner Example Slave"
                         title="Task is configured to run on slave scanner Example Slave"/>
                  </td>
                  <td>
                    The task is configured to run on a slave scanner.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/provide_view.svg"
                         border="0" class="icon icon-sm"
                         alt="Task made visible for: user1 user2"
                         title="Task made visible for: user1 user2"/>
                  </td>
                  <td>
                    The task has been made visible to one or more other users.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/view_other.svg"
                         border="0" class="icon icon-sm"
                         alt="Observing task owned by user1"
                         title="Observing task owned by user1"/>
                  </td>
                  <td>
                    The task is owned by another user.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr class="even">
          <td>Status</td>
          <td>The status of the most recent scan by the task.<br/>
              Clicking the progress bar will bring you to the current report,
              which may be incomplete depending on the status of the scan.<br/>
              The status of a task is one of these:
            <br/>
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
                  The task returned successfully from a scan and produced a report. The
                  newest report is complete with regard to targets and scan configuration
                  of the task.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Container">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Container</div>
                  </div>
                </td><td>
                  The task is a container task.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Reports: Total</td>
          <td>The number of reports that have been created by
              running this task. The first number show how many reports
              from finished scans exist for the task while the number in
              brackets also includes reports of unfinished scans.<br/>
              Clicking one of the numbers will bring you to the
              corresponding list of reports.</td>
        </tr>
        <tr class="even">
          <td>Reports: Last</td>
          <td>Date when the last finished report was created. You can jump
              to this report by clicking the date.</td>
        </tr>
        <tr class="odd">
          <td>Severity</td>
          <td>Highest severity of the newest report. The bar will be colored
              according to the severity level defined by the current <a href="/help/my_settings.html?token={/envelope/token}#severity_class">Severity Class</a>:
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'8.0'"/>
                    <xsl:with-param name="extra_text" select="' (High)'"/>
                    <xsl:with-param name="title" select="'High'"/>
                  </xsl:call-template>
                </td>
                <td>
                  A red bar is shown if the maximum severity is in the
                  'High' range.
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'5.0'"/>
                    <xsl:with-param name="extra_text" select="' (Medium)'"/>
                    <xsl:with-param name="title" select="'Medium'"/>
                  </xsl:call-template>
                </td>
                <td>
                  A yellow bar is shown if the maximum severity is in the
                  'Medium' range.
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'2.0'"/>
                    <xsl:with-param name="extra_text" select="' (Low)'"/>
                    <xsl:with-param name="title" select="'Low'"/>
                  </xsl:call-template>
                </td>
                <td>
                  A blue bar is shown if the maximum severity is in the
                  'Low' range.
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'0.0'"/>
                    <xsl:with-param name="extra_text" select="' (Log)'"/>
                    <xsl:with-param name="title" select="'Log'"/>
                  </xsl:call-template>
                </td>
                <td>
                  An empty bar is shown if no vulnerabilities were detected.
                  Perhaps some NVT created a log information, so the report
                  is not necessarily empty.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="even">
          <td>Trend</td>
          <td>Describes the change of vulnerabilities between the newest
              report and the report before the newest:
            <br/>
            <table>
              <tr>
                <td valign="top"><img src="/img/trend_up.svg" class="icon icon-sm"/></td>
                <td>
                  Severity increased: In the newest report at
                  least one NVT for at least one target host reported a higher
                  severity score than any NVT reported in the report before
                  the newest one.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_more.svg" class="icon icon-sm"/></td>
                <td>
                  Vulnerability count increased: The maximum severity reported
                  in the last report and the report before the last report is
                  the same. However, the newest report contains more security
                  issues of this severity level than the report before.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_nochange.svg" class="icon icon-sm"/></td>
                <td>
                  Vulnerabilities did not change: The maximum severity and the
                  severity levels of the results in the newest report and the
                  one before are identical.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_less.svg" class="icon icon-sm"/></td>
                <td>
                  Vulnerability count decreased: The maximum severity reported
                  in the last report and the report before the last report is
                  the same. However, the newest report contains less security
                  issues of this severity level than the report before.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_down.svg" class="icon icon-sm"/></td>
                <td>
                  Severity decreased: In the newest report the highest reported
                  severity score is lower than the one reported in the report
                  before the newest one.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="autorefresh"></a>
      <h3>Auto-refresh</h3>
      <p>
       The tasks overview allows to set a time interval for
       an automatic page refresh. Select one of the
       intervals (10 seconds, 30 seconds or 60 seconds)
       and confirm with pressing the refresh
       <img src="/img/refresh.svg" alt="Refresh" class="icon icon-sm" title="Refresh"/> icon.
      </p>
      <p>
       The selection that is currently for the present page is marked with a check mark (&#8730;).
      </p>
      <p>
       Note that leaving this page will reset the refresh interval to manual refresh.
      </p>

      <a name="wizard"></a>
      <h3>Task Wizard</h3>
      <p>
       The Task Wizard provides a simple way to creates and start a task given
       only an IP address or hostname.
      </p>
      <p>
       When there are few tasks in the task table, the Task Wizard is displayed
       under the table.  The user setting "Wizard Rows" determines the number of
       rows in the table above which the wizard will be hidden by default.
      </p>
      <p>
       The wizard <img src="/img/wizard.svg" class="icon icon-sm" alt="Show Wizard" title="Show Wizard"/>
       icon leads to a dedicated page providing the wizard.
      </p>

      <a name="overrides"></a>
      <h3>Overrides</h3>
      <p>
       The icon in the header of the severity column shows whether the
       configured <a href="glossary.html?token={/envelope/token}#override">overrides</a>
       are applied (<img src="/img/enable.svg" class="icon icon-sm" alt="Overrides are applied" title="Overrides are applied"/>)
       or not (<img src="/img/disable.svg" class="icon icon-sm" alt="No Overrides" title="No Overrides"/>).
      </p>
      <p>
       By default the overrides are applied. Clicking the icon allows to switch
       to a view without applying overrides and back.
       In the table view, severity classes, severity numbers and trend might change
       when toggling the overrides.
      </p>
      <p>
       Note that leaving this page will reset the selection to apply overrides
       if you leave this page. Exceptions are the task details page as well
       as reports and report lists.
      </p>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Start Task</h4>
      <p>
       Pressing the start icon <img src="/img/start.svg" class="icon icon-sm" alt="Start" title="Start"/> will
       start a new scan. The list of tasks will be updated.
      </p>
      <p>
       This action is only available if the task has status "New" or "Done" and
       is not a scheduled task or a container task.
      </p>

      <h4>Schedule Details</h4>
      <p>
        Pressing the "Schedule Details" icon <img src="/img/scheduled.svg" class="icon icon-sm"
          alt="Schedule Details" title="Schedule Details"/> will switch to an
        overview of the details of the schedule used for this task.
      </p>
      <p>
        This action is only available if the task is a scheduled task.
      </p>

      <h4>Resume Task</h4>
      <p>
       Pressing the resume icon <img src="/img/resume.svg" class="icon icon-sm" alt="Resume"
         title="Resume"/> will resume a previously stopped task. The list of
       tasks will be updated.
      </p>
      <p>
        This action is only available if the task has been stopped before, either
        manually or due to its scheduled duration.
      </p>

      <h4>Stop Task</h4>
      <p>
       Pressing the stop icon <img src="/img/stop.svg" class="icon icon-sm" alt="Stop" title="Stop"/> will
       stop a running task. The list of tasks will be updated.
      </p>
      <p>
       This action is only available if the task is running.
      </p>

      <h4>Move Task to Trashcan</h4>
      <p>
       Pressing the trashcan icon
       <img src="/img/trashcan.svg" class="icon icon-sm" alt="Move to Trashcan" title="To Trashcan"/>
       will move the entry to the trashcan. The list of tasks will be updated. Note that also all
       of the reports associated with this task will be moved to the trashcan.
      </p>
      <p>
       This action is only available if the task has status "New", "Done",
       "Stopped" or "Container".
      </p>

      <a name="edit_task"></a>
      <h4>Edit Task</h4>
      <p>
       Pressing the "Edit Task" icon <img src="/img/edit.svg" class="icon icon-sm" alt="Edit Task"
         title="Edit Task"/> will
       switch to an overview of the configuration for this task and allows
       editing of some of the task's properties.
      </p>
      <p>
        Note that the Alterable Task field is only available for editing if
        the task has no reports.  This ensures that a sequence of reports on
        a non-alterable task can always be trusted to show the change in
        security status, because all scans have used the same target and
        scan configuration.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="trashcan.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Trashcan'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_trash&amp;token={/envelope/token}">Jump to dialog</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="trashcan-availability"/>

      <p>
        This page lists all resources that are currently in the trashcan.
        The listing is grouped by resource type.
        There is a summary table at the top of the page with item counts
        and links into the groups.
      </p>

      <a name="actions"></a>
      <h3>Actions</h3>

      <h4>Delete</h4>
      <p>
       Pressing the delete icon <img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/> will
       remove the resource entirely from the system, immediately.  The
       trashcan will be updated.  The icon will be greyed out
       <img src="/img/delete_inactive.svg" class="icon icon-sm" alt="Delete" title="Delete"/>
       when some other resource in the trashcan depends on the resource.
      </p>

      <h4>Restore</h4>
      <p>
       Pressing the restore icon
       <img src="/img/restore.svg" class="icon icon-sm" alt="Restore" title="Restore"/>
       will move the resource out of the trashcan and back into normal
       operation.  The trashcan will be updated.  The icon will be greyed out
       <img src="/img/restore_inactive.svg" class="icon icon-sm" alt="Restore" title="Restore"/>
       when the resource depends on some other resource that
       is in the trashcan.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="result_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Result Details'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_RESULTS'"/>
      </xsl:call-template>

      <p>
        Provides detailed information about a Result.
        This includes the vulnerability, severity, host, location and any
        notes or overrides.
      </p>

      <h4>Report</h4>
      <p>
       Pressing the list icon
       <img src="/img/list.svg" class="icon icon-sm" alt="Report" title="Report"/>
       will switch to the report page.
      </p>

      <h4>Exporting</h4>
      <p>
        Export the result as XML by clicking on the
        export icon <img src="/img/download.svg" class="icon icon-sm" alt="Export" title="Export XML"/>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="view_report.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'View Reports'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_report&amp;report_id=343435d6-91b0-11de-9478-ffd71f4c6f30&amp;token={/envelope/token}">Jump to dialog with sample content</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_REPORTS'"/>
      </xsl:call-template>

      <a name="viewreport"></a>
      <p>
       This "View Report" page summarizes all information the selected
       <a href="/help/glossary.html?token={/envelope/token}#report">report</a> contains.
       This page is structured and designed like the
       download formats HTML and PDF.
      </p>
      <p>
       It is a single page with links that
       refer to the same page further up or down.
       For example, the host names in the "Host" table link to the host
       results further down the page.
       The exception is the "Tasks" link that refers to the
       <a href="/help/glossary.html?token={/envelope/token}#task">task</a>'s
       <a href="/help/reports.html?token={/envelope/token}">list of reports</a>.
      </p>
      <p>
        The View Report page is also used to display
       <a href="glossary.html?token={/envelope/token}#prognostic_report">prognostic reports</a>.
      </p>

      <a name="overrides"></a>
      <h2>Report Summary</h2>
      <p>
        The Report Summary window shows key details of the report, like the name
        of the task that produced the report, and the time the task started.
      </p>

      <p>
        This window also contains a table of severity counts for the full report.
        To download the full report, the <a href="glossary.html?token={/envelope/token}#report_format">format</a>
        can be chosen in the Download column.
        The download will start shortly after a click on the download
        <img src="/img/download.svg" class="icon icon-sm" alt="Download" title="Download"/>
        icon.  Report formats can be configured on the
        <a href="report_formats.html?token={/envelope/token}">Report Formats</a>
        page.
      </p>

      <a name="overrides"></a>
      <h3>Overrides Selection</h3>
      <p>
       By default the configured <a href="glossary.html?token={/envelope/token}#override">overrides</a> are applied.
       The selection allows to switch to a view without applying overrides.
       In the table views, scan results numbers might change when switching this selection.
       By pressing the refresh
       <img src="/img/refresh.svg" class="icon icon-sm" alt="Refresh" title="Refresh"/> icon a change is confirmed.
      </p>
      <p>
       The selection that is active for the present page is marked with a hook (&#8730;).
      </p>
      <p>
       Note that leaving this page will reset the overrides selection to apply overrides.
      </p>

      <h3>Download the filtered report</h3>
      <p>
       To download the currently shown report, the <a href="glossary.html?token={/envelope/token}#report_format">format</a>
       can be chosen.
       The download will start shortly after a click on the download
       <img src="/img/download.svg" class="icon icon-sm" alt="Download" title="Download"/>
       icon.  Report formats can be configured on the
       <a href="report_formats.html?token={/envelope/token}">Report Formats</a>
       page.
      </p>

      <h3>Notes</h3>
      <p>
       Any <a href="/help/glossary.html?token={/envelope/token}#note">notes</a> that apply to a result are
       displayed under the result.  The notes for a result are sorted most recently
       created first.
      </p>
      <p>
       Each note has a group of action buttons
       <img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/>
       <img src="/img/details.svg" class="icon icon-sm" alt="Details" title="Details"/>
       <img src="/img/edit.svg" class="icon icon-sm" alt="Edit" title="Edit"/>
       which affect the note as on the <a href="notes.html?token={/envelope/token}">Notes</a> page.
      </p>
      <p>
       To add a note to an NVT, click the new note button
       <img src="/img/new_note.svg" class="icon icon-sm" alt="New Note" title="New Note"/>
       on a result of the NVT.
      </p>
      <p>
       If a result has notes and note display is enabled in the filter (see below),
       then the notes icon
       <img src="/img/note.svg" class="icon icon-sm" alt="Note" title="Note"/>
       is shown on the result. Clicking the icon jumps to the notes,
       which is helpful if the result has a very long description.
      </p>

      <h3>Overrides</h3>
      <p>
       If activated, any <a href="/help/glossary.html?token={/envelope/token}#override">overrides</a>
       that apply to a result are displayed under the result.
      </p>
      <p>
       Each override has a group of action buttons
       <img src="/img/delete.svg" class="icon icon-sm" alt="Delete" title="Delete"/>
       <img src="/img/details.svg" class="icon icon-sm" alt="Details" title="Details"/>
       <img src="/img/edit.svg" class="icon icon-sm" alt="Edit" title="Edit"/>
       which affect the override as on the <a href="overrides.html?token={/envelope/token}">Overrides</a> page.
      </p>
      <p>
       To add a override to an NVT, click the new override button
       <img src="/img/new_override.svg" class="icon icon-sm" alt="New Override" title="New Override"/>
       on a result of the NVT.
      </p>
      <p>
       If a result has overrides, then the overrides icon
       <img src="/img/override.svg" class="icon icon-sm" alt="Overrides" title="Overrides"/>
       is shown on the result.  Clicking the icon jumps to the overrides,
       which is helpful if the result has a very long description.
      </p>

      <xsl:call-template name="filtering"/>

      <p>
      A special filter command for results is the modifier 'timezone=' which
      will convert any timestamps in the report to the given timezone.
      Examples for the timezone modifiers are: 'timezone="Europe/Berlin"' or
      'timezone="Asia/Shanghai"'.
      </p>

      <xsl:call-template name="sorting"/>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cpes.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'CPEs'"/>
    <xsl:with-param name="info-type" select="'cpe'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=cpe&amp;token={/envelope/token}">Jump to dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all
        <a href="glossary.html?token={/envelope/token}#cpe">CPEs</a> and summarizes
        the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>The formal name of the CPE. The name is broken into multiple lines and break
            markers are added if it is too long for the column.
          </td>
        </tr>
        <tr>
          <td>Title</td>
          <td>The official title of the CPE, this is "N/A" for unofficial CPEs.</td>
        </tr>
        <tr>
          <td>Modified</td>
          <td>The date of the last official modification of the CPE,
            this is "N/A" for unofficial CPEs.
          </td>
        </tr>
        <tr>
          <td>CVEs</td>
          <td>The number of <a href="glossary.html?token={/envelope/token}#cve">CVEs</a>
            referencing this product.
          </td>
        </tr>
        <tr>
          <td>Severity</td>
          <td>The highest CVSS of any CVE that references this product.
          </td>
        </tr>
      </table>
      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="secinfo_missing"></a>
      <h2>Warning: SecInfo Database Missing</h2>
      <p>
        This warning dialog occurs when the SCAP database and/or the CERT
        database is missing on the OMP server.
      </p>
      <p>
        The CPE table is always empty when the database is missing.
      </p>
      <p>
        The SCAP data is updated during a SCAP data feed sync and the CERT data
        is updated during a CERT data feed sync.
        Most likely the data will appear after the next such feed sync.
        This is usually taken care of automatically by a periodic
        background process.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cves.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'CVEs'"/>
    <xsl:with-param name="info-type" select="'cve'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=cve&amp;token={/envelope/token}">Jump to dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all
        <a href="glossary.html?token={/envelope/token}#cve">CVEs</a> and summarizes
        the essential aspects of each.
      </p>

      <p>
        <b>Note:</b> Most characteristics of a vulnerability (Vector, Complexity, Authentication,
        Confidentiality Impact, Integrity Impact, Availability Impact) are extracted
        from the CVE's
        <a href="glossary.html?token={/envelope/token}#cvss">CVSS</a> Value.
        If the CVSS is not available those fields are set to "N/A".
      </p>

      <p>
        For a detailed description of the values in the CVSS based fields please
        refer to the CVSS Guide http://www.first.org/cvss/cvss-guide
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>The CVE identifier.</td>
        </tr>
        <tr class="odd">
          <td>Vector</td>
          <td>The Access Vector. This metric reflects how the vulnerability is exploited.</td>
        </tr>
        <tr>
          <td>Complexity</td>
          <td>The Access Complexity. This metric measures the complexity of the attack required
            to exploit the vulnerability once an attacker has gained access to the target system.</td>
        </tr>
        <tr class="odd">
          <td>Authentication</td>
          <td>This metric measures the number of times an attacker must authenticate
            to a target in order to exploit a vulnerability.</td>
        </tr>
        <tr>
          <td>Confidentiality Impact</td>
          <td>This metric measures the impact on confidentiality
            of a successfully exploited vulnerability.</td>
        </tr>
        <tr class="odd">
          <td>Integrity Impact</td>
          <td>This metric measures the impact to integrity
            of a successfully exploited vulnerability.</td>
        </tr>
        <tr>
          <td>Availability Impact</td>
          <td>This metric measures the impact to availability
            of a successfully exploited vulnerability.</td>
        </tr>
        <tr class="odd">
          <td>Published</td>
          <td>The date when this CVE was first published.</td>
        </tr>
        <tr>
          <td>Severity</td>
          <td>The combined score calculated from the metrics of the vulnerability.
            Ranging from 0 to 10. </td>
        </tr>
      </table>

      <p>
        <b>Tip:</b> Additionally to the mentioned columns you can also use the
        <a href="/help/powerfilter.html?token={/envelope/token}">Powerfilter</a>
        to filter CVEs that affect specific products (CPE). The keyword for the filter is
        "products".
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="secinfo_missing"></a>
      <h2>Warning: SecInfo Database Missing</h2>
      <p>
        This warning dialog occurs when the SCAP database and/or the CERT
        database is missing on the OMP server.
      </p>
      <p>
        The CVE table is always empty when the database is missing.
      </p>
      <p>
        The SCAP data is updated during a SCAP data feed sync and the CERT data
        is updated during a CERT data feed sync.
        Most likely the data will appear after the next such feed sync.
        This is usually taken care of automatically by a periodic
        background process.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="nvt_details.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'NVT Details'"/>
    <xsl:with-param name="info-type" select="'nvt'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">Help Contents</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        A page that provides detailed information about a NVT.
        This includes creation and modification dates, summary, vulnerability
        insight, solution etc,. CVSS information, lists of references (CVEs,
        Bugtraq IDs, CERT advisories referencing CVEs of
        this NVT, other references) and links to notes and overrides on the NVT.
      </p>
      <p>
        Clicking on a CVE name will go to the CVE Details page and clicking on
        a CERT advisory name will go to the CERT Advisory details page.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="nvts.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'NVTs'"/>
    <xsl:with-param name="info-type" select="'nvt'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=nvt&amp;token={/envelope/token}">Jump to dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all
        <a href="glossary.html?token={/envelope/token}#nvt">NVTs</a> and summarizes
        the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>The NVT identifier.</td>
        </tr>
        <tr class="odd">
          <td>Family</td>
          <td>The family the NVT belongs to.</td>
        </tr>
        <tr>
          <td>Created</td>
          <td>The date the NVT was created.</td>
        </tr>
        <tr class="odd">
          <td>Modified</td>
          <td>The date the NVT was last modified.</td>
        </tr>
        <tr class="even">
          <td>Version</td>
          <td>The version of the NVT.</td>
        </tr>
        <tr class="odd">
          <td>Solution Type (<img src="/img/solution_type.svg" class="icon icon-sm" alt="Solution type" title="Solution type"/>)</td>
          <td>
            The type of solution available for the vulnerability.<br/><br/>
            <xsl:call-template name="solution-types"/>
          </td>
        </tr>
        <tr class="even">
          <td>Severity</td>
          <td>
            The combined score calculated from the metrics of the vulnerability.
            Ranging from 0 to 10.
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="secinfo_missing"></a>
      <h2>Warning: SecInfo Database Missing</h2>
      <p>
        This warning dialog occurs when the SCAP database and/or the CERT
        database is missing on the OMP server.
      </p>
      <p>
        The NVT table is always empty when the database is missing.
      </p>
      <p>
        The SCAP data is updated during a SCAP data feed sync and the CERT data
        is updated during a CERT data feed sync.
        Most likely the data will appear after the next such feed sync.
        This is usually taken care of automatically by a periodic
        background process.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="ovaldefs.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'OVAL Definitions'"/>
    <xsl:with-param name="info-type" select="'ovaldef'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=ovaldef&amp;token={/envelope/token}">Jump to dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all
        <a href="glossary.html?token={/envelope/token}#ovaldef">OVAL Definitions</a> and summarizes
        the essential aspects of each.
      </p>
      <p>
        For a detailed description see the OVAL Language Specification at:
        http://oval.mitre.org/language/version5.10.1/
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>The OVAL identifier of the definitions. This column also shows the
          XML file that contains this definition in a smaller grey font.
          </td>
        </tr>
        <tr class="odd">
          <td>Version</td>
          <td>The Version number of the OVAL definitions.</td>
        </tr>
        <tr>
          <td>Status</td>
          <td>The lifecycle status of the OVAL definition. See http://oval.mitre.org/repository/about/stages.html for details on
          status types defined for the MITRE OVAL repository.<br/>
          If a definition has no status element, but has the "deprecated"
          attribute set to true, the status will be set to "DEPRECATED".
          </td>
        </tr>
        <tr class="odd">
          <td>Class</td>
          <td>The definition class of the definition.</td>
        </tr>
        <tr>
          <td>Created</td>
          <td>The date the definition was created.</td>
        </tr>
        <tr class="odd">
          <td>Modified</td>
          <td>The date the definition was last modified.</td>
        </tr>
        <tr>
          <td>CVEs</td>
          <td>The number of <a href="glossary.html?token={/envelope/token}#cve">CVEs</a> referenced by the definition.</td>
        </tr>
        <tr class="odd">
          <td>Severity</td>
          <td>The highest CVSS of any CVE that is referenced by the definition.</td>
        </tr>
      </table>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="secinfo_missing"></a>
      <h2>Warning: SecInfo Database Missing</h2>
      <p>
        This warning dialog occurs when the SCAP database and/or the CERT
        database is missing on the OMP server.
      </p>
      <p>
        The OVAL Definitions table is always empty when the database is missing.
      </p>
      <p>
        The SCAP data is updated during a SCAP data feed sync and the CERT data
        is updated during a CERT data feed sync.
        Most likely the data will appear after the next such feed sync.
        This is usually taken care of automatically by a periodic
        background process.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cert_bund_advs.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'CERT-Bund Advisories'"/>
    <xsl:with-param name="info-type" select="'cert_bund_adv'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=cert_bund_adv&amp;token={/envelope/token}">Jump to dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all
        <a href="glossary.html?token={/envelope/token}#cert_bund_adv">CERT-Bund Advisories</a>
        and summarizes the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>The CERT-Bund IDs of the advisories.</td>
        </tr>
        <tr class="odd">
          <td>Title</td>
          <td>The titles of the advisories.</td>
        </tr>
        <tr>
          <td>Created</td>
          <td>The date the advisory was created.</td>
        </tr>
        <tr class="odd">
          <td>Severity</td>
          <td>The highest CVSS of any CVE that is referenced by the advisory.</td>
        </tr>
        <tr>
          <td>CVEs</td>
          <td>The number of CVEs referenced by the advisories</td>
        </tr>
      </table>

      <a name="about"></a>
      <h3>About CERT-Bund</h3>
      <p>
        CERT-Bund (Computer Emergency Response Team for federal agencies,
        https://www.cert-bund.de/) is the central point of contact for preventive and
        reactive measures regarding security-related computer incidents.
      </p>

      <p>
        With the intention of avoiding harm and limiting potential damage, CERT-Bund
      </p>
      <ul>
        <li>creates and publishes recommendations for preventive measures</li>
        <li>points out vulnerabilities in hardware and software products</li>
        <li>proposes measures to address known vulnerabilities</li>
        <li>supports public agencies efforts to respond to IT security incidents</li>
        <li>recommends various mitigation measures</li>
      </ul>

      <p>In addition, CERT-Bund operates Germany's national IT Situation Centre.</p>

      <p>
        CERT-Bund's services are primarily available to the federal authorities and include
      </p>

      <ul>
        <li>24-hour on-call duty in cooperation with the IT Situation Centre</li>
        <li>analysis of incoming incident reports</li>
        <li>creation of recommendations derived from incidents</li>
        <li>support during IT security incidents</li>
        <li>operation of a warning and information service</li>
        <li>active alerting of the Federal Administration in case of imminent danger.</li>
      </ul>

      <p>
        In addition, CERT-Bund offers comprehensive information for interested
        individuals by providing warning and information services for citizens
        (http://www.buerger-cert.de/) which are available online
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="secinfo_missing"></a>
      <h2>Warning: SecInfo Database Missing</h2>
      <p>
        This warning dialog occurs when the SCAP database and/or the CERT
        database is missing on the OMP server.
      </p>
      <p>
        The CERT Advisory table is always empty when the database is missing.
      </p>
      <p>
        The SCAP data is updated during a SCAP data feed sync and the CERT data
        is updated during a CERT data feed sync.
        Most likely the data will appear after the next such feed sync.
        This is usually taken care of automatically by a periodic
        background process.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="dfn_cert_advs.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'DFN-CERT Advisories'"/>
    <xsl:with-param name="info-type" select="'dfn_cert_adv'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=dfn_cert_adv&amp;token={/envelope/token}">Jump to dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">DFN-CERT Advisories</a>
        and summarizes the essential aspects of each.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>The DFN-CERT IDs of the advisories.</td>
        </tr>
        <tr class="odd">
          <td>Title</td>
          <td>The titles of the advisories.</td>
        </tr>
        <tr>
          <td>Created</td>
          <td>The date the advisory was created.</td>
        </tr>
        <tr class="odd">
          <td>Severity</td>
          <td>The highest CVSS of any CVE that is referenced by the advisory.</td>
        </tr>
        <tr>
          <td>CVEs</td>
          <td>The number of CVEs referenced by the advisories</td>
        </tr>
      </table>

      <a name="about"></a>
      <h3>About DFN-CERT</h3>
      <p>
        Based in Hamburg, the DFN-CERT is responsible for a constituency of several
        hundred universities and research institutions throughout Germany, as well
        as it provides key security services to government and industry. It has a
        long term relationship in international, European and national fora and
        groups related to fighting cyber crime and helping the victims of attacks
        and incidents. Preparing proactive steps through focused research in the IT
        security field enables the DFN-CERT to promote best practices. This is done
        both in writing as well as in educational courses. DFN-CERT's managed
        service portfolio includes DDoS detection/mitigation, incident management,
        vulnerability management as well as early warning to key players in
        Government and industry.<br/>
        For more information see https://www.dfn-cert.de/ or contact &lt;info@dfn-cert.de&gt;.
      </p>
      <p>
        The DFN-CERT advisory service includes the categorization, distribution and
        rating of advisories issued by different software vendors and distributors,
        as well as providing a German translation.
      </p>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="secinfo_missing"></a>
      <h2>Warning: SecInfo Database Missing</h2>
      <p>
        This warning dialog occurs when the SCAP database and/or the CERT
        database is missing on the OMP server.
      </p>
      <p>
        The CERT Advisory table is always empty when the database is missing.
      </p>
      <p>
        The SCAP data is updated during a SCAP data feed sync and the CERT data
        is updated during a CERT data feed sync.
        Most likely the data will appear after the next such feed sync.
        This is usually taken care of automatically by a periodic
        background process.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="allinfo.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'All SecInfo'"/>
    <xsl:with-param name="info-type" select="'allinfo'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=allinfo&amp;token={/envelope/token}">Jump to dialog</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <p>
        This table provides an overview of all SecInfo related entries (
        <a href="glossary.html?token={/envelope/token}#nvt">NVTs</a>,
        <a href="glossary.html?token={/envelope/token}#cve">CVEs</a>,
        <a href="glossary.html?token={/envelope/token}#cpe">CPEs</a>,
        <a href="glossary.html?token={/envelope/token}#ovaldef">OVAL Definitions</a>,
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">DFN-CERT Advisories</a>
        ) and summarizes the essential aspects of each one.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Column</td>
          <td>Description</td>
        </tr>
        <tr class="odd">
          <td>Name</td>
          <td>SecInfo entry identifier.</td>
        </tr>
        <tr class="even">
          <td>Type</td>
          <td>The entry type.</td>
        </tr>
        <tr class="odd">
          <td>Created</td>
          <td>The date the entry was created on.</td>
        </tr>
        <tr class="even">
          <td>Modified</td>
          <td>The date the entry was last modified on.</td>
        </tr>
      </table>

      <xsl:call-template name="filtering"/>
      <xsl:call-template name="sorting"/>

      <a name="secinfo_missing"></a>
      <h2>Warning: SecInfo Database Missing</h2>
      <p>
        This warning dialog occurs when the SCAP database and/or the CERT
        database is missing on the OMP server.
      </p>
      <p>
        The SecInfo table is always empty when the database is missing.
      </p>
      <p>
        The SCAP data is updated during a SCAP data feed sync and the CERT data
        is updated during a CERT data feed sync.
        Most likely the data will appear after the next such feed sync.
        This is usually taken care of automatically by a periodic
        background process.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="qod.html">
  <xsl:call-template name="help-header">
    <xsl:with-param name="title" select="'Quality of Detection (QoD)'"/>
  </xsl:call-template>

  <div class="section-box">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>
    </div>
    <div style="text-align:left">

      <br/>

      <p>
      The QoD is a value between 0% and 100% describing the
      reliability of the executed vulnerability detection
      or product detection.
      </p>

      <p>
      One of the main reasons to introduce this concept was to handle
      the challenge of potential vulnerabilities properly. The goal was to
      keep such in the results database but only visible on demand.
      </p>

      <p>
      While the QoD range allows to express the quality pretty refined,
      in fact most of the test routines use a standard methodology.
      Therefore the <b>QoD Types</b> were introduced of which each
      is associated with a QoD value. The current list of types might
      be extended over time.
      </p>

      <h2>Overview on QoD values and types</h2>

      <table>

      <tr>
        <th align="left">QoD</th>
        <th align="left">QoD Type(s)</th>
        <th align="left">Description</th>
      </tr>

      <tr>
        <td valign="top" align="right">100%</td>
        <td valign="top">exploit</td>
        <td valign="top">The detection happened via an exploit and therefore is fully verified.</td>
      </tr>

      <tr>
        <td valign="top" align="right">99%</td>
        <td valign="top">remote_vul</td>
        <td valign="top">
          Remote active checks (code execution, traversal attack, sql injection etc.) where
          the response clearly shows the presence of the vulnerability.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">98%</td>
        <td valign="top">remote_app</td>
        <td valign="top">
          Remote active checks (code execution, traversal attack, sql injection etc.) where
          the response clearly shows the presence of the vulnerable application.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">97%</td>
        <td valign="top">
          package
        </td>
        <td valign="top">
          Authenticated package-based checks for Linux(oid) systems.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">97%</td>
        <td valign="top">
          registry
        </td>
        <td valign="top">
          Authenticated registry-based checks for Windows systems.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">95%</td>
        <td valign="top">remote_active</td>
        <td valign="top">
          Remote active checks (code execution, traversal attack, sql injection etc.)
          where the response shows the likely presence of the vulnerable application
          or of the vulnerability.
          "Likely" means that only rare circumstances are possible where the detection
          would be wrong.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">80%</td>
        <td valign="top">
          remote_banner
        </td>
        <td valign="top">
          Remote banner check of applications that offer patch level in version. Many
          proprietary products do so.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">80%</td>
        <td valign="top">
          executable_version
        </td>
        <td valign="top">
          Authenticated executable version checks for Linux(oid) or Windows systems where
          applications offer patch level in version.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">75%</td>
        <td valign="top"></td>
        <td valign="top">
          This value was assigned to any pre-qod results during migration to OpenVAS-8
          and is also assigned for results from NVTs that do not own a qod. However,
          some NVTs eventually might own this value for some reason.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">70%</td>
        <td valign="top">remote_analysis</td>
        <td valign="top">
          Remote checks that do some analysis but which are not always
          fully reliable.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">50%</td>
        <td valign="top">remote_probe</td>
        <td valign="top">
          Remote checks where intermediate systems such as firewalls might pretend
          correct detection so that it is actually not clear whether the application
          itself answered. This can happen for example for non-TLS connections.</td>
      </tr>

      <tr>
        <td valign="top" align="right">30%</td>
        <td valign="top">
          remote_banner_unreliable
        </td>
        <td valign="top">
          Remote Banner checks of applications that don't offer patch level in version identification.
          For example, this is the case for many Open Source products due to backport patches.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">30%</td>
        <td valign="top">
          executable_version_unreliable
        </td>
        <td valign="top">
          Authenticated executable version checks for Linux(oid) systems where applications
          don't offer patch level in version identification.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">1%</td>
        <td valign="top">general_note</td>
        <td valign="top">
          General note on potential vulnerability without finding any present application.
        </td>
      </tr>

      </table>

      <h2>Transition phase for NVTs and results</h2>

      <p>
      The value of 70% is the default minimum used for the default filtering
      to display the results in the reports.
      </p>

      <p>
      The QoD is introduced with OpenVAS-8. Any results created with prior
      versions are assigned the value of 75% during migration.
      </p>

      <p>
      The transition of the NVTs is a long-term activity. For NVTs that
      have no QoD assigned yet, scan results will be assigned with 75%.
      </p>

      <p>
      This setting of 75% ensures that by default the results are visible
      as before. However, eventually new results might occur with a QoD of 75%.
      So, this value can not automatically be interpreted as "old pre-qod result".
      </p>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
