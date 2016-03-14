<!DOCTYPE html>
<!--[if lt IE 7]>
<html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>
   <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>
   <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]>
<!-->
<html class="no-js" lang="en">
<!--<![endif]-->
<head>
</head>
<body>
<head>
 <script language="JavaScript">
<!--
  function isInteger(value) {
   return (parseInt(value) == value);
  } 
  function checkEnteredValue(f) {     
   if(f.VERBvsIM.value.length > 0 && isInteger(f.VERBvsIM.value)) {
    f.traceTextvsImage.value = "false";
    f.initialtraceTextvsImage.value = "false";
   } 
   if(f.GLvsAN.value.length > 0 && isInteger(f.GLvsAN.value)) {
    f.traceBFvsDF.value = "false";
    f.initialtraceBFvsDF.value = "false";
   }
   if ((f.VERBvsIM.value.length > 0 && !isInteger(f.VERBvsIM.value)) || (f.GLvsAN.value.length > 0 && !isInteger(f.GLvsAN.value))) {
    alert("The value should be an integer between 0 and 100.") 
   }     
  }
 //-->    
 </script> 
 </head>
<body>
 <body>
<h2>AHA! Form for Changing the User Model Attribute Value</h2>
<form method="post" action="/aha/ViewGet/FormProcess" onsubmit="checkEnteredValue(this)">
<h3>Changing learning preferences</h3>
<h4>Preference for presenting the material</h4>
If you prefer to be given more textual information about the concepts of the subject domain select "100" (Verbalizer style).<br />
If, on the other hand, you prefer to be given more pictorial information select "0" (Visualizer/Imager style).<br />
If you are not sure about your preferences, enter "50" (none).<br />
<p> personal.VERBvsIM: 
 <input name="VERBvsIM" size="3" maxlength="3" type="int" default="0"></input>
 <input name="traceTextvsImage" type="hidden"></input> 
 <input name="initialtraceTextvsImage" type="hidden"></input> 
</p>
<h4>Preference for ordering the links</h4>
If you prefer to be given an overview of all of the material at a high (global) level before introducing the detail, please enter "100" (Global style).<br />
If, on the other hand, you prefer to study each topic in detail before going to the next topic, enter "0" (Analytic style).<br />
If you are not sure about your preferences, enter "50" (none). <br />
<p> personal.GLvsAN: 
 <input name="GLvsAN" size="3" maxlength="3" type="int" default="0"></input> 
 <input name="traceBFvsDF" type="hidden"></input> 
 <input name="initialtraceBFvsDF" type="hidden"></input>  
</p>
<p><input type="submit" value="Effectuate the changes."></input> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="reset" value="Reset values in this form."></input>
 </p>
</form>
</div></main>
</body>
</div></main>
</body>
</html>
