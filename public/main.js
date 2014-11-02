(function($) {
    var _rows = 4;
    var _cols = 20;
    var _widthHeightRatio = 2;
    var _inset = 32;
    function setSize() {
        var rowsSize = ($(window).height() - _inset) / _rows;
        var colsSize = ((($(window).width() - _inset) / _cols) * _widthHeightRatio);
        var fontSize = Math.min(rowsSize , colsSize);
        $('#metrosign').css({
            'font-size': fontSize + 'px',
            'width': ((fontSize / _widthHeightRatio) * _cols) + 'px',
            'height': (fontSize * _rows) + 'px'
        });
    }
    function fetchTimes(stationcode) {
        if (!stationcode) {
            stationcode = window.location.hash.substring(1);
        }
        $.getJSON('/data/prediction/' + stationcode,function(data) {
            var $tbody = $('#metrosign tbody');
            $tbody.html('');
            $.each(data,function(i,row) {
                var $tr = $('<tr></tr>');
                $.each(['ln','car','dest','min'],function(i,key) {
                    $tr.append('<td class="' + key + '">' + row[key] + '</li>');    
                });
                $tbody.append($tr);
            });
            if (data.length < 3) {
                for(var i = 0; i < 3 - data.length; i++) {
                    $tbody.append('<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');
                }
            }
        });
    }
    function loadStations() {
        $.getJSON('/data/stations',function(data) {
            var $select = $('#station-select');
            var setSelected = function(station) {
                $select.find('option[value='+station+']').prop('selected', true);
                $select.trigger('change');
            }
            $select.html('');
            $.each(data,function(i,row) {
                $select.append('<option value="' + row.code + '">' + row.name + '</option>');
            });
            $select.change(function() {
                var val = $(this).val();
                fetchTimes(val);
                if (window.location.hash.substring(1) != val) {
                    window.location.hash = val;
                }
            });
            if (window.location.hash && window.location.hash != '#') {
                setSelected(window.location.hash.substring(1));
            } else {
                var randomIndex = Math.floor(Math.random() * data.length);
                $select.find('option:eq('+randomIndex+')').prop('selected', true);
                $select.trigger('change');
            }
            $(window).on('hashchange',function() {
                setSelected(window.location.hash.substring(1));
            });
            setInterval(fetchTimes,60000);
        });
    }
    function initMousover() {
        var $select = $('#station-select');
        var timeout;
        $(document).mousemove(function() {
            if (!$select.hasClass('visible')) {
                $select.addClass('visible');
            } else if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function() {
                $select.removeClass('visible');
            },2000);
        });
    }
    $(document).ready(function() {
        $(window).resize(setSize);
        setSize();
        loadStations();
        fetchTimes();
        initMousover();
    });
})(jQuery);