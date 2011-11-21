/* Author: Stijn Debacker
web: http://stijnd.be/
twitter: _stijn_d
*/
$(document).ready(function(){

	$('.tags').tags({
		data: [
			"ActionScript",
			"AppleScript",
			"Asp",
			"BASIC",
			"C",
			"C++",
			"Clojure",
			"COBOL",
			"ColdFusion",
			"Erlang",
			"Fortran",
			"Groovy",
			"Haskell",
			"Java",
			"JavaScript",
			"Lisp",
			"Perl",
			"PHP",
			"Python",
			"Ruby",
			"Scala",
			"Scheme"
		],
		debug: false,
		keep_tags: true,
		animation_in: 'bounce',
		animation_in_options: {},
		animation_in_speed: 200,
		animation_out: 'explode',
		animation_out_options: {},
		animation_out_speed: 200,
		tag_added: function(){
			$('.message').text('A tag was added and this is the function in the settings object!');
			$('.input_value .value').text($('.tags').val());
		},
		new_tag_added: function(tag)
		{
			$('.message').text('The tag that was added is the following: '+tag+'<br /> using this method u can add it directly into the database using ajax if you want to');
		},
		tag_removed: function(tag){
			$('.message').text('The tag that was removed is the following: '+tag);
			$('.input_value .value').text($('.tags').val());
		}

	});
});