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
IT Schwachstellenampel
$Id$
Description: Main stylesheet for the GSA interface IT Schwachstellenampel.

Authors:
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2014 Greenbone Networks GmbH

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

<!-- Main page link -->

<xsl:variable name="main_page_link" select="'/omp?cmd=wizard_get&amp;get_name=get_tasks_deep&amp;event_data:name=Schwachstellenampel&amp;event_data:include_report_formats=1&amp;event_data:include_configs=1'"/>

<!-- HEADERS, FOOTER, SIDEBARS -->

<xsl:template name="html-head">
  <xsl:variable name="task_status" select="//task[name='Schwachstellenampel']/status/text()"/>
  <head>
    <link rel="stylesheet" type="text/css" href="/gsa-style.css"/>
    <link rel="icon" href="/favicon.gif" type="image/x-icon"/>
    <title>IT Schwachstellenampel</title>
    <xsl:choose>
      <xsl:when test="envelope/params/@refresh_interval != ''">
        <meta http-equiv="refresh" content="{envelope/autorefresh/@interval};{/envelope/caller}&amp;token={/envelope/token}" />
      </xsl:when>
      <xsl:when test="not(envelope/params/@refresh_interval != '') and ($task_status != '') and ($task_status != 'Done') and ($task_status != 'Stopped') and ($task_status != 'Paused') and ($task_status != 'Internal Error') and ($task_status != 'New')">
        <meta http-equiv="refresh" content="5;{/envelope/caller}&amp;token={/envelope/token}" />
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
    <xsl:apply-templates select="envelope/autorefresh" mode="html-header-meta" />
  </head>
</xsl:template>


<!-- OMP -->

<xsl:include href="omp.xsl" />

<!-- Login page -->

<xsl:template match="login_page">
    <div class="box" id="login">
      <center>
        <h2>Anmeldung</h2>
        <img src="/img/its_logo.png" alt="" />
        <div style="color: red; padding: 10px">
          <xsl:choose>
            <xsl:when test="message='Successfully logged out.'">
              <xsl:text>Sie haben sich erfolgreich abgemeldet.</xsl:text>
            </xsl:when>
            <xsl:when test="message='Session has expired.  Please login again.'">
              <xsl:text>Sitzung ist abgelaufen.  Bitte melden sie sich erneut an.</xsl:text>
            </xsl:when>
            <xsl:when test="message='Token missing or bad.  Please login again.'">
              <xsl:text>Token fehlt oder ist fehlerhaft.  Bitte melden sie sich erneut an.</xsl:text>
            </xsl:when>
            <xsl:when test="message='Cookie missing or bad.  Please login again.'">
              <xsl:text>Cookie fehlt oder ist fehlerhaft.  Bitte melden sie sich erneut an.</xsl:text>
            </xsl:when>
            <xsl:when test="message='Login failed.'">
              <xsl:text>Anmeldung fehlgeschlagen.</xsl:text>
            </xsl:when>
            <xsl:when test="message='Already logged out.'">
              <xsl:text>Anmeldung bereits erfolgt.</xsl:text>
            </xsl:when>
            <xsl:when test="message='Login failed.  OMP service is down.'">
              <xsl:text>Anmeldung fehlgeschlagen.  OMP-Dienst ist nicht verfügbar.</xsl:text>
            </xsl:when>
            <xsl:when test="message='Login failed.  Error during authentication.'">
              <xsl:text>Anmeldung fehlgeschlagen.  Fehler während der Authentifizierung.</xsl:text>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="message"/>
            </xsl:otherwise>
          </xsl:choose>
        </div>
        <form action="/omp" method="post" enctype="multipart/formdata">
          <input type="hidden" name="cmd" value="login" />
          <xsl:choose>
            <xsl:when test="string-length(url) = 0">
              <input type="hidden" name="text" value="{$main_page_link}" />
            </xsl:when>
            <xsl:otherwise>
              <input type="hidden" name="text" value="{url}" />
            </xsl:otherwise>
          </xsl:choose>
          <table>
            <tr>
              <td style="padding: 5px">Benutzername</td>
              <td><input type="text" autocomplete="off" name="login" value="" autofocus="autofocus"/></td>
            </tr>
            <tr>
              <td style="padding: 5px">Passwort</td>
              <td><input type="password" autocomplete="off" name="password" value="" /></td>
            </tr>
          </table>
          <div style="text-align:center;float:center; padding: 10px"><input type="submit" value="Anmelden" /></div>
          <br clear="all" />
          <div style="text-align:right">IT Schwachstellenampel Version 1.0</div>
        </form>
      </center>
    </div>
