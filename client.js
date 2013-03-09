/*jshint node:true */
if (typeof process !== 'undefined' && typeof define === 'undefined') {
	(function () {
		var pathUtils = require('path');

		global.dojoConfig = {
			async: 1,
			baseUrl: pathUtils.resolve(__dirname, '..'),
			deps: [ 'teststack/client' ],
			packages: [
				{ name: 'dojo-ts', location: pathUtils.resolve(__dirname, 'dojo') },
				{ name: 'teststack', location: __dirname }
			],
			tlmSiblingOfDojo: 0
		};

		require('./dojo/dojo');
	})();
}
else {
	define([
		'./main',
		'./lib/args',
		'./lib/Suite',
		'dojo-ts/json',
		'dojo-ts/topic',
		'dojo-ts/_base/array',
		'require'
	], function (main, args, Suite, JSON, topic, array, require) {
		if (!args.config) {
			throw new Error('Missing "config" argument');
		}

		require([ args.config ], function (config) {
			// TODO: Use of the global require is required for this to work because config mechanics are in global
			// require only in the Dojo loader; this should probably not be the case
			this.require(config.loader);

			if (!args.suites) {
				args.suites = config.suites;
			}

			// args.suites might be an array or it might be a scalar value but we always need deps to be a fresh array.
			var deps = [].concat(args.suites);

			if (!args.reporters) {
				if (config.reporters) {
					args.reporters = config.reporters;
				}
				else {
					console.info('Defaulting to "console" reporter');
					args.reporters = 'console';
				}
			}

			// TODO: This is probably a fatal condition and so we need to let the runner know that no more information
			// will be forthcoming from this client
			if (typeof window !== 'undefined') {
				window.onerror = function (message, url, lineNumber) {
					var error = new Error(message + ' at ' + url + ':' + lineNumber);
					topic.publish('/error', error);
					topic.publish('/client/end', args.sessionId);
				};
			}
			else if (typeof process !== 'undefined') {
				process.on('uncaughtException', function (error) {
					topic.publish('/error', error);
				});
			}

			args.reporters = array.map([].concat(args.reporters), function (reporterModuleId) {
				// Allow 3rd party reporters to be used simply by specifying a full mid, or built-in reporters by
				// specifying the reporter name only
				if (reporterModuleId.indexOf('/') === -1) {
					reporterModuleId = './lib/reporters/' + reporterModuleId;
				}
				return reporterModuleId;
			});

			deps = deps.concat(args.reporters);

			// Client interface has only one environment, the current environment, and cannot run functional tests on
			// itself
			main.suites.push(new Suite({ name: 'main', sessionId: args.sessionId }));

			require(deps, function () {
				if (args.autoRun !== 'false') {
					main.run();
				}
			});
		});
	});
}
