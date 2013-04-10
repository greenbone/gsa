<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:str="http://exslt.org/strings"
    xmlns:gsa="http://openvas.org"
    extension-element-prefixes="str">
    <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: OpenVAS Administrator Protocol (OAP) stylesheet

Authors:
Matthew Mundell <matthew.mundell@greenbone.net>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@greenbone.net>

Copyright:
Copyright (C) 2009 Greenbone Networks GmbH

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

<!-- BEGIN FEED MANAGEMENT -->

<!-- DESCRIBE FEED RESPONSE    -->

<xsl:template match="describe_feed_response">
  <xsl:choose>
    <xsl:when test="substring(@status, 1, 1) = '4' or substring(@status, 1, 1) = '5'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Describe Feed</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-feed-form"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-feed-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">NVT Feed Management
      <a href="/help/feed_management.html?token={/envelope/token}"
         title="Help: NVT Feed Management">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="sync_feed"/>
        <input type="hidden" name="caller" value="{/envelope/caller}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <b><xsl:value-of select="feed/name"/></b><br/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Feed Version</td>
            <td>
              <xsl:value-of select="feed/version"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="feed/currently_syncing">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  Synchronization
                  <b>in progress</b>.  Started
                  <b>
                    <xsl:value-of select="feed/currently_syncing/timestamp"/>
                  </b>
                  by
                  <b><xsl:value-of select="feed/currently_syncing/user"/></b>.
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td valign="top" width="125">Description</td>
            <td>
              <xsl:value-of select="feed/description"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="feed/sync_not_available">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  <b>Warning:</b> Synchronization with this feed is currently not possible.<br/>
                  <xsl:choose>
                    <xsl:when test="feed/sync_not_available/error/text()">
                      The synchronization script returned the following error message: <i><xsl:value-of select="feed/sync_not_available/error/text()"/></i>
                    </xsl:when>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td colspan="2" style="text-align:right;">
              <xsl:choose>
                <xsl:when test="feed/currently_syncing">
                  <input type="submit" name="submit" value="Synchronize with Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:when test="feed/sync_not_available">
                  <input type="submit" name="submit" value="Synchronize with Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="submit" name="submit" value="Synchronize with Feed now"/>
                </xsl:otherwise>
              </xsl:choose>
              <p>
                <a style="background-color: #ff6;" href="/help/feed_management.html?token={/envelope/token}#side_effects" title="Help: Feed Management">Learn about the side effects of feed synchronization!</a>
              </p>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<!--   SYNC_FEED_RESPONSE -->

<xsl:template match="sync_feed_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Synchronization with NVT Feed</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- END FEED MANAGEMENT -->

<!-- BEGIN SCAP FEED MANAGEMENT -->

<!-- DESCRIBE SCAP FEED RESPONSE    -->

<xsl:template match="describe_scap_response">
  <xsl:choose>
    <xsl:when test="substring(@status, 1, 1) = '4' or substring(@status, 1, 1) = '5'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Describe SCAP Feed</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-scap-form"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-scap-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">SCAP Feed Management
      <a href="/help/scap_management.html?token={/envelope/token}"
         title="Help: SCAP Feed Management">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="sync_scap"/>
        <input type="hidden" name="caller" value="{/envelope/caller}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <b><xsl:value-of select="scap/name"/></b><br/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Feed Version</td>
            <td>
              <xsl:value-of select="scap/version"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="scap/currently_syncing">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  Synchronization
                  <b>in progress</b>.  Started
                  <b>
                    <xsl:value-of select="scap/currently_syncing/timestamp"/>
                  </b>
                  by
                  <b><xsl:value-of select="scap/currently_syncing/user"/></b>.
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td valign="top" width="125">Description</td>
            <td>
              <xsl:value-of select="scap/description"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="scap/sync_not_available">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  <b>Warning:</b> Synchronization with this feed is currently not possible.<br/>
                  <xsl:choose>
                    <xsl:when test="scap/sync_not_available/error/text()">
                      The synchronization script returned the following error message: <i><xsl:value-of select="scap/sync_not_available/error/text()"/></i>
                    </xsl:when>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td colspan="2" style="text-align:right;">
              <xsl:choose>
                <xsl:when test="scap/currently_syncing">
                  <input type="submit" name="submit" value="Synchronize with SCAP Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:when test="scap/sync_not_available">
                  <input type="submit" name="submit" value="Synchronize with SCAP Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="submit" name="submit" value="Synchronize with SCAP Feed now"/>
                </xsl:otherwise>
              </xsl:choose>
              <p>
                <a style="background-color: #ff6;" href="/help/scap_management.html?token={/envelope/token}#side_effects" title="Help: SCAP Feed Management">Learn about the side effects of SCAP Feed synchronization!</a>
              </p>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<!--   SYNC_SCAP_RESPONSE -->

<xsl:template match="sync_scap_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Synchronization with SCAP Feed</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- END SCAP MANAGEMENT -->

<!-- BEGIN CERT FEED MANAGEMENT -->

<!-- DESCRIBE CERT FEED RESPONSE    -->

