(function($) {

	var _$win;
	var _movieManager;

	$(function() {

		_$win = $(window);
		_movieManager = new MovieManager();

		$('[data-action]').on('click','button',onAction);
		_$win.on({ 'scroll':onScroll });

	});

	function onScroll(event) {

		var winH      = _$win.height();
		var scrollTop = _$win.scrollTop();

		_movieManager.scroll(scrollTop,winH);
		
	}

	function onAction(event) {

		var $target = $(event.delegateTarget);
		switch($target.data('action')) {
			case 'inputid':inputId($target);
		}
		
	}

	function inputId($target) {

		var id = $target.find('input').val();
		if (id == '' || id == null) return;

		var html = '<div class="movie">';
		html += '<figure data-movie="' + id + '"></figure>';
		html += '</div>';

		var $movie = $(html);
		$('#add').find('.inner').append($movie);
		_movieManager.add($movie.find('[data-movie]'));

	}

	function MovieManager() {

		var movieList = [];
		var isInitAPI = false;
		var idCounter = 0;
		var $movies;

		(function init() {

			$movies = $('[data-movie]');
			if (0 < $movies.length) loadAPI();

		})();

		this.scroll = function(scrollTop,winH) {

			if (!isInitAPI) return;

			for (var i = 0; i < $movies.length; i++) {

				var $target = $movies.eq(i);
				if ($target.data('loaded') == true) continue;
				if ($target.offset().top <= scrollTop + winH + (winH * .5)) {
					setupPlayer($target);
				}

			}

		}

		this.add = function($target) {

			setMovieFrame($target);
			setupPlayer($target);

		}

		function loadAPI() {

			window.onYouTubePlayerAPIReady = function() {

				isInitAPI = true;
				_$win.trigger('scroll');

			};

			var $script = $('<script></script>');
			$script.prop('src','https://www.youtube.com/iframe_api');
			var location = $('script').get(0);
			location.parentNode.insertBefore($script.get(0),location);

			for (var i=0; i < $movies.length; i++) {
				setMovieFrame($movies.eq(i));
			}

		}

		function setMovieFrame($target) {

			$target.append('<div class="movie-frame" id="movie-' + idCounter + '"></div>');
			idCounter++;

		}

		function setupPlayer($target) {

			var id       = $target.find('.movie-frame').prop('id');
			var videoID  = $target.data('movie');
			var autoplay = $target.data('autoplay');
			var loop     = $target.data('loop');
			var playlist = (loop == 1) ? videoID : null;
			$target.data('loaded',true);

			function onPlayerReady(event) {

				if (autoplay == 1) return;
				var player = event.target;
				movieList.push({ id:id,player:player,target:$target });

			}

			function onPlayerError(event) {
			}

			new YT.Player(id,{
				videoId   : videoID,
				playerVars: {
					playsinline    : 1,
					autoplay       : (autoplay == null) ? 0 : autoplay,
					controls       : 0,
					showinfo       : 0,
					loop           : (loop == null) ? 0 : loop,
					modestbranding : 1,
					wmode          : 'transparent',
					rel            : 0,
					playlist       : playlist
				},
				events: {
					'onReady'      : onPlayerReady,
					'onStateChange': onPlayerStateChange,
					'onError'      : onPlayerError
				}
			});

		}

		function getMovieByID(id) {

			for (var i = 0; i < movieList.length; i++) {
				var movie = movieList[i];
				if (movie.id == id) return movie;
			}
			return null;

		}

		function onPlayerStateChange(event) {

			if (event.data != YT.PlayerState.PLAYING) return;

			var target = getMovieByID(event.target.a.id);

			for (var i = 0; i < movieList.length; i++) {

				var movie = movieList[i];
				if (movie.player.getPlayerState() == YT.PlayerState.PLAYING && movie.id != target.id) {
					movie.player.pauseVideo();
				}

			}

		}

	}

})(jQuery);
