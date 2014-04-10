<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:str="http://exslt.org/strings"
    xmlns:set="http://exslt.org/sets"
    xmlns:func = "http://exslt.org/functions"
    xmlns:gsa="http://openvas.org"
    xmlns:vuln="http://scap.nist.gov/schema/vulnerability/0.4"
    xmlns:cpe-lang="http://cpe.mitre.org/language/2.0"
    xmlns:scap-core="http://scap.nist.gov/schema/scap-core/0.1"
    xmlns:cve="http://scap.nist.gov/schema/feed/vulnerability/2.0"
    xmlns:cvss="http://scap.nist.gov/schema/cvss-v2/0.2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:patch="http://scap.nist.gov/schema/patch/0.1"
    xmlns:meta="http://scap.nist.gov/schema/cpe-dictionary-metadata/0.2"
    xmlns:ns6="http://scap.nist.gov/schema/scap-core/0.1"
    xmlns:config="http://scap.nist.gov/schema/configuration/0.1"
    xmlns:cpe="http://cpe.mitre.org/dictionary/2.0"
    xmlns:oval="http://oval.mitre.org/XMLSchema/oval-common-5"
    xmlns:oval_definitions="http://oval.mitre.org/XMLSchema/oval-definitions-5"
    xmlns:dfncert="http://www.dfn-cert.de/dfncert.dtd"
    xmlns:atom="http://www.w3.org/2005/Atom"
    xsi:schemaLocation="http://scap.nist.gov/schema/configuration/0.1 http://nvd.nist.gov/schema/configuration_0.1.xsd http://scap.nist.gov/schema/scap-core/0.3 http://nvd.nist.gov/schema/scap-core_0.3.xsd http://cpe.mitre.org/dictionary/2.0 http://cpe.mitre.org/files/cpe-dictionary_2.2.xsd http://scap.nist.gov/schema/scap-core/0.1 http://nvd.nist.gov/schema/scap-core_0.1.xsd http://scap.nist.gov/schema/cpe-dictionary-metadata/0.2 http://nvd.nist.gov/schema/cpe-dictionary-metadata_0.2.xsd"
    xmlns:date="http://exslt.org/dates-and-times"
    xmlns:exslt="http://exslt.org/common"
    extension-element-prefixes="str func date exslt set">
    <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description:
OpenVAS Manager Protocol (OMP) stylesheet for IT-Schwachstellenampel.

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

<!-- Custom functions -->

<func:function name="gsa:match-prefix-list">
  <xsl:param name="string"/>
  <xsl:param name="list"/>
  <xsl:variable name="tally">
    <xsl:for-each select="$list">
      <xsl:if test="starts-with ($string, .)">|</xsl:if>
    </xsl:for-each>
  </xsl:variable>
  <func:result select="string-length ($tally)"/>
</func:function>

<!-- Main page task view -->

<xsl:template match="get_tasks">
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="wizard">
  <div id="main">
    <xsl:apply-templates/>
    <xsl:apply-templates select="get_tasks_deep" mode="main-box"/>
  </div>
</xsl:template>

<xsl:template match="wizard/get_tasks_deep" mode="main-box">
  <xsl:variable name="response" select="../run_wizard_response/response" />
  <xsl:variable name="cmd_response" select="$response/commands_response/commands_response[get_tasks_response/task/name = 'Schwachstellenampel']"/>

  <div class="box content" id="main">
    <xsl:call-template name="task_controls">
      <xsl:with-param name="task" select="$cmd_response/get_tasks_response/task"/>
      <xsl:with-param name="report" select="$cmd_response/get_reports_response/report/report"/>
      <xsl:with-param name="target" select="$cmd_response/get_targets_response/target"/>
      <xsl:with-param name="lsc_credential" select="$cmd_response/get_lsc_credentials_response/lsc_credential"/>
      <xsl:with-param name="ssh_credential" select="$cmd_response/get_lsc_credentials_response/lsc_credential[@id = $cmd_response/get_targets_response/target/ssh_lsc_credential/@id]"/>
      <xsl:with-param name="smb_credential" select="$cmd_response/get_lsc_credentials_response/lsc_credential[@id = $cmd_response/get_targets_response/target/ssh_lsc_credential/@id]"/>
    </xsl:call-template>
  </div>

</xsl:template>

