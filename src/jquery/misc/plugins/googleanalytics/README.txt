====================================================
Basic usage:
====================================================

Call the plugin in the document ready function for jquery. Once you have made this call you can feel free to 
make calls to the plugin as they will be queued if the Google analytics code has not been loaded yet. 
As shown below all a tags with a class name of google will automatically send a pageView hit with their href
for the value. 

<script type="text/javascript">
	
	$(document).ready(function(){
		// Use your Google analytics code here.
	  $.ga("UA-######-#");	// This will log a page view.
	});
	
</script>

Available settings:
	 
   selectorMap ( Object )      : This is for adding clicks to elements that are not links ( or do not have the ga-page class, 
                                 if you are using the default gaClassOnly value ) and providing a track path.
                                 Pass in a map in the format of { 'selector path (just like jquery)' : 'track/path' } where 
                                 selector path is the clicked element that should use the provided track path. 
                                 Do not put links that have the google class or they will be tracked twice.
	 
To manually track a page view call:
	$.galog.pageView('track/path');

To manually track an event call:
	$.galog.event('category', 'action', 'optional_label', 'optional_integer_value');


====================================================
Automatic link click pageView calls usage:
Note that the clicks on links that happen automatically use the pageView method.
====================================================

To have a link automatically send a pageView hit with their href for the value, simply
give it a class name of: ga-page.

<a href="/some/where/" class="ga-page">Link Text</a>

<script type="text/javascript">
	
	$(document).ready(function(){
		// Use your Google analytics code here.
	  $.ga("UA-######-#");	// This will log a page view.
	});
	
</script>

To provide a mapping of selectors to send pageView hits:

<script type="text/javascript">
	
	$(document).ready(function(){
		// Use your Google analytics code here.
	  $.ga("UA-######-#", {selectorMap:{'#clickedId':'homepage/view', '#someOtherId':'homepage/view/project'}});
	});
	
</script>

Remember if you are using any automatic click logging, be sure you dont duplicate it in the selectorMap.

For more details on the google methods these wrap see: 
http://code.google.com/apis/analytics/docs/eventTrackerGuide.html