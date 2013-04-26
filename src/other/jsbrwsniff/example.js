var br=new Array(4);
var os=new Array(2);
var flash=new Array(2);
br=getBrowser();
os=getOS();
flash=hasFlashPlugin();
popups = popupsAllowed();
jsver = jsVersion();
document.write("Browser identifier: "+br[0]+"<br />");
document.write("Browser version: "+br[1]+"<br />");
document.write("Browser major version: "+getMajorVersion(br[1])+"<br />");
document.write("Browser minor version: "+getMinorVersion(br[1])+"<br />");
document.write("Browser engine: "+br[2]+"<br />");
document.write("Browser engine version: "+br[3]+"<br />");
document.write("Full user agent string: "+getFullUAString()+"<br />");
document.write("Operating system identifier: "+os[0]+"<br />");
document.write("Operating system version: "+os[1]+"<br />");
document.write("Is Flash installed? "+ (flash[0]==2 ? "Yes" : (flash[0] == 1 ? "No" : "unknown"))+"<br />");
document.write("Flash version: "+flash[1] + "<br />");
document.write("Are popups allowed for this site? " + (popups ? 'Yes' : 'No') + "<br />" );
document.write("What is the newest version of Javascript this browser supports? " + jsver + "<br />");




