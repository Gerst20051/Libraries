(function($){
	jQuery.fn.timepicker = function(){
		this.each(function(){
			// get the ID and value of the current element
			var i = this.id;
			var v = $(this).val();

			// the options we need to generate
			var hrs = new Array('00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23');
			var mins = new Array('00','05','10','15','20','25','30','35','40','45','50','55');
			var secs = new Array('00','05','10','15','20','25','30','35','40','45','50','55');

			// default to the current time
			var d = new Date;
			var h = d.getHours();
			var m = d.getMinutes();
			var s = d.getSeconds();
			
			// override with current values if applicable
			// round the minutes and seconds to nearest 10
			if(v.length == 8){
				h = parseInt(v.substr(0,2));
				x = parseInt(v.substr(3,2));
				m = (x % 5) >= 2.5 ? parseInt(x / 5) * 5 + 5 : parseInt(x / 5) * 5;
				x = parseInt(v.substr(6,2));
				s = (x % 5) >= 2.5 ? parseInt(x / 5) * 5 + 5 : parseInt(x / 5) * 5;				
			}
	
			// build the new DOM objects
			var output = '';
			
			output += '<select id="h_' + i + '" class="h timepicker">';				
			for(hr in hrs){
				output += '<option value="' + hrs[hr] + '"';
				if(parseInt(hrs[hr]) == h) output += ' selected';
				output += '>' + hrs[hr] + '</option>';
			}
			output += '</select>';
	
			output += '<select id="m_' + i + '" class="m timepicker">';				
			for(mn in mins){
				output += '<option value="' + mins[mn] + '"';
				if(parseInt(mins[mn]) == m) output += ' selected';
				output += '>' + mins[mn] + '</option>';
			}
			output += '</select>';				
	
			output += '<select id="s_' + i + '" class="p timepicker">';				
			for(ss in secs){
				output += '<option value="' + secs[ss] + '"';
				if(secs[ss] == s) output += ' selected';
				output += '>' + secs[ss] + '</option>';
			}
			output += '</select>';				

			// hide original input and append new replacement inputs
			$(this).css('display','none');
			$(this).after(output);
		});
		
		$('select.timepicker').change(function(){
			var i = this.id.substr(2);
			var h = $('#h_' + i).val();
			var m = $('#m_' + i).val();
			var s = $('#s_' + i).val();
			var v = h + ':' + m + ':' + s;
			$('#' + i).val(v);
		});
		
		return this;
	};
})(jQuery);