<xsl:template match="describe_cert_response">
  <xsl:choose>
    <xsl:when test="substring(@status, 1, 1) = '4' or substring(@status, 1, 1) = '5'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Describe SCAP Feed</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-cert-form"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-cert-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">CERT Feed Management
      <a href="/help/cert_management.html?token={/envelope/token}"
         title="Help: CERT Feed Management">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/oap" method="post" enctype="multipart/form-data">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="sync_cert"/>
        <input type="hidden" name="caller" value="{/envelope/caller}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <b><xsl:value-of select="cert/name"/></b><br/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Feed Version</td>
            <td>
              <xsl:value-of select="cert/version"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="cert/currently_syncing">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  Synchronization
                  <b>in progress</b>.  Started
                  <b>
                    <xsl:value-of select="cert/currently_syncing/timestamp"/>
                  </b>
                  by
                  <b><xsl:value-of select="cert/currently_syncing/user"/></b>.
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td valign="top" width="125">Description</td>
            <td>
              <xsl:value-of select="cert/description"/>
            </td>
          </tr>
          <xsl:choose>
            <xsl:when test="cert/sync_not_available">
              <tr>
                <td valign="top" width="125"></td>
                <td>
                  <b>Warning:</b> Synchronization with this feed is currently not possible.<br/>
                  <xsl:choose>
                    <xsl:when test="cert/sync_not_available/error/text()">
                      The synchronization script returned the following error message: <i><xsl:value-of select="cert/sync_not_available/error/text()"/></i>
                    </xsl:when>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:when>
          </xsl:choose>
          <tr>
            <td colspan="2" style="text-align:right;">
              <xsl:choose>
                <xsl:when test="cert/currently_syncing">
                  <input type="submit" name="submit" value="Synchronize with CERT Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:when test="cert/sync_not_available">
                  <input type="submit" name="submit" value="Synchronize with CERT Feed now" disabled="disabled"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="submit" name="submit" value="Synchronize with CERT Feed now"/>
                </xsl:otherwise>
              </xsl:choose>
              <p>
                <a style="background-color: #ff6;" href="/help/cert_management.html?token={/envelope/token}#side_effects" title="Help: CERT Feed Management">Learn about the side effects of CERT Feed synchronization!</a>
              </p>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<!--   SYNC_CERT_RESPONSE -->

<xsl:template match="sync_cert_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Synchronization with CERT Feed</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- END CERT FEED MANAGEMENT -->

<!-- BEGIN SETTINGS MANAGEMENT -->

<xsl:template name="html-settings-table">
  <xsl:apply-templates select="scanner_settings"/>
</xsl:template>

<!--     SCANNER_SETTINGS -->

<xsl:template match="scanner_settings">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Scanner Settings
      <a href="/help/settings.html?token={/envelope/token}"
         title="Help: Settings">
        <img src="/img/help.png"/>
      </a>
      <xsl:if test="@editable=1">
        <a href="/oap?cmd=edit_settings&amp;token={/envelope/token}"
           title="Edit Settings"
           style="margin-left:3px;">
          <img src="/img/edit.png"/>
        </a>
      </xsl:if>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div style="text-align:left">From file: <xsl:value-of select="@sourcefile"/></div>
      <div id="settings">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Setting</td>
            <td>Value</td>
          </tr>
          <xsl:apply-templates select="setting"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template match="scanner_settings" mode="edit">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Edit Scanner Settings
      <a href="/help/settings.html?token={/envelope/token}"
         title="Help: Settings">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div style="text-align:left">From file: <xsl:value-of select="@sourcefile"/></div>
      <div id="settings">
        <form action="/omp" method="post" enctype="multipart/form-data">
          <input type="hidden" name="token" value="{/envelope/token}"/>
          <input type="hidden" name="cmd" value="save_settings"/>
          <input type="hidden" name="caller" value="{/envelope/caller}"/>
          <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
            <tr class="gbntablehead2">
              <td>Setting</td>
              <td>Value</td>
            </tr>
            <xsl:apply-templates select="setting" mode="edit"/>
            <tr>
              <td colspan="2" style="text-align:right;">
                <input type="submit"
                       name="submit"
                       value="Save Settings"
                       title="Save Settings"/>
              </td>
            </tr>
          </table>
        </form>
      </div>
    </div>
  </div>
</xsl:template>

<!--     SETTING -->

<xsl:template match="setting">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="@name"/></b>
    </td>
    <td><xsl:value-of select="text()"/></td>
  </tr>
</xsl:template>

<xsl:template match="setting" mode="edit">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="@name"/></b>
    </td>
    <td>
      <input type="text" name="method_data:{@name}" value="{text()}" size="50"
             maxlength="400"/>
    </td>
  </tr>
</xsl:template>

<!--     GET_SETTINGS_RESPONSE -->

<xsl:template match="get_settings_response">
  <xsl:choose>
    <xsl:when test="@status = '200' or @status = '201' or @status = '202'">
      <xsl:call-template name="html-settings-table"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">List Settings</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="get_settings_response" mode="edit">
  <xsl:choose>
    <xsl:when test="@status = '200' or @status = '201' or @status = '202'">
      <xsl:apply-templates select="scanner_settings" mode="edit"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Edit Settings</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- END SETTINGS MANAGEMENT -->

<!-- PAGE TEMPLATES -->

<xsl:template match="get_settings">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="save_settings_response"/>
  <xsl:apply-templates select="get_settings_response"/>
</xsl:template>

<xsl:template match="edit_settings">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="get_settings_response" mode="edit"/>
</xsl:template>

<!-- END PAGE TEMPLATES -->

</xsl:stylesheet>
