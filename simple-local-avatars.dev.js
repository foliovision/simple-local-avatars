var simple_local_avatar_frame,
	avatar_spinner,
	avatar_ratings,
	avatar_container,
	avatar_form_button,
	avatar_preview,
	avatar_input,
	avatar_blob,
	current_avatar;
var avatar_working = false;

jQuery(document).ready(function($){
	avatar_input = $( '#simple-local-avatar' );
	avatar_preview = $( '#simple-local-avatar-photo img' );
	current_avatar = avatar_preview.attr( 'src' );
	$( document.getElementById('simple-local-avatar-media') ).on( 'click', function(event) {
		event.preventDefault();

		if ( avatar_working )
			return;

		if ( simple_local_avatar_frame ) {
			simple_local_avatar_frame.open();
			return;
		}

		simple_local_avatar_frame = wp.media.frames.simple_local_avatar_frame = wp.media({
			title: i10n_SimpleLocalAvatars.insertMediaTitle,
			button: { text: i10n_SimpleLocalAvatars.insertIntoPost },
			library : { type : 'image'},
			multiple: false
		});

		simple_local_avatar_frame.on( 'select', function() {
			// We set multiple to false so only get one image from the uploader
			avatar_lock('lock');
			var avatar_url = simple_local_avatar_frame.state().get('selection').first().toJSON().id;
			jQuery.post( ajaxurl, { action: 'assign_simple_local_avatar_media', media_id: avatar_url, user_id: i10n_SimpleLocalAvatars.user_id, _wpnonce: i10n_SimpleLocalAvatars.mediaNonce }, function(data) {
				if ( data != '' ) {
					avatar_container.innerHTML = data;
					$( document.getElementById('simple-local-avatar-remove') ).show();
					avatar_ratings.disabled = false;
					avatar_lock('unlock');
				}
			});
		});

		simple_local_avatar_frame.open();
	});

	$( document.getElementById('simple-local-avatar-remove') ).on('click',function(event){
		event.preventDefault();

		if ( avatar_working )
			return;

		avatar_lock('lock');
		$.get( ajaxurl, { action: 'remove_simple_local_avatar', user_id: i10n_SimpleLocalAvatars.user_id, _wpnonce: i10n_SimpleLocalAvatars.deleteNonce })
		.done(function(data) {
			if ( data != '' ) {
				avatar_container.innerHTML = data;
				$( document.getElementById('simple-local-avatar-remove') ).hide();
				avatar_ratings.disabled = true;
				avatar_lock('unlock');
			}
		});
	});

	avatar_input.on( 'change', function( event ) {
		avatar_preview.attr( 'srcset', '' );
		avatar_preview.attr( 'height', 'auto' );
		URL.revokeObjectURL( avatar_blob );
		if ( event.target.files.length > 0 ) {
			avatar_blob = URL.createObjectURL(event.target.files[0]);
			avatar_preview.attr( 'src', avatar_blob );
		} else {
			avatar_preview.attr( 'src', current_avatar );
		}
	} );

	$( document.getElementById('simple-local-avatars-migrate-from-wp-user-avatar') ).on( 'click', function(event) {
		event.preventDefault();
		jQuery.post( ajaxurl, { action: 'migrate_from_wp_user_avatar', migrateFromWpUserAvatarNonce: i10n_SimpleLocalAvatars.migrateFromWpUserAvatarNonce } )	
			.always( function() {
				$('.simple-local-avatars-migrate-from-wp-user-avatar-progress').empty();
				$('.simple-local-avatars-migrate-from-wp-user-avatar-progress').text(i10n_SimpleLocalAvatars.migrateFromWpUserAvatarProgress);
			})
			.done( function( response ) {
				$('.simple-local-avatars-migrate-from-wp-user-avatar-progress').empty();
				const data = $.parseJSON(response);
				const count = data.count;
				if ( 0 === count ) {
					$('.simple-local-avatars-migrate-from-wp-user-avatar-progress').text(
						i10n_SimpleLocalAvatars.migrateFromWpUserAvatarFailure
					);
				}
				if ( count > 0 ) {
					$('.simple-local-avatars-migrate-from-wp-user-avatar-progress').text(
						i10n_SimpleLocalAvatars.migrateFromWpUserAvatarSuccess + ': ' + count
					);
				}
				setTimeout(function() {
					$('.simple-local-avatars-migrate-from-wp-user-avatar-progress').empty();
				}, 5000);
			});
    });
});

function avatar_lock( lock_or_unlock ) {
	if ( undefined == avatar_spinner ) {
		avatar_ratings = document.getElementById('simple-local-avatar-ratings');
		avatar_spinner = jQuery( document.getElementById('simple-local-avatar-spinner') );
		avatar_container = document.getElementById('simple-local-avatar-photo');
		avatar_form_button = jQuery(avatar_ratings).closest('form').find('input[type=submit]');
	}

	if ( lock_or_unlock == 'unlock' ) {
		avatar_working = false;
		avatar_form_button.removeAttr('disabled');
		avatar_spinner.hide();
	} else {
		avatar_working = true;
		avatar_form_button.attr('disabled','disabled');
		avatar_spinner.show();
	}
}