<xsl:template name="task_controls">
  <xsl:param name="task"/>
  <xsl:param name="report"/>
  <xsl:param name="target"/>
  <xsl:param name="lsc_credential"/>
  <xsl:param name="ssh_credential"/>
  <xsl:param name="smb_credential"/>

  <xsl:variable name="configs" select="/envelope/wizard/run_wizard_response/response/commands_response/get_configs_response"/>
  <xsl:variable name="its_config" select="$configs/config[name='ITS-Scankonfiguration']/@id"/>

  <xsl:variable name="task_id">
    <xsl:choose>
      <xsl:when test="$task!=''">
        <xsl:value-of select="$task/@id"/>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="task_status">
    <xsl:choose>
      <xsl:when test="$task!=''">
        <xsl:value-of select="$task/status"/>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="task_progress">
    <xsl:choose>
      <xsl:when test="$task!=''">
        <xsl:value-of select="$task/progress/text()"/>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="task_target">
    <xsl:choose>
      <xsl:when test="$task!=''">
        <xsl:value-of select="$task/target/@id"/>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="target_hosts">
    <xsl:choose>
      <xsl:when test="$target!=''">
        <xsl:value-of select="$target/hosts"/>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="target_ssh_login">
    <xsl:choose>
      <xsl:when test="$ssh_credential!=''">
        <xsl:value-of select="$ssh_credential/login"/>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="last_report">
    <xsl:choose>
      <xsl:when test="/envelope/params/report_id != ''">
        <xsl:value-of select="/envelope/params/report_id"/>
      </xsl:when>
      <xsl:when test="$task!='' and $task/last_report/report/@id">
        <xsl:value-of select="$task/last_report/report/@id"/>
      </xsl:when>
      <xsl:when test="$task!=''">
        <xsl:value-of select="$task/reports/report/@id"/>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="vulns" select="$report/results/result[severity >= 4.0]"/>
  <xsl:variable name="critical_vulns" select="$report/results/result[severity >= 7.0]"/>

  <h1>Steuerung für Sicherheits-Prüfung</h1>

  <xsl:if test="not ($its_config)">
    <div class="errorbox">
      <h4>Warnung: Die ITS-Scankonfiguration wurde nicht gefunden.</h4>
      Ersatzweise wird eine Standard-Konfiguration mit etwas längeren
      Laufzeiten verwendet.
    </div>
  </xsl:if>
  
  <div id="controls">
    <span class="debug">
      task id: <xsl:value-of select="$task_id"/> <br/>
      last report: <xsl:value-of select="$last_report"/>
    </span>

    <div class="innerbox" style="width:100px; margin: 1px 2px 0px 0px; float:right; background:#ffffff">
      <center>
        <xsl:call-template name="status-lights">
          <xsl:with-param name="report" select="$report"/>
          <xsl:with-param name="vulns" select="$vulns"/>
          <xsl:with-param name="critical_vulns" select="$critical_vulns"/>
        </xsl:call-template>
      </center>
    </div>

    <!-- Start button -->
    <xsl:choose>
      <!-- No existing task -->
      <xsl:when test="$task_id = ''">
        <form name="start_new_task" method="post" enctype="multipart/form-data">
          <xsl:call-template name="target_data_input">
            <xsl:with-param name="enabled" select="1"/>
            <xsl:with-param name="target_hosts" select="''"/>
            <xsl:with-param name="target_ssh_login" select="$target_ssh_login"/>
          </xsl:call-template>
          <input type="hidden" name="event_data:task_name" value="Schwachstellenampel"/>
          <input type="hidden" name="event_data:comment" value="Automatisch generiert durch IT Schwachstellenampel"/>
          <input type="hidden" name="event_data:lsc_credential_name" value="Schwachstellenampel-Anmeldedaten"/>
          <input type="hidden" name="event_data:target_name" value="Schwachstellenampel-Zielsystem"/>
          <xsl:choose>
            <xsl:when test="$its_config">
              <input type="hidden" name="event_data:config_id" value="{$its_config}"/>
            </xsl:when>
            <xsl:otherwise>
              <input type="hidden" name="event_data:config_id" value="daba56c8-73ec-11df-a475-002264764cea"/>
            </xsl:otherwise>
          </xsl:choose>
          <input type="hidden" name="token" value="{/envelope/token}"/>
          <input type="hidden" name="caller" value="{/envelope/caller}"/>
          <input type="hidden" name="cmd" value="run_wizard"/>
          <input type="hidden" name="name" value="quick_auth_scan"/>
          <input type="hidden" name="next" value="wizard_get"/>
          <input type="hidden" name="get_name" value="get_tasks_deep"/>
          <input type="hidden" name="event_data:name" value="Schwachstellenampel"/>
          <input type="hidden" name="event_data:include_configs" value="1"/>
          <input type="hidden" name="event_data:include_report_formats" value="1"/>
          <a href="#" onclick="if (document.getElementsByName ('event_data:hosts')[0].value.replace (/^\s+|\s+$/g, '') != '') document.start_new_task.submit(); else alert('Bitte geben Sie den Namen oder die IP-Adresse des zu prüfenden Systems ein!');" class="button play tooltip">&#9658;
            <span style="width: 100px; margin-top: 18px; margin-left: -17px">
              <img class="callout" style="left:21px" src="/img/callout_blue.gif" />
              Prüfung starten.
            </span>
          </a>
        </form>
      </xsl:when>
      <!-- Continue / restart stopped task -->
      <xsl:when test="($task_status='Stopped' or $task_status='New' or $task_status='Done')">
        <form name="start_task_{translate($task_id, '-', '_')}" method="post" enctype="multipart/form-data">
          <xsl:call-template name="target_data_input">
            <xsl:with-param name="enabled" select="0"/>
            <xsl:with-param name="target_hosts" select="$target_hosts"/>
            <xsl:with-param name="target_ssh_login" select="$target_ssh_login"/>
          </xsl:call-template>
          <input type="hidden" name="token" value="{/envelope/token}"/>
          <input type="hidden" name="caller" value="{/envelope/caller}"/>
          <input type="hidden" name="cmd" value="run_wizard"/>
          <input type="hidden" name="name" value="reset_task"/>
          <input type="hidden" name="event_data:task_id" value="{$task_id}"/>
          <input type="hidden" name="event_data:next_action" value="start"/>
          <input type="hidden" name="next" value="wizard_get"/>
          <input type="hidden" name="get_name" value="get_tasks_deep"/>
          <input type="hidden" name="event_data:name" value="Schwachstellenampel"/>
          <input type="hidden" name="event_data:include_configs" value="1"/>
          <input type="hidden" name="event_data:include_report_formats" value="1"/>
          <a href="#" onclick="document.start_task_{translate($task_id, '-', '_')}.submit();" class="button play tooltip">&#9658;
            <span style="width: 120px; margin-top: 18px; margin-left: -17px">
              <img class="callout" style="left:21px" src="/img/callout_blue.gif" />
              Prüfung neu starten.
            </span>
          </a>
        </form>
      </xsl:when>
      <!-- Task cannot be started -->
      <xsl:otherwise>
        <form>
          <xsl:call-template name="target_data_input">
            <xsl:with-param name="enabled" select="0"/>
            <xsl:with-param name="target_hosts" select="$target_hosts"/>
            <xsl:with-param name="target_ssh_login" select="$target_ssh_login"/>
          </xsl:call-template>
        </form>
        <a href="#" class="button play greyed tooltip">&#9658;
          <span style="width: 200px; margin-top: 18px; margin-left: -17px">
            <img class="callout" style="left:21px" src="/img/callout_blue.gif" />
            <xsl:choose>
              <xsl:when test="not ($its_config)">Fehler: Die ITS-Scankonfiguration wurde nicht gefunden.</xsl:when>
              <xsl:when test="$task_target=''">Fehler: Ziel der Prüfung ist nicht definiert.</xsl:when>
              <xsl:when test="$task_status='Stop Requested' or $task_status='Pause Requested' or $task_status='Stop Waiting' or $task_status='Pause Waiting'">Prüfung wird bereits angehalten.</xsl:when>
              <xsl:when test="$task_status='Requested' or $task_status='Resume Requested' or $task_status='Resume Waiting'">Prüfung wird gerade gestartet.</xsl:when>
              <xsl:when test="$task_status='Running'">Prüfung läuft bereits.</xsl:when>
              <xsl:when test="$task_status='Done'">Prüfung ist bereits abgeschlossen.<br/>Bitte setzen Sie die Ergebnisse zurück, bevor sie eine neue Prüfung starten.</xsl:when>
              <xsl:otherwise>Prüfung kann nicht gestartet werden.</xsl:otherwise>
            </xsl:choose>
          </span>
        </a>
      </xsl:otherwise>
    </xsl:choose>

    <!-- Stop button -->
    <xsl:choose>
      <xsl:when test="$task_status = 'Running' or $task_status='Paused'">
        <form name="stop_task_{translate($task_id, '-', '_')}" method="post" enctype="multipart/form-data">
          <input type="hidden" name="token" value="{/envelope/token}"/>
          <input type="hidden" name="caller" value="{/envelope/caller}"/>
          <input type="hidden" name="cmd" value="stop_task"/>
          <input type="hidden" name="task_id" value="{$task_id}"/>
          <input type="hidden" name="next" value="wizard_get"/>
          <input type="hidden" name="get_name" value="get_tasks_deep"/>
          <input type="hidden" name="event_data:name" value="Schwachstellenampel"/>
          <input type="hidden" name="event_data:include_configs" value="1"/>
          <input type="hidden" name="event_data:include_report_formats" value="1"/>
          <!-- TODO replace submit with script-free version -->
          <a href="#" onclick="document.stop_task_{translate($task_id, '-', '_')}.submit();" class="button stop tooltip">&#9632;
            <span style="width: 100px; margin-top: 18px; margin-left: -17px">
              <img class="callout" style="left:21px" src="/img/callout_blue.gif" />
              Prüfung abbrechen.
            </span>
          </a>
        </form>
      </xsl:when>
      <xsl:otherwise>
        <a href="#" class="button stop greyed tooltip">&#9632;
          <span style="width: 200px; margin-top: 18px; margin-left: -17px">
            <img class="callout" style="left:21px" src="/img/callout_blue.gif" />
            <xsl:choose>
              <xsl:when test="$task='' or $task_status='New'">Prüfung wurde noch nicht gestartet.</xsl:when>
              <xsl:when test="$task_status='Done'">Prüfung ist bereits abgeschlossen.</xsl:when>
              <xsl:when test="$task_status='Stopped'">Prüfung wurde bereits angehalten.</xsl:when>
              <xsl:when test="$task_status='Stop Requested' or $task_status='Pause Requested' or $task_status='Stop Waiting' or $task_status='Pause Waiting'">Prüfung wird bereits angehalten.</xsl:when>
              <xsl:when test="$task_status='Requested' or $task_status='Resume Requested' or $task_status='Resume Waiting'">Prüfung wird gerade gestartet.</xsl:when>
              <xsl:otherwise>Prüfung kann momentan nicht angehalten werden.</xsl:otherwise>
            </xsl:choose>
          </span>
        </a>
      </xsl:otherwise>
    </xsl:choose>

    <!-- Clear button -->
    <xsl:choose>
      <xsl:when test="$task_status='Stopped' or $task_status ='Done' or $task_status ='New'">
        <form name="clear_reports_{translate($task_id, '-', '_')}" method="post" enctype="multipart/form-data">
          <input type="hidden" name="token" value="{/envelope/token}"/>
          <input type="hidden" name="caller" value="{/envelope/caller}"/>
          <input type="hidden" name="cmd" value="run_wizard"/>
          <input type="hidden" name="name" value="delete_task_deep"/>
          <input type="hidden" name="event_data:task_id" value="{$task_id}"/>
          <input type="hidden" name="next" value="wizard_get"/>
          <input type="hidden" name="get_name" value="get_tasks_deep"/>
          <input type="hidden" name="event_data:name" value="Schwachstellenampel"/>
          <input type="hidden" name="event_data:include_configs" value="1"/>
          <input type="hidden" name="event_data:include_report_formats" value="1"/>
          <input type="hidden" name="event_data:ultimate" value="1"/>
          <!-- TODO replace submit with script-free version -->
          <a href="#" onclick="document.clear_reports_{translate($task_id, '-', '_')}.submit();" class="button clear tooltip">X
            <span style="width: 100px; margin-top: 18px; margin-left: -17px">
              <img class="callout" style="left:21px" src="/img/callout_blue.gif" />
              Prüfergebnisse zurücksetzen.
            </span>
          </a>
        </form>
      </xsl:when>
      <xsl:otherwise>
        <a href="#" class="button clear greyed tooltip">X
          <span style="width: 200px; margin-top: 18px; margin-left: -17px">
            <img class="callout" style="left:21px" src="/img/callout_blue.gif" />
            <xsl:choose>
              <xsl:when test="$task_status='Running'">Prüfung läuft gerade.</xsl:when>
              <xsl:when test="$task_status='Requested' or $task_status='Resume Requested' or $task_status='Resume Waiting'">Prüfung wird gerade gestartet.</xsl:when>
              <xsl:when test="$task_status='Stop Requested' or $task_status='Pause Requested' or $task_status='Stop Waiting' or $task_status='Pause Waiting'">Prüfung wird bereits angehalten.</xsl:when>
              <xsl:otherwise>Ergebnis kann momentan nicht zurückgesetzt werden.</xsl:otherwise>
            </xsl:choose>
          </span>
        </a>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:call-template name="progress-bar">
      <xsl:with-param name="progress" select="$task_progress"/>
      <xsl:with-param name="status" select="$task_status"/>
    </xsl:call-template>
  </div>

  <hr style="clear:both; padding-top:15px;"/>

  <xsl:call-template name="status-text">
    <xsl:with-param name="report" select="$report"/>
    <xsl:with-param name="verbose" select="1"/>
    <xsl:with-param name="ssh_credential" select="$ssh_credential"/>
    <xsl:with-param name="smb_credential" select="$smb_credential"/>
    <xsl:with-param name="vulns" select="$vulns"/>
    <xsl:with-param name="critical_vulns" select="$critical_vulns"/>
  </xsl:call-template>

  <xsl:if test="$report != '' and ($task_status = 'Done' or $task_status = 'Stopped')">
    <xsl:variable name="report_formats" select="/envelope/wizard/run_wizard_response/response/commands_response/get_report_formats_response"/>
    <xsl:variable name="its_report_format" select="$report_formats/report_format[name='ITS PDF' and active != 0 and trust/text() = 'yes']/@id"/>
    <xsl:if test="not ($its_report_format)">
      <div class="errorbox">
        <h4>Warnung: Das ITS-Berichtformat kann nicht verwendet werden.</h4>
        <xsl:choose>
          <xsl:when test="not ($report_formats/report_format[name='ITS PDF'])">
            Es wurde kein Berichtformat mit dem Namen "ITS PDF" gefunden.<br/>
          </xsl:when>
          <xsl:when test="$report_formats/report_format[name='ITS PDF'] and $report_formats/report_format[name='ITS PDF']/trust/text() != 'yes'">
            Es existiert zwar ein Berichtformat mit dem Namen "ITS PDF", aber dieses wurde nicht als vertrauenswürdig erkannt.<br/>
          </xsl:when>
          <xsl:when test="$report_formats/report_format[name='ITS PDF'] and $report_formats/report_format[name='ITS PDF']/active = 0">
            Es existiert zwar ein Berichtformat mit dem Namen "ITS PDF", aber dieses ist nicht aktiv.<br/>
          </xsl:when>
        </xsl:choose>
        Ersatzweise wird ein neutrales PDF-Dokument in englischer Sprache verwendet.<br/>
      </div>
    </xsl:if>

    <table>
      <colgroup>
        <col width="*"/>
        <col width="60"/>
        <col width="*"/>
      </colgroup>
      <tr>
        <td style="padding-right: 5px" class="debug">
          <a href="/omp?cmd=get_report&amp;report_id={$report/@id}&amp;token={/envelope/token}" class="button tooltip" align="center">
            <img src="/img/details.png" width="42" height="42"/>
            <span style="width: 240px; margin-top: 26px; margin-left: -8px">
              <img class="callout" style="" src="/img/callout_blue.gif" />
              <h3>Detailansicht</h3>
            </span>
          </a>
        </td>
        <td>
          <div class="tooltip">
            <form>
              <input type="hidden" name="token" value="{/envelope/token}"/>
              <input type="hidden" name="cmd" value="get_report"/>
              <input type="hidden" name="report_id" value="{$report/@id}"/>
              <input type="hidden" name="first_result" value="1"/>
              <input type="hidden" name="max_results" value="-1"/>
              <input type="hidden" name="notes" value="1"/>
              <input type="hidden" name="overrides" value="1"/>
              <input type="hidden" name="result_hosts_only" value="0"/>
              <input type="hidden" name="levels" value="hm"/>
              <input type="hidden" name="autofp" value="0"/>
              <xsl:choose>
                <xsl:when test="$its_report_format">
                  <input type="hidden" name="report_format_id" value="{$its_report_format}"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="hidden" name="report_format_id" value="c402cc3e-b531-11e1-9163-406186ea4fc5"/>
                </xsl:otherwise>
              </xsl:choose>
              <input type="image"
                    name="submit"
                    src="/img/printer.png"
                    border="0"
                    class="button">
              </input>
              <span style="width: 240px; margin-top: 19px; margin-left: 0px">
                  <img class="callout" style="" src="/img/callout_blue.gif" />
                  <h3>Bericht zum Drucken öffnen</h3>
                  Der Bericht wird im PDF-Format erstellt und kann eingesehen,
                  verschickt oder ausgedruckt werden.
              </span>
            </form>
          </div>
        </td>
        <td width="100%">
        </td>
      </tr>
    </table>
  </xsl:if>

