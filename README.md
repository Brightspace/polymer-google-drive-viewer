# polymer-google-drive-viewer
A Polymer web component that embeds the Google Drive viewer 

**For the React component version, go [here](https://github.com/Brightspace/react-google-drive-viewer)**


### Properties
The `<google-drive-viewer>` component takes in the following properties:
* `href` - The href of either an `activity` or a `sequenced-activity`
* `token` - An OAuth2 token
* `fra-endpoint` *(Optional)* - An override for the FRA endpoint of the Google Drive Viewer FRA
* `deny-fullscreen` *(Optional)* - A boolean flag that prevents the iframed Google Drive document from being made fullscreen

### Events
The component also emits events which you can optionally catch to create a deeper integration of the component with your app. You do not need to listen on any of these events for the component to function, but they may be useful if you want other parts of your app to respond to the Google Drive Viewer.

Each event contains a `detail` property with the listed properties.

* `initialized` -  Called when the required Google API components are finished loading
> `detail.operationMilliseconds` (number) - The number of milliseconds it took to load and initialize the API library.
* `initFailed` -  Called if the app fails to load the Google API 
> `detail.error` (object) - The error object returned by the failing load function.
* `found` -  Called when the file information is successfully fetched from Google Drive 
> `detail.embedUrl ` (string) - The embed URL of the file. The iframe navigates to this URL after this event is fired. <br/>
> `detail.downloadUrl` (string|null) - The download URL of the file if Google provides one; otherwise, **null**. <br/>
> `detail.operationMilliseconds` (number) - The response time of the API call in milliseconds. <br/>
> `detail.responseData` (object) - The parsed JSON response body.
* `fileTrashed` -   Called when the file information is fetched, but the file has been trashed 
> `detail.operationMilliseconds` (number) - The response time of the API call in milliseconds. <br/>
> `detail.responseData` (object) - The parsed JSON response body.
* `accessDenied` -  Called when the current user does not have access to the requested file, or it does not exist. 
> `detail.operationMilliseconds` (number) - The response time of the API call in milliseconds. <br/>
> `detail.error` (object) - The error object returned by the API client library.
