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
Description: Help documents for the GSA interface IT Schwachstellenampel.

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

<xsl:include href="gsad.xsl"/>

<xsl:template match="help">
  <xsl:apply-templates mode="help"/>
</xsl:template>

<xsl:template name="help-page">
  <xsl:param name="title" />
  <xsl:param name="text" />
  <xsl:param name="icon" select="'/img/info_big.png'" />
  <h2><xsl:value-of select="$title"/></h2>
  <hr />
  <xsl:choose>
    <xsl:when test="$icon != '/img/info_big.png'">
      <div id="help_icon" class="box">
        <img src="{$icon}"/>
      </div>
      <div id="help_text">
        <xsl:copy-of select="$text"/>
      </div>
    </xsl:when>
    <xsl:otherwise>
      <div id="logo_icon" class="innerbox" style="width:230px; margin: 1px 2px 0px 0px; float:right; background:#ffffff">
        <p align="center">
          <a href="http://www.allianz-fuer-cybersicherheit.de" target="_new">
            <img border="0" src="/img/acs_logo.png"/>
          </a>
        </p>
        <p align="center">
          <a href="http://www.bsi.bund.de" target="_new">
            <img border="0" src="/img/bsi_logo.png"/>
          </a>
        </p>
        <p align="center">
          <a href="http://www.openvas.org/index-de.html" target="_new">
            <img border="0" src="/img/OpenVAS-logo.png"/>
          </a>
        </p>
        <p align="center">
          <a href="http://www.greenbone.net/index.de.html" target="_new">
            <img border="0" src="/img/greenbone-logo.png"/>
          </a>
        </p>
      </div>
      <div id="help_text" style="width: 380px">
        <xsl:copy-of select="$text"/>
      </div>
    </xsl:otherwise>
  </xsl:choose>

</xsl:template>

<xsl:template mode="help" match="*">
  <xsl:call-template name="help-page">
    <xsl:with-param name="title">Seite nicht gefunden</xsl:with-param>
    <xsl:with-param name="text">
      Die von Ihnen angeforderte Hilfeseite konnte nicht gefunden werden.
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template mode="help" match="info.html">
  <xsl:call-template name="help-page">
    <xsl:with-param name="title">Über die Anwendung</xsl:with-param>
    <xsl:with-param name="text">
      <p>Die IT Schwachstellenampel ist ein Assistent um die
      allgemeine Cyber-Sicherheitslage der konkreten Lage im eigenen
      Hause gegenüberzustellen.<br/>
      Sie zeigt auf einfache Weise ob Sie von Gefahren betroffen
      sind und welcher Handlungsbedarf bei Ihnen besteht.</p>

      <p>
      Um Ihnen die Berwertung zu ermöglichen wird eine automatisch
      ausgeführte Schwachstellenprüfung auf einem von Ihnen ausgewählten
      System durchgeführt.
      </p>

      <p>
      Die Daten zu den aktuellsten Routinen für die Schwachstellenprüfungen
      werden direkt aus dem Internet nachgeladen. Denn eine realistische
      IT-Sicherheitslage lebt von der Aktualität und kann sich täglich ändern.
      </p>

      <h3>Verwendung</h3>

      <p>
      Für die Schwachstellenprüfung reicht eine einzige Information aus:
      das zu prüfende System, als IP-Adresse ("192.168.0.1") oder mit Namen
      ("www.example.com").
      <!--Voreingestellt ist das System vom dem aus Sie gerade mit
      dem Web-Browser auf die IT Schwachstellenampel zugreifen.-->
      </p>

      <p>
      Beachten Sie, dass die Aussagekraft erheblich ansteigt wenn Sie
      für die Prüfung einen Zugang verwenden.
      Nur dann kann das Zielsystem zusätzlich "von innen" analysiert und die
      bedrohten Produkte identifiziert werden.
      Ohne Zugang werden alle extern angebotenen Dienste des Zielsystems geprüft.
      Für Windows-Systeme ist in der Regel ein Zugang mit administrativen Rechten
      notwendig, für Linux-Systeme reicht ein nicht-privilegierter Zugang.
      </p>

      <h3>Hintergrund</h3>

      <p>
      Als technische Gundlage dient das Open-Source-Tool OpenVAS (Open
      Vulnerability Assessment System) welches von der Greenbone Networks GmbH
      entwickelt wird.
      </p>

      <p>
      Die darauf aufsetzende IT-Schwachstellenampel wurde in Zusammenarbeit
      mit der Allianz für Cyber-Sicherheit und dem 
      Bundesamt für Sicherheit in der Informationstechnik (BSI)
      entwickelt. Mit dieser Anwendung soll ein einfacher und sehr praxisorientierter
      Einstieg in die Thematik der Schwachstellen-Problematik ermöglicht werden. 
      </p> 
      
      <p>
      Die IT-Schwachstellenampel ist wie auch OpenVAS selbst als Open Source unter
      der GNU General Public License (version 2) veröffentlicht.
      </p>

      <h3>Weitere Informationen</h3>

      <ul>
        <li><a href="http://www.allianz-fuer-cybersicherheit.de" target="_new">www.allianz-fuer-cybersicherheit.de</a></li>
        <li><a href="http://www.bsi.bund.de" target="_new">www.bsi.bund.de</a></li>
        <li><a href="http://www.openvas.org/index-de.html" target="_new">www.openvas.org</a></li>
        <li><a href="http://www.greenbone.net/index.de.html" target="_new">www.greenbone.net</a></li>
      </ul>

      <p>
      Kontakt bzgl. IT-Schwachstellenampel: its@greenbone.net
      </p>

    </xsl:with-param>
  </xsl:call-template>
</xsl:template>


<xsl:template mode="help" match="datensicherheit.html">
  <xsl:call-template name="help-page">
    <xsl:with-param name="title">Datensicherheit</xsl:with-param>
    <xsl:with-param name="icon">/img/datensicherheit_big.png</xsl:with-param>
    <xsl:with-param name="text">
      <p>Für die Anwendung der IT Schwachstellenampel wird besonderer Wert
      auf Datensicherheit gelegt:</p>

      <p>
      Zu keinem Zeitpunkt verlassen Informationen über Ihre IT-Umgebung die Anwendung
      der IT Schwachstellenampel. Es handelt sich also nicht um
      eine Cloud-Lösung. Die Anwendung bezieht aus dem Internet lediglich
      die aktuellen Prüfroutinen und eigene Aktualisierungen.
      </p>

      <p>
      Berücksichtigen Sie, dass während eines Prüf-Vorganges der Softwarebestand,
      dessen Konfiguration und damit in Zusammenhang stehende Informationen gesammelt
      und dahingehend in der Anwendung ausgewertet werden um Gefährdungen festzustellen.
      </p>

      <p>
      Bei Verwendung eines Zugangskontos wird das Passwort in der Anwendung gespeichert.
      </p>

      <p>
      Sowohl die Informationen aus dem Prüfvorgang als auch das Passwort wird beim Zurücksetzen
      aus der Anwendung gelöscht.
      </p>

    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

</xsl:stylesheet>
