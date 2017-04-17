$( function() {

	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 11
	});
	var infoWindow = new google.maps.InfoWindow();

	loadMarkers(parseLocationsCallback, map, infoWindow); // replace with jquery get

	initResponsive(map);
});

function initResponsive(map) {
	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center); 
	});
}

function addMarkerClickListener(marker, map, infoWindow, content) {
	marker.addListener('click', function() {
		infoWindow.setContent(content);
		infoWindow.open(map, marker);
	});
}

function loadMarkers(callback, map, infoWindow) {
	$.get('http://localhost/ourmap-server/', function(data) {
		callback(data, map, infoWindow);
	});
}

function initModals() {
	$('.modal').on('show.bs.modal', function(e) {
		loadAlbumPhotos($(this).data('album_id'));
	});
}

function createAlbumModal(album) {

	var modalElement = $(
		'<div id="album-modal-' + album.id + '" class="modal fade" tabindex="-1" role="dialog" data-album_id="' + album.id + '">' +
			'<div class="modal-dialog" role="document">' +
				'<div class="modal-content">' +
					'<div class="modal-header">' +
						'<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
							'<span aria-hidden="true">&times;</span>' +
						'</button>' +
						'<h4 class="modal-title">' + album.name + '</h4>' +
					'</div>' +
					'<div class="modal-body">' +
					'</div>' +
					'<div class="modal-footer">' +
						'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
					'</div>' +
				'</div><!-- /.modal-content -->' +
			'</div><!-- /.modal-dialog -->' +
		'</div><!-- /.modal -->'
	);

	$("#modals-container").append(modalElement);
}

function loadAlbumPhotos(albumId) {
	var modalElement = $('#album-modal-' + albumId);

	if(modalElement.data('loaded') != 'loaded') {
		$.get('http://localhost/ourmap-server/photos/', {album_id: albumId}, function(data) {
			data.photos.map( function(photo) {
				var photoElement = '<a href="' + photo.url + '" data-fancybox="album-modal-' + albumId + '">' +
				'<img src="http://localhost/ourmap-server/thumb/?url=' + photo.url + '" alt="" class="album-thumbnail">' +
				'</a>';
				modalElement.find('.modal-body').append(photoElement);
			});
			modalElement.data('loaded', 'loaded');
		});
	}
}

// --- callbacks ---

function parseLocationsCallback(data, map, infoWindow) {

	data.locations.map( function(location) {

		var marker = new google.maps.Marker({
			map: map,
			position: {'lat': parseFloat(location.lat), 'lng': parseFloat(location.lng)}
		});

		addMarkerClickListener(marker, map, infoWindow, getInfoWindowContent(location));
	});

	map.setCenter({'lat': parseFloat(data.locations[0].lat), 'lng': parseFloat(data.locations[0].lng)});
	initModals();
}

function getInfoWindowContent(location) {

	var content = '<div>' +
	'<h4>' + location.name + ' albums:</h4>';

	location.albums.map( function(album) {
		content += getAlbumItemHTML(album);
		createAlbumModal(album);
	});

	content += '</div>';

	return content;
}

function getAlbumItemHTML(album) {

	return '<div class="tooltip-album-item">' +
		'<h5>' + album.name + '</h5>' +
		'<p>Added: ' + album.date + '</p>' +
		'<div class="view-button-container">' +
			'<button class="btn btn-success btn-sm" data-toggle="modal" data-target="#album-modal-' + album.id + '">View</button>' +
		'</div>' +
	'</div>';
}