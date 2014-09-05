onready(function(){
	var flagStorage = "flag_"+window.location.pathname.split('/')[1];
	var item = window.localStorage.getItem(flagStorage);
	$('select[name=user_flag]').val(item);
	$('select[name=user_flag]').change(function() {
		window.localStorage.setItem(flagStorage, $(this).val());
	});

    // i just dunno where to put this
    $(".flag-preview").attr("class", "flag-preview flag flag-" + $('select[name="user_flag"]').val());
    $('select[name="user_flag"]').on('change', function() {
        $(".flag-preview").attr("class", "flag-preview flag flag-" + this.value);
    });
});