</xsl:template>

<xsl:template name="target_data_input">
  <xsl:param name="enabled"/>
  <xsl:param name="target_hosts"/>
  <xsl:param name="target_ssh_login"/>
  <xsl:param name="target_smb_login"/>

  <div style="width: 335px; text-align: right">
    <p>
      <a style="margin-right: 20px" href="#" class="tooltip">Zu prüfendes System:
      <span style="width: 300px; margin-top: 15px; margin-left: 77px"> <img class="callout" src="/img/callout_blue.gif" />
      Das zu prüfende System kann als IP-Adresse oder mit Namen angegeben werden.
      Also beispielsweise "192.168.0.1" oder "www.example.com".<br/>

<!-- only activate this once it is indeed the case:
      Voreingestellt ist die IP-Adresse des Rechners vom dem aus Sie gerade auf die
      Anwendung zugreifen. Also der Rechner auf dem Ihr Web-Browser läuft falls
      keine Netzwerkregeln etwas anderes einsetzen.
-->

      Geben Sie aber kein System an welches nicht in Ihren Verantwortungsbereich fällt.

      </span></a>
      <xsl:choose>
        <xsl:when test="$enabled != 0">
          <input class="inputfield" name="event_data:hosts" value="{$target_hosts}" type="text" size="20" maxlength="20" tabindex="1"/>
        </xsl:when>
        <xsl:otherwise>
          <input class="inputfield" disabled="1" name="event_data:hosts" value="{$target_hosts}" type="text" size="20" maxlength="20" tabindex="1"/>
        </xsl:otherwise>
      </xsl:choose>
    </p>

    <p>
      <a style="margin-right: 20px" href="#" class="tooltip">Benutzername:
      <span style="width: 300px; margin-top: 15px; margin-left: 77px"> <img class="callout" src="/img/callout_blue.gif" />
      Dieses Benutzerkonto auf dem zu prüfenden System wird dazu verwendet
      um das Zielystem "von innen" zu analysieren und bedrohte
      Produkte zu identifizieren.<br/>
      Die Aussagekraft der Prüfergebnisse steigt erheblich bei der Verwendung
      eines Benutzerkontos.<br/>
      Für Windows-Systeme ist ein Administrator-Konto notwendig, bei Unix-Systemen
      reicht ein nicht-privilegiertes Benutzerkonto. </span></a>
      <xsl:choose>
        <xsl:when test="$enabled != 0">
          <input class="inputfield" name="event_data:username" value="{$target_ssh_login}" type="text" size="20" maxlength="20" tabindex="2"/>
        </xsl:when>
        <xsl:otherwise>
          <input class="inputfield" disabled="1" name="event_data:username" value="{$target_ssh_login}" type="text" size="20" maxlength="20" tabindex="2"/>
        </xsl:otherwise>
      </xsl:choose>
    </p>

    <p>
      <a style="margin-right: 20px" href="#" class="tooltip">Passwort:
      <span style="width: 300px; margin-top: 15px; margin-left: 77px"> <img class="callout" src="/img/callout_blue.gif" />
      Das Passwort wird zeitweise in der Anwendung zwischengespeichert.
      Es wird gelöscht sobald Sie die Prüfergebnisse zurücksetzen.</span></a>
      <xsl:choose>
        <xsl:when test="$enabled != 0">
          <input class="inputfield" name="event_data:password" value="" type="password" size="20" maxlength="20" tabindex="3"/>
        </xsl:when>
        <xsl:otherwise>
          <input class="inputfield" disabled="1" name="event_data:password" value="" type="password" size="20" maxlength="20" tabindex="3"/>
        </xsl:otherwise>
      </xsl:choose>
    </p>
  </div>
