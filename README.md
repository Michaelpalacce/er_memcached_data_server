# er_memcached_data_server

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3582b90b7f824a73b44f67e3594a36a0)](https://app.codacy.com/manual/Michaelpalacce/er_memcached_data_server?utm_source=github.com&utm_medium=referral&utm_content=Michaelpalacce/er_memcached_data_server&utm_campaign=Badge_Grade_Dashboard)

Plugin for event_request that implements a memcached data server

# Notes:
- Memcached DOES NOT support negative numbers when decrementing and OR incrementing
- Memcached MAX TTL is 2592000 or 30 days, that will be enforced if a bigger number is given

# Use:
~~~javascript
// Get the data server only
const MemcachedDataServer = require( 'er_memcached_data_server' );

// Get the plugin that you can attach instead of the default one
const { App } = require( 'event_request' );
const app = App();

app.apply( MemcachedDataServer.getPlugin() );
~~~
