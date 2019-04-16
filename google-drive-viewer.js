import 'd2l-polymer-siren-behaviors/store/entity-behavior.js';
import { PolymerElement, html } from '@polymer/polymer';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class GoogleDriveViewerElement extends mixinBehaviors(
	[ D2L.PolymerBehaviors.Siren.EntityBehavior ],
	PolymerElement
) {
	static get is() { return 'google-drive-viewer'; }
	
	static get template() {
		const template = html`
			<style>
				:host {
					width: 100%;
					height: 100%;
					overflow: hidden;
				}
			</style>
		`;
		template.setAttribute( 'strip-whitespace', true );
		return template;
	}
	
	static get properties() {
		return {
			_hostPromise: Object,
			fraEndpoint: {
				type: String,
				value: 'https://s.brightspace.com/apps/google-drive-viewer-fra/2.1.2/index.html'
			},
			denyFullscreen: {
				type: Boolean,
				value: false
			}
		};
	}
	
	disconnectedCallback() {
		if( this._hostPromise ) {
			this._hostPromise.then( function( host ) {
				host.close();
			});
			this._hostPromise = null;
		}
	}
	
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
		
		const link = entity.getLinkByRel( 'about' );
		if( !link || !link.href ) {
			return;
		}
		
		const googleDriveRegex = /^https?:\/\/(?:docs|drive)\.google\.com(?:\/a\/[^\/]+)?\/(?!forms\/)[^\/]+\/d\/([^\/\?#]{2,})(?:$|[\/\?#])/;
		const alternateLinkFormatRegex = /^https?:\/\/(?:docs|drive)\.google\.com\/open\?id=([^&#]+)(?:$|[&#])/;
		
		const matches = googleDriveRegex.exec( link.href ) || alternateLinkFormatRegex.exec( link.href );
		return matches ? matches[1] : null;
	}
	
	_relayEvent( eventName, eventDetails ) {
		this.dispatchEvent( new CustomEvent( eventName, { detail: eventDetails } ) );
	}
	
	_onEntityChanged( entity ) {
		if( this._hostPromise ) {
			this._hostPromise.then( function( host ) {
				host.close();
			});
			this._hostPromise = null;
		}
		
		const fileId = this._extractFileId( entity );
		if( !fileId ) {
			return;
		}
		
		const root = this.shadowRoot;
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
		.onEvent( 'initialized', this._relayEvent.bind( this, 'initialized' ) )
		.onEvent( 'initFailed', this._relayEvent.bind( this, 'initFailed' ) )
		.onEvent( 'accessDenied', this._relayEvent.bind( this, 'accessDenied' ) )
		.onEvent( 'fileTrashed', this._relayEvent.bind( this, 'fileTrashed' ) )
		.onEvent( 'found', this._relayEvent.bind( this, 'found' ) )
		.connect();

		this._hostPromise.then( function( host ) {
			host.iframe.scrolling = 'auto';
		});
	}
	
};

if( window.ifrauhost ) {
	customElements.define(GoogleDriveViewerElement.is, GoogleDriveViewerElement);
} else {
	const ifrauImport = document.createElement( 'script' );
	ifrauImport.src = 'https://s.brightspace.com/lib/ifrau/0.24.0/ifrau/host.js';
	ifrauImport.onload = function() {
		customElements.define(GoogleDriveViewerElement.is, GoogleDriveViewerElement);
	};
	document.head.appendChild(ifrauImport);
}
