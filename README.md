# er_memcached_data_server
Plugin for event_request that implements a memcached data server

# Notes:
- Memcached DOES NOT support negative numbers when decrementing and OR decrementing

# Use:
~~~javascript
// Get the data server only
const MemcachedDataServer   = require( 'er_memcached_data_server' );

// Get the plugin that you can attach instead of the default one
const { Server }            = require( 'event_request' );
const app                   = Server();

app.apply( MemcachedDataServer.getPlugin() );
~~~