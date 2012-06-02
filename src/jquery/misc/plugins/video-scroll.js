// JavaScript Document
/**********************************************
 *	jQuery to control the Related Media 
 *	box on the new video player page.
 *	Will show more videos when arrows are 
 *	clicked
 **********************************************/
$(document).ready(function () {
	$('#relatedVidUpBtn').css({'background-image': 'url(\'http://media.ebaumsworld.com/img/rm_arrowup_inactive.gif\')'});						
	var visibleContainer = 1;
	var scrollHandler = (function (link){
		if($(this).attr('id') == 'relatedVidDownBtn'){
			if(visibleContainer <2){
				$('#relatedVidUpBtn').css({visibility: 'visible'});
				//$('#relatedVidContainer'+visibleContainer).slideUp(function(){
				$('#relatedVidContainer'+visibleContainer).css({display:'none'});
				visibleContainer++;
					var nextCont = ('#relatedVidContainer'+visibleContainer);
					$(nextCont).css({display: 'block', 'padding-top': '0', 'margin-top':'0'});
					
					//$(nextCont).slideDown();
					if(visibleContainer == 2){
						$('#relatedVidDownBtn').css({'background-image': 'url(\'http://media.ebaumsworld.com/img/rm_arrowdown_inactive.gif\')'});
						$('#relatedVidDownBtn').css({cursor: 'default'});
						$('#relatedVidUpBtn').css({cursor: 'pointer'});
						$('#relatedVidDownBtn').unbind('click', scrollHandler);
						$('#relatedVidUpBtn').bind('click', scrollHandler);
						$('#relatedVidUpBtn').css({'background-image': 'url(\'http://media.ebaumsworld.com/img/rm_arrowup.gif\')'});
					}
				//});
			}
		}
		else if($(this).attr('id') == 'relatedVidUpBtn'){
			if(visibleContainer > 1){
				$('#relatedVidDownBtn').css({visibility:'visible'});
				//$('#relatedVidContainer'+visibleContainer).slideUp(function(){
					$('#relatedVidContainer'+visibleContainer).css({display:'none', 'padding-top': '0', 'margin-top':'0'});														  
					visibleContainer--;
					var nextCont = ('#relatedVidContainer'+visibleContainer);
					$(nextCont).css({display: 'block', 'padding-top': '0'});
					//$(nextCont).slideDown();
					if(visibleContainer == 1){
						$('#relatedVidDownBtn').bind('click', scrollHandler);
						$('#relatedVidDownBtn').css({'background-image': 'url(\'http://media.ebaumsworld.com/img/rm_arrowdown.gif\')'});
						$('#relatedVidDownBtn').css({cursor: 'pointer'});
						$('#relatedVidUpBtn').css({cursor: 'default'});
						//$('#relatedVidUpBtn').css({visibility:'hidden'});
						$('#relatedVidUpBtn').css({'background-image': 'url(\'http://media.ebaumsworld.com/img/rm_arrowup_inactive.gif\')'});
						$('#relatedVidUpBtn').unbind('click', scrollHandler);
					}
				//});
			}
		}
	});	
	
	$('#relatedVidDownBtn').bind('click', scrollHandler);
	$('#relatedVidDownBtn').css({cursor: 'pointer'});
	//$('#relatedVidUpBtn').bind('click', scrollHandler);
	
						
});