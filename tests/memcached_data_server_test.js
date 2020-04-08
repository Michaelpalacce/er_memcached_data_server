'use strict';

const { test, assert, runAllTests }	= require( 'event_request' ).Testing;

const DataServer			= require( '../src/memcached_data_server' );
const path					= require( 'path' );
const fs					= require( 'fs' );

const PROJECT_ROOT			= path.parse( require.main.filename ).dir;
const DEFAULT_PERSIST_FILE	= path.join( PROJECT_ROOT, 'cache' );

/**
 * @brief	Removes the cache file
 */
function removeCache( dataServer )
{
	if ( dataServer )
	{
		dataServer.server.flush(()=>{});
	}
}

test({
	message	: 'DataServer.set sets data',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer();
			const key			= `key${Math.random()}`
			const value			= 'value';
			const ttl			= 100;
			const persist		= true;
			let called			= 0;

			dataServer.on( 'set', ()=>{
				called ++;
			});

			await dataServer.set( key, value, ttl, { persist } );

			const dataSet	= await dataServer.get( key );

			assert.equal( dataSet !== null, true );

			assert.equal( dataSet, value );
			assert.equal( called, 1 );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.set sets data without options',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async()=>{
			const dataServer	= new DataServer();
			const key			= `key${Math.random()}`
			const value			= 'value';
			const ttl			= 100;

			await dataServer.set( key, value, ttl );

			const dataSet	= await dataServer.get( key );

			assert.equal( dataSet !== null, true );
			assert.equal( dataSet, value );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.set with ttl === -1',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async()=>{
			const dataServer	= new DataServer( { persist: false } );
			const key			= `key${Math.random()}`
			const value			= 'value';
			const ttl			= -1;

			await dataServer.set( key, value, ttl );

			const dataSet	= await dataServer.get( key );

			assert.equal( dataSet !== null, true );
			assert.equal( dataSet, value );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.set fails on handleError',
	dataProvider	: [
		['key', 'value', 10, 123],
		['key', 'value', 10, 'str'],
		['key', 'value', 10, false],
		['key', 'value', null, { persist: false }],
		['key', 'value', [], { persist: false }],
		['key', 'value', 'str', { persist: false }],
		['key', 'value', false, { persist: false }],
		['key', 'value', {}, { persist: false }],
	],
	test			: ( done, key, value, ttl, options )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );

			assert.equal( await dataServer.set( key, value, ttl, options ), null );
			assert.equal( await dataServer.get( key ) === null, true );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.get gets data',
	test	: ( done )=>{
		removeCache();
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );
			const key			= `key${Math.random()}`
			const value			= 'value';
			const ttl			= 100;
			const persist		= true;
			const expected		= { key: { key, value, ttl, persist } };
			let called			= 0;

			dataServer.on( 'get', ()=>{
				called ++;
			});

			await dataServer.set( key, value, ttl );
			const dataSet	= await dataServer.get( key );

			assert.equal( dataSet, value );
			assert.equal( called, 1 );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.get with invalid data',
	dataProvider	: [
		['key', 123],
		['key', false],
		[undefined, {}],
		[null, {}],
		[false, {}],
		[[], {}],
		[{}, {}],
	],
	test			: ( done, key, options )=>{
		removeCache();
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );

			assert.equal( await dataServer.get( key, options ), null );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.get prunes ( when expired it will be null )',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );
			const key			= `key${Math.random()}`
			const value			= 'value';
			const ttl			= 1;
			const persist		= true;

			await dataServer.set( key, value, ttl, { persist } );

			setTimeout( async ()=>{
				assert.equal( await dataServer.get( key ), null );

				removeCache( dataServer );
				done();
			}, 1100 );
		}, 10 );
	}
});

test({
	message	: 'DataServer.touch updates expirationDate',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );
			const key			= `key${Math.random()}`;
			const value			= 'value';
			const ttl			= 1;
			const persist		= true;
			let called			= 0;

			dataServer.on( 'touch', ()=>{
				called ++;
			});


			await dataServer.set( key, value, ttl, { persist } );
			await dataServer.touch( key, 5 );

			setTimeout( async()=>{
				const dataSet	= await dataServer.get( key );

				assert.equal( dataSet, value );
				assert.equal( called, 1 );

				removeCache( dataServer );
				done();
			}, 1100 );
		}, 10 );
	}
});

