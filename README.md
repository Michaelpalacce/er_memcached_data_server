# er_memcached_data_server

[![Build Status](https://travis-ci.com/Michaelpalacce/er_memcached_data_server.svg?branch=master)](https://travis-ci.com/Michaelpalacce/er_memcached_data_server) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3582b90b7f824a73b44f67e3594a36a0)](https://app.codacy.com/manual/Michaelpalacce/er_memcached_data_server?utm_source=github.com&utm_medium=referral&utm_content=Michaelpalacce/er_memcached_data_server&utm_campaign=Badge_Grade_Dashboard) [![codecov](https://codecov.io/gh/Michaelpalacce/er_memcached_data_server/branch/master/graph/badge.svg)](https://codecov.io/gh/Michaelpalacce/er_memcached_data_server) ![Maintenance](https://img.shields.io/maintenance/yes/2020) [![Known Vulnerabilities](https://snyk.io/test/github/Michaelpalacce/er_memcached_data_server/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Michaelpalacce/er_memcached_data_server?targetFile=package.json) ![GitHub top language](https://img.shields.io/github/languages/top/MichaelPalacce/er_memcached_data_server) ![npm bundle size](https://img.shields.io/bundlephobia/min/er_memcached_data_server) ![npm](https://img.shields.io/npm/dw/er_memcached_data_server) ![npm](https://img.shields.io/npm/dt/er_memcached_data_server) ![GitHub issues](https://img.shields.io/github/issues/MichaelPalacce/er_memcached_data_server) ![GitHub last commit](https://img.shields.io/github/last-commit/MichaelPalacce/er_memcached_data_server)

Plugin for event_request that implements a memcached data server

# Notes:
- Memcached DOES NOT support negative numbers when decrementing and OR incrementing
- Memcached MAX TTL is 2592000 or 30 days, that will be enforced if a bigger number is given
- Memcached returns numbers as numbers and not strings if given as numbers

# Use:
~~~javascript
// Get the data server only
const MemcachedDataServer = require( 'er_memcached_data_server' );

// Get the plugin that you can attach instead of the default one
const { App } = require( 'event_request' );
const app = App();

app.apply( MemcachedDataServer.getPlugin() );
~~~