</xsl:template>

<!-- ROOT, ENVELOPE -->

<xsl:template match="params">
</xsl:template>

<xsl:template match="caller">
</xsl:template>

<xsl:template match="token">
</xsl:template>

<xsl:template match="login">
</xsl:template>

<xsl:template match="time">
</xsl:template>

<xsl:template match="timezone">
</xsl:template>

<xsl:template match="role">
</xsl:template>

<xsl:template match="help_response">
</xsl:template>

<xsl:template match="help_response" mode="content">
</xsl:template>

<xsl:template match="envelope">
  <div id="header_back">
    <xsl:call-template name="html-its-header"/>
  </div>
  <div id="wrapper">
    <xsl:apply-templates/>
    <xsl:call-template name="html-footer"/>
  </div>
</xsl:template>

<xsl:template name="html-its-header">
  <div id="header">
    <table style="width: 100%" cellspacing="0" cellpadding="0">
      <colgroup>
        <col width="*"/>
        <col width="60"/>
        <col width="70"/>
        <col width="0"/>
      </colgroup>

      <tr>
        <td>
          <xsl:choose>
            <xsl:when test="/envelope/params/cmd = 'wizard_get' and /envelope/params/get_name = 'get_tasks_deep'">
              <a href="/help/info.html?token={/envelope/token}" class="tooltip">
                <img src="/img/its_logo.png"/>
                <span style="width: 300px; margin-top: 20px; margin-left: 15px">
                  <img class="callout" src="/img/callout_blue.gif" />
                  <h3>Über die Anwendung</h3>
                  Die IT Schwachstellenampel ist ein Assistent um die
                  allgemeine Cyber-Sicherheitslage der konkreten Lage im eigenen
                  Hause gegenüberzustellen.<br/>
                  Sie zeigt auf einfache Weise ob Sie von den Gefahren betroffen
                  sind und welcher Handlungsbedarf bei Ihnen besteht.
                  <p><b>[Klick auf Icon für mehr ...]</b></p>
                </span>
              </a>
            </xsl:when>
            <xsl:otherwise>
              <a href="{$main_page_link}&amp;token={/envelope/token}" class="tooltip">
                <img src="/img/its_logo.png"/>
                <span style="margin-top: 20px; margin-left: 15px">
                  <img class="callout" src="/img/callout_blue.gif" />
                  Zurück zur Hauptseite
                </span>
              </a>
            </xsl:otherwise>
          </xsl:choose>
        </td>

        <td>
          <a href="/help/info.html?token={/envelope/token}" class="button tooltip">
            <img src="/img/info.png"/>
            <span style="width: 240px; margin-top: 26px; margin-left: -8px">
              <img class="callout" src="/img/callout_blue.gif" />
              <h3>Über die Anwendung</h3>
              Die IT Schwachstellenampel ist ein Assistent um die
              allgemeine Cyber-Sicherheitslage der konkreten Lage im eigenen
              Hause gegenüberzustellen.<br/>
              Sie zeigt auf einfache Weise ob Sie von den Gefahren betroffen
              sind und welcher Handlungsbedarf bei Ihnen besteht.
              <p><b>[Klick auf Icon für mehr ...]</b></p>
            </span>
          </a>
        </td>

        <td>
          <a href="/help/datensicherheit.html?token={/envelope/token}" class="button tooltip" align="center">
            <img src="/img/datensicherheit.png"/>
            <span style="width: 240px; margin-top: 26px; margin-left: -99px">
              <img class="callout" style="left:114px" src="/img/callout_blue.gif" />
              <h3>Datensicherheit</h3>
              Für die Anwendung der IT Schwachstellenampel wird besonderer Wert
              auf Sicherheit Ihrer Daten gelegt:<br/>
              Zu keinem Zeitpunkt verlassen Informationen über Ihre IT-Umgebung die Anwendung der IT Schwachstellenampel.
              <p><b>[Klick auf Icon für mehr ...]</b></p>
            </span>
          </a>
        </td>

        <td>
          <a href="/logout?token={/envelope/token}" class="button tooltip"><img src="/img/shutdown.png"/>
          <span style="width: 240px; margin-top: 26px; margin-left: -190px"> <img class="callout" style="left: 205px" src="/img/callout_blue.gif" />
          <h3>Abmelden</h3>
          Sie melden sich von der IT Schwachstellenampel ab, setzten die
          Prüfergebnisse aber nicht zurück. Eine laufende Prüfung wird nicht
          abgebrochen sondern wird im Hintergrund weitergeführt.
          Auch Daten des Benutzerkontos
          für das Zielsystem bleiben bis zur nächsten Anmeldung erhalten.
          Diese Daten können durch das Zurücksetzen gelöscht werden.
          </span>
          </a>
        </td>
      </tr>
    </table>
  </div>