</xsl:template>

<xsl:template name="progress-bar">
  <xsl:param name="status"></xsl:param>
  <xsl:param name="progress"></xsl:param>
  <xsl:param name="width">300</xsl:param>

  <xsl:variable name="show_progress">
    <xsl:choose>
      <xsl:when test="$status = 'New' or $status=''">0</xsl:when>
      <xsl:when test="$status = 'Done'">100</xsl:when>
      <xsl:otherwise><xsl:value-of select="$progress"/></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="show_status">
    <xsl:choose>
      <xsl:when test="$status = ''">Noch nicht gestartet</xsl:when>
      <xsl:when test="$status = 'Delete Requested'">Wird gelöscht</xsl:when>
      <xsl:when test="$status = 'Done'">Abgeschlossen</xsl:when>
      <xsl:when test="$status = 'New'">Noch nicht gestartet</xsl:when>
      <xsl:when test="$status = 'Requested'">Wird gestartet</xsl:when>
      <xsl:when test="$status = 'Running'">Läuft gerade</xsl:when>
      <xsl:when test="$status = 'Pause Requested'">Wird angehalten</xsl:when>
      <xsl:when test="$status = 'Pause Waiting'">Wird angehalten</xsl:when>
      <xsl:when test="$status = 'Paused'">Angehalten</xsl:when>
      <xsl:when test="$status = 'Resume Requested'">Wird fortgesetzt</xsl:when>
      <xsl:when test="$status = 'Resume Waiting'">Wird fortgesetzt</xsl:when>
      <xsl:when test="$status = 'Stop Requested'">Wird angehalten</xsl:when>
      <xsl:when test="$status = 'Stop Waiting'">Wird angehalten</xsl:when>
      <xsl:when test="$status = 'Stopped'">Angehalten</xsl:when>
      <xsl:when test="$status = 'Internal Error'">Interner Fehler</xsl:when>
      <xsl:when test="$status = 'Ultimate Delete Requested'">Wird gelöscht</xsl:when>
      <xsl:when test="$status = 'Delete Waiting'">Wird gelöscht</xsl:when>
      <xsl:when test="$status = 'Ultimate Delete Waiting'">Wird gelöscht</xsl:when>
      <xsl:otherwise>!<xsl:value-of select="$status"/>!</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <div class="progress" style="width:{$width}px;">
    <xsl:if test="$show_progress &gt; 0"><p style="width:{$show_progress div 100 * $width}px;"/></xsl:if>
    <span title="{$status}|{$progress}"><xsl:value-of select="$show_status"/><xsl:if test="$progress &gt;= 0"> (<xsl:value-of select="$show_progress"/>%)</xsl:if></span>
  </div>
