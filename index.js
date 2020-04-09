'use strict';

// Data Server
const MemcachedDataServer		= require( './src/memcached_data_server' );
MemcachedDataServer.getPlugin	= require( './src/memcached_data_server_plugin' );

module.exports					= MemcachedDataServer;