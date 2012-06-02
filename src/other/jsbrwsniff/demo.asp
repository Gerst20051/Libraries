<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
<meta http-equiv="Content-Style-Type" content="text/css" />
<title>Javascript Browser Sniffer (Example of use)</title>
<style type="text/css">
<!--
    @import url("screen.css");
-->
</style>
<script language="javascript" runat="server" src="brwsniff.js"></script>
<script language="javascript" runat="server">
  function showBrwInfo() {
    var br=new Array(4);
    var os=new Array(2);
    var nav;

    nav='' + Request.ServerVariables("HTTP_USER_AGENT");
    nav=nav.toLowerCase();
    os=getOS(nav);
    br=getBrowser(nav);
    Response.write("Browser identifier: " + br[0] + "<br />");
    Response.write("Browser version: "+br[1]+"<br />");
    Response.write("Browser major version: "+getMajorVersion(br[1])+"<br />");
    Response.write("Browser minor version: "+getMinorVersion(br[1])+"<br />");
    Response.write("Browser engine: "+br[2]+"<br />");
    Response.write("Browser engine version: "+br[3]+"<br />");
    Response.write("Full user agent string: "+getFullUAString(nav)+"<br />");
    Response.write("Operating system identifier: " + os[0] +"<br />");
    Response.write("Operating system version: "+ os[1]);
 }
</script>
</head>
<body>
<div id="main">
<p>According to the Javascript Browser Sniffer, running at SERVER-SIDE, your browser is:</p>
<p><%call showBrwInfo() %></p>
</div>
</body>
</html>