</xsl:template>

<xsl:template name="html-footer">
  <div id="footer_logos">
    <hr/>
    <p align="right">IT Schwachstellenampel Version 1.0</p>
  </div>
</xsl:template>

<xsl:template name="connection-icons">
  <xsl:choose>
    <xsl:when test="false()"> <!-- TODO: Test for internet connection -->
      <div id="internet">
        <a href="#" class="tooltip"><img src="/img/internet_on.png"/>
          <span style="width: 240px; margin-top: 20px; margin-left: -12px"> <img class="callout" style="left:50px" src="/img/callout_blue.gif" />
          Eine Verbindung mit dem Internet besteht. Die Anwendung kann aktualisiert werden.</span>
        </a>
        <br/>
        Internet<br/>
        <span class="on">Online</span>
      </div>
    </xsl:when>
    <xsl:otherwise>
      <div id="internet">
        <a href="#" class="tooltip"><img src="/img/internet_off.png"/>
          <span style="width: 240px; margin-top: 20px; margin-left: -12px"> <img class="callout" style="left:50px" src="/img/callout_blue.gif" />
          Ohne Internetverbindung kann die Anwendung nicht aktualisiert werden.</span>
        </a>
        <br/>
        Internet<br/>
        <span class="off">Offline</span>
      </div>
    </xsl:otherwise>
  </xsl:choose>
  <xsl:choose>
    <xsl:when test="true()"> <!-- TODO: Test for network connection -->
      <div id="network">
        <a href="#" class="tooltip"><img src="/img/network_on.png"/>
          <span style="width: 240px; margin-top: 20px; margin-left: -12px"> <img class="callout" style="left:50px" src="/img/callout_blue.gif" />
          Eine Verbindung mit dem Netzwerk besteht. Eine Sicherheits-Prüfung kann ausgeführt werden.</span>
        </a>
        <br/>
        Netzwerk<br/>
        <span class="on">Verbunden</span>
      </div>
    </xsl:when>
    <xsl:otherwise>
      <div id="network">
        <a href="#" class="tooltip"><img src="/img/network_off.png"/>
          <span style="width: 240px; margin-top: 20px; margin-left: -12px"> <img class="callout" style="left:50px" src="/img/callout_blue.gif" />
          Ohne Netzwerkverbindung kann keine Sicherheits-Prüfung ausgeführt werden.</span>
        </a>
        <br/>
        Netzwerk<br/>
        <span class="off">Nicht verbunden</span>
      </div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="update-controls">
  <div align="center">
    <a href="#" class="button tooltip" style="float: left;"> <!-- TODO: Start program update -->
      <img src="/img/update.png"/>
      <span style="width: 240px; margin-top: 26px; margin-left: -99px">
      <img class="callout" style="left:115px" src="/img/callout_blue.gif" />
      <div align="center">Anwendung jetzt aktualisieren.<br/>
      Letzte Aktualisierung:<br/><xsl:value-of select="'1.9.2013 um 12:30'"/> <!-- TODO: Add program update time --> </div></span>
    </a>
  </div>
  <br/>
  <form action="#" method="get">
    <input type="checkbox" name="update" value="yes" style="margin-right: 10px"/>Automatisch
  </form>
  <br/><br/>
</xsl:template>

