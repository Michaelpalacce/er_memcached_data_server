'use strict';

const DataServer	= require( 'event_request/server/components/caching/data_server' );
const Memcached		= require( 'memcached' );

const OPTIONS_SERVER_LOCATIONS	= 'serverLocations';
const OPTIONS_SERVER_OPTIONS	= 'serverOptions';
const DEFAULT_TTL				= 300;
const MAX_TTL					= 2592000;

/**
 * @brief	Data server that stores data in a local or remote memcached instance
 */
class MemcachedDataServer extends DataServer
{
	_configure( options )
	{
		const serverLocations	= typeof options[OPTIONS_SERVER_LOCATIONS] !== 'undefined'
								? options[OPTIONS_SERVER_LOCATIONS]
								: '';

		const serverOptions		= typeof options[OPTIONS_SERVER_OPTIONS] !== 'undefined'
								? options[OPTIONS_SERVER_OPTIONS]
								: { poolSize: 100 };

		this.defaultTtl			= typeof options['ttl'] === 'number'
								? options['ttl']
								: DEFAULT_TTL;

		this.defaultTtl			= this.defaultTtl === -1 ? Infinity : this.defaultTtl;

		this.server				= new Memcached( serverLocations, serverOptions );
	}

	/**
	 * @copydoc	DataServer::_stop()
	 */
	_stop()
	{
		this.server.end(()=>{});
	}

	/**
	 * @copydoc	DataServer::_get()
	 */
	_get( key, options )
	{
		return new Promise(( resolve, reject )=>{
			this.server.get( key, ( err, response ) => {
				if ( err )
					reject( err );

				resolve( typeof response !== 'undefined' ? response : null );
			})
		});
	}

	/**
	 * @copydoc	DataServer::_set()
	 */
	async _set( key, value, ttl, options )
	{
		return new Promise(( resolve, reject )=>{
			this.server.set( key, value, this._getTtl( ttl ), ( error )=>{
					if ( error )
						reject( error );

					resolve( value );
				}
			);
		});
	}

	/**
	 * @copydoc	DataServer::_delete()
	 */
	async _delete( key, options )
	{
		return new Promise(( resolve, reject )=>{
			this.server.del( key, ( error )=>{
					if ( error )
						reject( error );

					resolve( true );
				}
			);
		});
	}

	/**
	 * @copydoc	DataServer::_increment()
	 */
	async _increment( key, value, options )
	{
		return new Promise(( resolve, reject )=>{
			this.server.incr( key, value, ( error, result )=>{
					if ( error )
						resolve( false );

					if ( result === false || result === undefined )
						resolve( false );

					resolve( result );
				}
			);
		});
	}

	/**
	 * @copydoc	DataServer::_decrement()
	 */
	async _decrement( key, value, options )
	{
		return new Promise(( resolve, reject )=>{
			this.server.decr( key, value, ( error, result )=>{
					if ( error )
						resolve( false );

					if ( result === false || result === undefined )
							resolve( false );

					resolve( result );
				}
			);
		});
	}

	/**
	 * @copydoc	DataServer::_touch()
	 */
	async _touch( key, ttl, options )
	{
		return new Promise(( resolve, reject )=>{
			this.server.touch( key, this._getTtl( ttl ), ( error, result )=>{
					if ( error )
						reject( error );

					if ( result === false )
						resolve( false );

					resolve( result );
				}
			);
		});
	}

	/**
	 * @copydoc	DataServer::_lock()
	 */
	async _lock( key, options )
	{
		const promisify	= require( 'util' ).promisify;
		const serverAdd	= promisify( this.server.add.bind( this.server ) );

		return await serverAdd( key, DataServer.LOCK_VALUE, MAX_TTL ).catch(()=>{
			return false;
		});
	}

	/**
	 * @copydoc	DataServer::_lock()
	 */
	async _unlock( key, options )
	{
		const promisify	= require( 'util' ).promisify;
		const serverDel	= promisify( this.server.del.bind( this.server ) );

		await serverDel( key );

		return true;
	}

	/**
	 * @copydoc	DataServer::_getTtl()
	 */
	_getTtl( ttl = -1 )
	{
		ttl	= super._getTtl( ttl );

		if ( ttl === Infinity || ttl > MAX_TTL )
			ttl	= MAX_TTL;

		return ttl;
	}
}

module.exports	= MemcachedDataServer;