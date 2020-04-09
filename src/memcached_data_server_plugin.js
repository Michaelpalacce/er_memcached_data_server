'use strict';

const DataServerPlugin	= require( 'event_request/server/plugins/available_plugins/data_server_plugin' );
const DataServer		= require( './memcached_data_server' );

module.exports	= ( dataServerOptions )=>{
	const dataServer	= new DataServer( dataServerOptions );
	return new DataServerPlugin( 'er_data_server', { dataServer } );
};