<xsl:template name="command_result_dialog">
  <xsl:param name="operation">(Operation description is missing)</xsl:param>
  <xsl:param name="status">(Status code is missing)</xsl:param>
  <xsl:param name="msg">(Status message is missing)</xsl:param>
  <xsl:param name="details"></xsl:param>

  <xsl:choose>
    <xsl:when test="$status = '200' or $status = '201' or $status = '202'">
      <span class="debug"><div class="errorbox" style="clear:both"><xsl:value-of select="concat ($operation, ': ', $status, ': ', $msg)"/></div></span>
    </xsl:when>
    <xsl:otherwise>
      <div class="errorbox">
        <xsl:choose>
          <xsl:when test="$operation = ''">
            <h2>Aktion fehlgeschlagen:</h2>
          </xsl:when>
          <xsl:otherwise>
            <h2>Aktion &quot;<xsl:value-of select="$operation"/>&quot; fehlgeschlagen:</h2>
          </xsl:otherwise>
        </xsl:choose>

        <xsl:choose>
          <xsl:when test="$msg = ''"></xsl:when>
          <xsl:when test="$msg = 'Service temporarily down'">
            Der Scanner-Dienst antwortet nicht.<br/>
            Versuchen Sie es bitte erneut oder überprüfen Sie, ob der Scanner-Dienst ordnungsgemäß ausgeführt wird, falls dieses Problem nicht nur vorübergehend auftritt.
          </xsl:when>
          <xsl:when test="$msg = 'Task is active already'">
            Die Überprüfung wurde bereits gestartet.
          </xsl:when>
          <xsl:otherwise>
            Meldung: <xsl:value-of select="$msg"/><br/>
          </xsl:otherwise>
        </xsl:choose>
        <span class="debug"><br/>Ursprüngliche Meldung: <xsl:value-of select="$msg"/></span>
        <br/>
        <xsl:choose>
          <xsl:when test="$status = ''"></xsl:when>
          <xsl:otherwise>
            Status-Code: <xsl:value-of select="$status"/><br/>
          </xsl:otherwise>
        </xsl:choose>

        <xsl:choose>
          <xsl:when test="$details = ''">
          </xsl:when>
          <xsl:otherwise>
            <table><tr><td><xsl:value-of select="$details"/></td></tr></table>
          </xsl:otherwise>
        </xsl:choose>
      </div>
      <div style="clear:both"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- Error dialog -->

<xsl:template name="error_dialog">
  <xsl:param name="title">(Missing title)</xsl:param>
  <xsl:param name="message">(Missing message)</xsl:param>
  <xsl:param name="backurl">/omp?cmd=get_tasks</xsl:param>
  <xsl:param name="token"></xsl:param>
  <center>
    <div class="errorbox" style="width:500px; margin-top:50px">
<!--
      <img src="/img/alert_sign.png" alt="" title="{$title}"
            style="float:left;margin-left:10px;"/>
-->
      <span style="font-size:16px;">
        <div style="font-weight:bold;padding-top:12px;font-size:20px;">
          <xsl:value-of select="$title"/>
        </div>
        <br clear="all"/>
        <xsl:value-of select="$message"/>
      </span>
      <div style="margin-top:10px;">
        Your options (not all may work):<br/>
        'Back' button of browser
        <xsl:choose>
          <xsl:when test="string-length ($token) &gt; 0">
            <!--
            <xsl:choose>
              <xsl:when test="contains ($backurl, '?')">
                | <a href="{$backurl}&amp;token={$token}">Assumed sane state</a>
              </xsl:when>
              <xsl:otherwise>
                | <a href="{$backurl}?token={$token}">Assumed sane state</a>
              </xsl:otherwise>
            </xsl:choose>
            -->
            | <a href="/logout?token={$token}">Logout</a>
          </xsl:when>
          <xsl:otherwise>
            | <a href="/login/login.html">Login</a>
          </xsl:otherwise>
        </xsl:choose>
      </div>
    </div>
  </center>
</xsl:template>

<!-- GSAD_RESPONSE -->

<xsl:template match="gsad_response">
  <xsl:call-template name="error_dialog">
    <xsl:with-param name="title">
      <xsl:value-of select="title"/>
    </xsl:with-param>
    <xsl:with-param name="message">
      <xsl:value-of select="message"/>
    </xsl:with-param>
    <xsl:with-param name="backurl">
      <xsl:value-of select="backurl"/>
    </xsl:with-param>
    <xsl:with-param name="token">
      <xsl:value-of select="token"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>


<xsl:template match="/">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <xsl:call-template name="html-head"/>
    <body>
      <xsl:apply-templates/>
    </body>
  </html>
</xsl:template>

</xsl:stylesheet>
