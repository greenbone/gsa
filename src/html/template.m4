define(`PC', include(PAGE_CONTENT))
<html>
 <head>
  <link rel="stylesheet" type="text/css" href="/gsa-style.css" />
  <link rel="icon" href="/favicon.gif" type="image/x-icon" />
  <title>PAGE_TITLE</title>
 </head>
 <body>
  <center>
   <div class="envelope">
    include(`header.m4')
    PC
    include(`footer.m4')
   </div>
  </center>
 </body>
</html>