</xsl:template>

<!-- Main page status image and text -->

<xsl:template name="status-lights-img">
  <xsl:param name="src" select="'/img/tl_off_off_off.png'"/>
  <xsl:param name="tooltip" select="''"/>
  <a href="#" class="tooltip">
    <img src="{$src}"/>
    <span style="width: 280px; margin-top: 18px; margin-left: -192px">
      <img class="callout" style="left:225px" src="/img/callout_blue.gif" />
      <xsl:copy-of select="$tooltip"/>
    </span>
  </a>
</xsl:template>

<xsl:template name="status-lights">
  <xsl:param name="report"/>
  <xsl:param name="vulns"/>
  <xsl:param name="critical_vulns"/>

  <xsl:variable name="err_no_results" select="$report and $report/result_count/full = 0 and $report/scan_run_status = 'Done'"/>

  <xsl:call-template name="status-lights-img">
    <xsl:with-param name="src">
      <xsl:choose>
        <xsl:when test="$err_no_results">/img/tl_off_off_off.png</xsl:when>
        <xsl:when test="not ($report != '')">/img/tl_off_off_off.png</xsl:when>
        <xsl:when test="$report/scan_run_status = 'Done' or $report/scan_run_status = 'Stopped'">
          <xsl:choose>
            <xsl:when test="count($critical_vulns) > 0">/img/tl_on_off_off.png</xsl:when>
            <xsl:when test="count($vulns) > 0">/img/tl_off_on_off.png</xsl:when>
            <xsl:otherwise>/img/tl_off_off_on.png</xsl:otherwise>
          </xsl:choose>
        </xsl:when>
        <xsl:otherwise>
          <xsl:choose>
            <xsl:when test="count($critical_vulns) > 0">/img/tl_flash_off_off.gif</xsl:when>
            <xsl:when test="count($vulns) > 0">/img/tl_flash_on_off.gif</xsl:when>
            <xsl:otherwise>/img/tl_flash_flash_flash.gif</xsl:otherwise>
          </xsl:choose>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:with-param>
    <xsl:with-param name="tooltip">
      <xsl:call-template name="status-text">
        <xsl:with-param name="report" select="$report"/>
        <xsl:with-param name="vulns" select="$vulns"/>
        <xsl:with-param name="critical_vulns" select="$critical_vulns"/>
        <xsl:with-param name="header_elem" select="'h4'"/>
      </xsl:call-template>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template name="status-text">
  <xsl:param name="report"/>
  <xsl:param name="vulns" select="''"/>
  <xsl:param name="critical_vulns" select="''"/>
  <xsl:param name="ssh_credential"/>
  <xsl:param name="smb_credential"/>
  <xsl:param name="verbose" select="0"/>
  <xsl:param name="header_elem" select="'h3'"/>

  <xsl:variable name="err_no_results">
    <xsl:choose>
      <xsl:when test="$report and $report/result_count/full = 0 and $report/scan_run_status = 'Done'">1</xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Basic scan status and vulnerability counts -->
  <xsl:choose>
    <xsl:when test="$err_no_results != 0">
      <xsl:element name="{$header_elem}">Es ist ein Fehler aufgetreten.</xsl:element>
    </xsl:when>
    <xsl:when test="not($report != '') or $report/scan_run_status = 'New'">
      Die Überprüfung wurde noch nicht gestartet.
    </xsl:when>
    <xsl:when test="$report/scan_run_status = 'Done'">
      <xsl:element name="{$header_elem}">Überprüfung abgeschlossen. Ergebnis:</xsl:element>
    </xsl:when>
    <xsl:when test="$report/scan_run_status = 'Stopped'">
      <xsl:element name="{$header_elem}">Überprüfung angehalten. Zwischenergebnis:</xsl:element>
    </xsl:when>
    <xsl:when test="$report/scan_run_status != 'Done' and $report/scan_run_status != 'Stopped'">
      <xsl:element name="{$header_elem}">Überprüfung läuft. Zwischenergebnis:</xsl:element>
    </xsl:when>
    <xsl:otherwise>
      <xsl:element name="{$header_elem}">Es ist ein Fehler aufgetreten.</xsl:element>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:if test="$report != '' and $report/scan_run_status != 'New' and $err_no_results = 0">
    <p>
      <xsl:choose>
        <xsl:when test="count($critical_vulns) > 0">
          Kritische Schwachstellen: <xsl:value-of select="count($critical_vulns)"/><br/>
          Schwachstellen insgesamt: <xsl:value-of select="count($vulns)"/>
        </xsl:when>
        <xsl:when test="count($vulns) > 0">
          Kritische Schwachstellen: keine<br/>
          Schwachstellen insgesamt: <xsl:value-of select="count($vulns)"/>
        </xsl:when>
        <xsl:otherwise>
          Es wurden <xsl:if test="$report/scan_run_status != 'Done'">bisher</xsl:if> keine Schwachstellen gefunden.
        </xsl:otherwise>
      </xsl:choose>
    </p>
  </xsl:if>

  <xsl:if test="$verbose">
    <xsl:variable name="apos">'</xsl:variable>
    <xsl:variable name="unresolved" select="$report/errors/error[description=concat('Couldn', $apos ,'t resolve hostname.')]"/>

    <xsl:choose>
      <xsl:when test="$err_no_results != 0 and $report">
        <xsl:choose>
          <xsl:when test="count($unresolved) &gt; 0">
            <h4>Fehler: System nicht erreichbar</h4>
            <p>Das von ihnen angegebene System konnte nicht geprüft werden, da es unter dem von Ihnen angegebenen Namen nicht erreichbar ist. (Auflösung des Hostnamen fehlgeschlagen für:
            <xsl:for-each select="$unresolved/host"><xsl:value-of select="."/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>)</p>
          </xsl:when>
          <xsl:otherwise>
            <h4>Fehler: keine Prüfergebnisse verfügbar</h4>
            <p>Das von ihnen angegebene System konnte nicht geprüft werden, da ein unerwarteter Fehler aufgetreten ist.</p>
            <!-- TODO: link to error report -->
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <span class="debug"><xsl:value-of select="$report/result_count/full/text()"/> Ergebnisse.</span>
      </xsl:otherwise>
    </xsl:choose>

    <!-- Login check -->

    <xsl:if test="$report">

      <xsl:variable name="ssh_logins" select="$report/results/result[nvt/@oid='1.3.6.1.4.1.25623.1.0.90022']"/>
      <xsl:variable name="smb_logins" select="$report/results/result[nvt/@oid='1.3.6.1.4.1.25623.1.0.10394']"/>

      <xsl:variable name="failed_ssh_logins" select="$ssh_logins [starts-with (description, 'It was not possible to login using the provided SSH credentials.')]"/>
      <xsl:variable name="failed_smb_logins" select="$smb_logins [starts-with (description, 'It was not possible to log into the remote host using the SMB protocol.')]"/>

      <xsl:variable name="successful_ssh_logins" select="$ssh_logins [starts-with (description, 'It was possible to login using the provided SSH credentials.')]"/>
      <xsl:variable name="successful_smb_logins" select="$smb_logins [starts-with (description, 'It was possible to log into the remote host using the SMB protocol.')]"/>

      <xsl:variable name="hosts" select="$report/host"/>
      <xsl:variable name="ssh_hosts" select="$hosts[ip = $ssh_logins/host]"/>
      <xsl:variable name="smb_hosts" select="$hosts[ip = $smb_logins/host]"/>

      <xsl:variable name="unknown_login_hosts" select="$hosts[not(ip = $successful_ssh_logins/host or ip = $successful_smb_logins/host or $failed_ssh_logins/host or $failed_smb_logins/host)]"/>
      <xsl:variable name="failed_login_hosts" select="$hosts[((ip = $failed_ssh_logins/host) and not (ip = $successful_smb_logins)) or ((ip = $failed_smb_logins/host) and not (ip = $successful_ssh_logins/host))]"/>

      <xsl:if test="count($failed_login_hosts) and ($ssh_credential or $smb_credential)">
        <h4>Warnung: Fehlgeschlagener Login</h4>
        Der Login für
        <xsl:for-each select="$failed_login_hosts">
          <xsl:value-of select="./ip"/>
          <xsl:if test="position() != last()">, </xsl:if>
        </xsl:for-each>
        ist fehlgeschlagen. Bitte stellen sie sicher, dass die eingegebenen Benutzerdaten sowie die SSH- bzw. SMB-Konfiguration korrekt sind.
      </xsl:if>

      <xsl:if test="($report/scan_run_status = 'Done') and count($unknown_login_hosts) and ($ssh_credential or $smb_credential)">
        <h4>Warnung: Unbekannter Login-Status</h4>
        Es liegen keine Ergebnisse über den Login-Versuch für
        <xsl:for-each select="$failed_login_hosts">
          <xsl:value-of select="./ip"/>
          <xsl:if test="position() != last()">, </xsl:if>
        </xsl:for-each>
        vor, obwohl der Scan abgeschlossen wurde. Bitte stellen sie sicher, dass die eingegebenen Benutzerdaten sowie die SSH- bzw. SMB-Konfiguration korrekt sind.
      </xsl:if>

      <p>
        <xsl:choose>
          <xsl:when test="$ssh_credential and $smb_credential">
            <span class="debug">SSH- und SMB-Anmeldedaten vorhanden.<br/></span>
          </xsl:when>
          <xsl:when test="$ssh_credential">
            Es wurde nur die Anmeldung via SSH versucht.<br/>
          </xsl:when>
          <xsl:when test="$ssh_credential">
            Es wurde nur die Anmeldung via SMB versucht.<br/>
          </xsl:when>
          <xsl:otherwise>
            <h4>Hinweis: Anmeldedaten fehlen</h4>
            Beachten Sie, dass die Aussagekraft erheblich ansteigt wenn Sie
            für die Prüfung einen Zugang mit administrativen Rechten verwenden.
            Nur dann kann das Zielsystem "von innen" analysiert und die
            bedrohten Produkte identifiziert werden die selbst nicht als Dienst
            arbeiten (Browser, Office, etc).
          </xsl:otherwise>
        </xsl:choose>
      </p>
    </xsl:if>

  </xsl:if>