test({
	message			: 'DataServer.touch with invalid data',
	dataProvider	: [
		['key', '123', {}],
		[false, '123', {}],
		[[], '123', {}],
		[{}, '123', {}],
		[null, '123', {}],
		[undefined, '123', {}],
		['key', [], {}],
		['key', {}, {}],
		['key', false, {}],
		['key', null, {}],
		['key', null, 123],
		['key', null, 'string'],
		['key', null, false]
	],
	test			: ( done, key, ttl, options )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );
			await dataServer.set( key, '123' );

			assert.equal( await dataServer.touch( key, ttl, options ), false );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.delete removes key and returns true but returns false if it does not exist or not string',
	test	: ( done )=>{
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer({ persist: false });
			const key			= `key${Math.random()}`
			const value			= { test: 'value' };
			let called			= 0;

			dataServer.on( 'delete', ()=>{
				called ++;
			});

			await dataServer.set( key, value );

			assert.equal( await dataServer.delete( 123 ), false );
			assert.equal( await dataServer.delete( key ), true );
			assert.equal( await dataServer.delete( key ), true );
			// 2 because one is with invalid arguments
			assert.equal( called, 2 );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.increment increments data',
	dataProvider	: [
		[100, 100, 200],
		[0, 100, 100],
		[-1, 100, null],
		['string', 100, null],
		[[], 100, null],
		[{}, 100, null],
		[100, null, null],
		[100, 'string', null],
		[100, {}, null],
		[100, [], null],
	],
	test	: async ( done, value, increment, expectedValue )=>{
		removeCache();

		const dataServer	= new DataServer({ persist: false });
		const key			= `key${Math.random()}`;
		let called			= 0;

		dataServer.on( 'increment', ()=>{
			called ++;
		});

		await dataServer.set( key, value ).catch( done );

		const result	= await dataServer.increment( key, increment ).catch( done );

		if ( expectedValue === null )
		{
			removeCache( dataServer );
			return done( ! ( false === result ) );
		}

		if ( result === null )
		{
			return done( `Result was null but expected: ${expectedValue}` );
		}

		assert.equal( result, expectedValue );
		assert.equal( called, 1 );

		removeCache( dataServer );
		done();
	}
});

test({
	message	: 'DataServer.decrement decrement data',
	dataProvider	: [
		[100, 100, 0],
		[0, 100, 0],
		[1, 100, 0],
		[100, 99, 1],
		[100, 50, 50],
		['string', 100, null],
		[[], 100, null],
		[{}, 100, null],
		[100, null, null],
		[100, 'string', null],
		[100, {}, null],
		[100, [], null],
	],
	test	: async ( done, value, decrement, expectedValue )=>{
		removeCache();

		const dataServer	= new DataServer({ persist: false });
		const key			= `key${Math.random()}`
		let called			= 0;

		dataServer.on( 'decrement', ()=>{
			called ++;
		});

		await dataServer.set( key, value ).catch( done );

		const result	= await dataServer.decrement( key, decrement ).catch( done );

		if ( expectedValue === null )
		{
			removeCache( dataServer );
			return done( ! ( false === result ) );
		}

		if ( result === null )
		{
			return done( `Result was null but expected: ${expectedValue}` );
		}

		assert.equal( result, expectedValue );
		assert.equal( called, 1 );

		removeCache( dataServer );
		done();
	}
});

test({
	message			: 'DataServer.set does not set if invalid data',
	dataProvider	: [
		[null, 'value', 100, true],
		['key', null, 100, true],
		['key', 'value', null, true],
		[123, 'value', 100, true],
		['key', 'value', '100', true],
		['key', 'value', 100, 'true'],
		[null, 'value', 100, 'true'],
		[undefined, 'value', 100, 'true'],
		[[], 'value', 100, 'true'],
		[{}, 'value', 100, 'true'],
		[false, 'value', 100, 'true'],
	],
	test			: ( done, key, value, ttl, persist )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );

			assert.equal( await dataServer.set( key, value, ttl, persist ), null );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.lock locks data correctly',
	test			: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );
			let called			= 0;

			dataServer.on( 'lock', ()=>{
				called ++;
			});

			await dataServer.unlock( 'key' );

			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), false );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), false );

			assert.equal( called, 4 );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.lock locks data correctly with double unlock',
	test			: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );

			await dataServer.unlock( 'key' );

			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), false );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), false );

			await dataServer.unlock( 'key' );
			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.unlock always returns true',
	test			: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );
			let called			= 0;

			dataServer.on( 'unlock', ()=>{
				called ++;
			});

			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( called, 3 );

			await dataServer.unlock( 'key' );
			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.lock acquires only one lock',
	test			: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );
			const promises		= [];

			for ( let i = 0; i < 10000; i ++ )
				promises.push( dataServer.lock( 'key' ) );

			Promise.all( promises ).then( async( locks )=>{
				let acquiredLocks	= 0;
				for ( const lock of locks )
				{
					if ( lock )
						acquiredLocks ++;
				}

				assert.equal( acquiredLocks, 1 );

				await dataServer.unlock( 'key' );
				removeCache( dataServer );
				done();
			}).catch( done );
		}, 10 );
	}
});

test({
	message			: 'DataServer.lockBurst acquires another lock with burst of locks',
	test			: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( async ()=>{
			const dataServer	= new DataServer( { persist: false } );
			const promises		= [];
			const key			= `key${Math.random()}lockBurst`;

			for ( let i = 0; i < 200; i ++ )
			{
				if ( i % 20 === 0 )
					dataServer.unlock( key );

				promises.push( dataServer.lock( key ) );
			}

			Promise.all( promises ).then( async( locks )=>{
				let acquiredLocks	= 0;
				for ( const lock of locks )
				{
					if ( lock )
						acquiredLocks ++;
				}

				// Variable since there is a slight change of a race condition that is due to memcached
				assert.equal( acquiredLocks === 10 || acquiredLocks === 11, true );

				removeCache( dataServer );
				done();
			}).catch( done );
		}, 10 );
	}
});

runAllTests();