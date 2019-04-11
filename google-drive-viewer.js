import './scripts.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import 'd2l-polymer-siren-behaviors/store/entity-behavior.js';

const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="google-drive-viewer">
	<template strip-whitespace="">
		<style>
			:host {
				width: 100%;
				height: 100%;
				overflow: hidden;
			}
		</style>
	</template>
	
	
<script src="https://s.brightspace.com/lib/ifrau/0.24.0/ifrau/host.js"></script>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

Polymer({
	is: 'google-drive-viewer',
	
	properties: {
		_hostPromise: Object,
		fraEndpoint: {
			type: String,
			value: 'https://s.brightspace.com/apps/google-drive-viewer-fra/2.1.2/index.html'
		},
		denyFullscreen: {
			type: Boolean,
			value: false
		}
	},
	
	behaviors: [
		D2L.PolymerBehaviors.Siren.EntityBehavior
	],
	
	detached: function() {
		if( this._hostPromise ) {
			this._hostPromise.then( function( host ) {
				host.close();
			});
			this._hostPromise = null;
		}
	},
	
	_extractFileId( entity ) {
		if( !entity ) {
			return null;
		}
		
		if( entity.hasClass( 'sequenced-activity' ) ) {
			entity = entity.getSubEntityByClass( 'activity' );
		}
		
		if( !entity || !entity.hasClass( 'link-plain') || !entity.hasClass( 'external' ) ) {
			return null;
		}
		
		var link = entity.getLinkByRel( 'about' );
		if( !link || !link.href ) {
			return;
		}
		
		var googleDriveRegex = /^https?:\/\/(?:docs|drive)\.google\.com(?:\/a\/[^\/]+)?\/(?!forms\/)[^\/]+\/d\/([^\/\?#]{2,})(?:$|[\/\?#])/;
		var alternateLinkFormatRegex = /^https?:\/\/(?:docs|drive)\.google\.com\/open\?id=([^&#]+)(?:$|[&#])/;
		
		var matches = googleDriveRegex.exec( link.href ) || alternateLinkFormatRegex.exec( link.href );
		return matches ? matches[1] : null;
	},
	
	_onEntityChanged: function( entity ) {
		if( this._hostPromise ) {
			this._hostPromise.then( function( host ) {
				host.close();
			});
			this._hostPromise = null;
		}
		
		var fileId = this._extractFileId( entity );
		if( !fileId ) {
			return;
		}
		
		var root = Polymer.dom( this.root );
		this._hostPromise = new window.ifrauhost(
			function() { return root; },
			this.fraEndpoint,
			{
				resizeFrame: false,
				syncFont: true,
				syncLang: true,
				syncPageTitle: false,
				height: '100%',
				allowFullScreen: !this.denyFullscreen
			}
		)
		.onRequest( 'options', { fileId: fileId } )
		.onEvent( 'initialized', this.fire.bind( this, 'initialized' ) )
		.onEvent( 'initFailed', this.fire.bind( this, 'initFailed' ) )
		.onEvent( 'accessDenied', this.fire.bind( this, 'accessDenied' ) )
		.onEvent( 'fileTrashed', this.fire.bind( this, 'fileTrashed' ) )
		.onEvent( 'found', this.fire.bind( this, 'found' ) )
		.connect();

		this._hostPromise.then( function( host ) {
			host.iframe.scrolling = 'auto';
		});
	}
	
});