</xsl:template>

<!-- Report -->

<xsl:template name="report_box">
  <xsl:param name="vendor_data"/>
  <xsl:param name="report"/>

  <xsl:variable name="cves_string">
    <xsl:for-each select="$report/results/result[threat != 'Log' and threat != 'False Positive']/nvt/cve"><xsl:value-of select="."/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>
  </xsl:variable>
  <xsl:variable name="cves_split" select="str:tokenize ($cves_string, ', ')"/>
  <xsl:variable name="report_cpes" select="$report/host/detail[name='App' or name='OS']/value"/>

  <div class="box" style="width: 780px">
    <div id="_ampel_details">
      <table class="border_table">
        <colgroup>
          <col width="*"/><col width="110"/><col width="110"/><col width="110"/><col width="110"/><col width="110"/><col width="110"/>
        </colgroup>
        <thead>
          <tr>
            <th colspan="7" class="header"><xsl:value-of select="$vendor_data/name"/></th>
          </tr>
          <tr>
            <th rowspan="2" class="left space">Produktname</th>
            <th colspan="2">Vom Hersteller geschlossene Schwachstellen</th>
            <th colspan="2">Seitens Hersteller noch offene Schwachstellen</th>
            <th rowspan="2">Bewertung</th>
            <th rowspan="2">Prüfergebnis</th>
          </tr>
          <tr>
            <th>insgesamt</th>
            <th>davon kritisch</th>
            <th>insgesamt</th>
            <th>davon kritisch</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="product">
            <xsl:call-template name="product_row">
              <xsl:with-param name="product" select="."/>
              <xsl:with-param name="report_cves" select="$cves_split"/>
              <xsl:with-param name="report_cpes" select="$report_cpes"/>
            </xsl:call-template>
          </xsl:for-each>

          <xsl:variable name="open_count" select="count(product/open/cve[cvss >= 4.0])"/>
          <xsl:variable name="open_critical_count" select="count(product/open/cve[cvss >= 7.0])"/>

          <xsl:variable name="all_vulns" select="(product/open/cve[cvss >= 4.0]/text() | product/closed/cve[cvss >= 4.0]/text())"/>
          <xsl:variable name="critical_vulns" select="(product/open/cve[cvss >= 7.0]/text() | product/closed/cve[cvss >= 7.0]/text())"/>


          <xsl:variable name="found" select="$all_vulns[$cves_split = .]"/>
          <xsl:variable name="found_critical" select="$critical_vulns[$cves_split = .]"/>

          <xsl:variable name="cpes" select="product/cpe/text()"/>
          <xsl:variable name="found_cpe_tally">
            <xsl:for-each select="$report_cpes">
              <xsl:if test="gsa:match-prefix-list (., $cpes)">|</xsl:if>
            </xsl:for-each>
          </xsl:variable>
          <xsl:variable name="found_cpes" select="string-length ($found_cpe_tally)"/>

          <tr class="highlight">
            <td colspan="3" class="main">Gesamtbewertung offener Schwachstellen</td>
            <td><xsl:value-of select="$open_count"/></td>
            <td><xsl:value-of select="$open_critical_count"/></td>
            <td>
              <xsl:call-template name="rating_image">
                <xsl:with-param name="open_count" select="$open_count"/>
                <xsl:with-param name="open_critical_count" select="$open_critical_count"/>
                <xsl:with-param name="found_cpes" select="'1'"/>
              </xsl:call-template>
            </td>
            <td>
              <xsl:call-template name="rating_image">
                <xsl:with-param name="open_count" select="count($found)"/>
                <xsl:with-param name="open_critical_count" select="count($found_critical)"/>
                <xsl:with-param name="found_cpes" select="$found_cpes"/>
              </xsl:call-template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template name="product_row">
  <xsl:param name="product"/>
  <xsl:param name="report_cves"/>
  <xsl:param name="report_cpes"/>


  <xsl:variable name="closed_count" select="count($product/closed/cve[cvss >= 4.0])"/>
  <xsl:variable name="closed_critical_count" select="count($product/closed/cve[cvss >= 7.0])"/>
  <xsl:variable name="open_count" select="count($product/open/cve[cvss >= 4.0])"/>
  <xsl:variable name="open_critical_count" select="count($product/open/cve[cvss >= 7.0])"/>

  <xsl:variable name="all_vulns" select="($product/open/cve[cvss >= 4.0]/text() | $product/closed/cve[cvss >= 4.0]/text())"/>
  <xsl:variable name="critical_vulns" select="($product/open/cve[cvss >= 7.0]/text() | $product/closed/cve[cvss >= 7.0]/text())"/>

  <xsl:variable name="found" select="$all_vulns[$report_cves = .]"/>
  <xsl:variable name="found_critical" select="$critical_vulns[$report_cves = .]"/>

  <xsl:variable name="cpes" select="$product/cpe/text()"/>
  <xsl:variable name="found_cpe_tally">
    <xsl:for-each select="$report_cpes">
      <xsl:if test="true or gsa:match-prefix-list (., $cpes)">|</xsl:if>
    </xsl:for-each>
  </xsl:variable>
  <xsl:variable name="found_cpes" select="string-length ($found_cpe_tally)"/>

  <tr>
    <td><xsl:value-of select="$product/name"/></td>
    <td><xsl:value-of select="$closed_count"/></td>
    <td><xsl:value-of select="$closed_critical_count"/></td>
    <td><xsl:value-of select="$open_count"/></td>
    <td><xsl:value-of select="$open_critical_count"/></td>

    <td>
      <xsl:call-template name="rating_image">
        <xsl:with-param name="open_count" select="$open_count"/>
        <xsl:with-param name="open_critical_count" select="$open_critical_count"/>
        <xsl:with-param name="found_cpes" select="'1'"/>
      </xsl:call-template>
    </td>

    <td>
      <xsl:call-template name="rating_image">
        <xsl:with-param name="open_count" select="count($found)"/>
        <xsl:with-param name="open_critical_count" select="count($found_critical)"/>
        <xsl:with-param name="found_cpes" select="$found_cpes"/>
      </xsl:call-template>
    </td>

  </tr>
</xsl:template>

<xsl:template name="rating_image">
  <xsl:param name="open_count"/>
  <xsl:param name="open_critical_count"/>
  <xsl:param name="found_cpes" select="0"/>

  <xsl:choose>
    <xsl:when test="$open_critical_count > 0">
      <a href="#" class="tooltip">
        <img src="/img/rot.png" />
        <span style="width: 170px; height: 26px; margin-top: -40px; margin-left: -195px">
          <img class="callout" style="left: 190px; top: 6px" src="/img/callout_blue_left.gif" />
          <xsl:value-of select="$open_count"/> offene Schwachstelle<xsl:if test="$open_count > 1">n</xsl:if>,<br/>
          davon <xsl:value-of select="$open_critical_count"/> kritisch
        </span>
      </a>
    </xsl:when>
    <xsl:when test="$open_count > 0">
      <a href="#" class="tooltip">
        <img src="/img/gelb.png" />
        <span style="width: 170px; height: 26px; margin-top: -40px; margin-left: -195px">
          <img class="callout" style="left: 190px; top: 6px" src="/img/callout_blue_left.gif" />
          <xsl:value-of select="$open_count"/> offene Schwachstelle<xsl:if test="$open_count > 1">n</xsl:if>,<br/>
          davon keine kritisch
        </span>
      </a>
    </xsl:when>
    <xsl:otherwise>
      <xsl:choose>
        <xsl:when test="$found_cpes > 0">
          <a href="#" class="tooltip">
            <img src="/img/gruen.png" />
            <span style="width: 170px; height: 26px; margin-top: -40px; margin-left: -195px">
              <img class="callout" style="left: 190px; top: 6px" src="/img/callout_blue_left.gif" />
              Keine offene Schwachstellen
            </span>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <a href="#" class="tooltip">
            <img src="/img/grey.png" />
            <span style="width: 170px; height: 26px; margin-top: -40px; margin-left: -195px">
              <img class="callout" style="left: 190px; top: 6px" src="/img/callout_blue_left.gif" />
              Kein passendes Produkt gefunden
            </span>
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- Responses -->
<xsl:template match="start_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Prüfung Ausführen</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="stop_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Prüfung Abbrechen</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="run_wizard_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      <xsl:choose>
        <xsl:when test="/envelope/params/name = 'schwachstellenampel_clear'">Prüfergebnisse zurücksetzen</xsl:when>
        <xsl:when test="/envelope/params/name = 'schwachstellenampel_new_scan'">Prüfung starten</xsl:when>
        <xsl:when test="/envelope/params/name = 'schwachstellenampel_scan'">Prüfung fortsetzen</xsl:when>
        <xsl:otherwise>Wizard '<xsl:value-of select="/envelope/params/name" />' ausführen</xsl:otherwise>
      </xsl:choose>
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- Dummy templates for unused commands -->

<xsl:template name="command_unavailable">
  <div class="errorbox">
    <h2>Befehl nicht verfügbar</h2>
    <p>Der Befehl &quot;<xsl:value-of select="/envelope/params/cmd"/>&quot; ist nur im Expertenmodus verfügbar.</p>
    <p><a href="{$main_page_link}&amp;token={/envelope/token}">Klicken Sie hier um zur Hauptseite zurückzukehren.</a></p>
  </div>
</xsl:template>

<xsl:template match="get_tasks_response">
  <xsl:if test="/envelope/params/cmd = get_task or /envelope/params/cmd = get_tasks">
    <xsl:call-template name="command_unavailable"/>
  </xsl:if>
</xsl:template>

<xsl:template match="get_filters_response"/>

<xsl:template match="get_settings_response"/>

<xsl:template match="get_report_formats_response"/>

<xsl:template match="get_alerts_response"/>

<xsl:template match="get_task/commands_response/get_tasks_response/*">|<xsl:value-of select="name(.)"/></xsl:template>

<xsl:template match="severity" />

<xsl:template match="i18n"/>


</xsl:stylesheet>
