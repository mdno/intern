import has = require('dojo/has');
import { deepDelegate } from 'dojo/lang';
import Executor from './Executor';
import Suite from '../Suite';
import { InternConfig } from './PreExecutor';

interface InternClientConfig extends InternConfig {
	rootSuiteName?: string;
	sessionId?: string;
}

/**
 * The Client executor is used to run unit tests in the local environment.
 *
 * @constructor module:intern/lib/executors/Client
 * @extends module:intern/lib/executors/Executor
 */
export default class Client extends Executor {
	config: InternClientConfig = deepDelegate(this.config, {
		reporters: [ 'Console' ]
	});

	mode = 'client';

	protected _afterRun() {
		const self = this;

		function unloadReporters() {
			self.reporterManager.empty();
		}

		return super._afterRun.apply(this, arguments).finally(unloadReporters);
	}

	protected _beforeRun() {
		const self = this;
		const config = this.config;
		const suite = new Suite({
			// rootSuiteName is provided by ClientSuite
			name: config.rootSuiteName || null,
			grep: config.grep,
			sessionId: config.sessionId,
			timeout: config.defaultTimeout,
			reporterManager: this.reporterManager
		});

		this.suites = [ suite ];

		function loadTestModules() {
			return self._loadTestModules(config.suites);
		}

		return super._beforeRun.apply(this, arguments).then(loadTestModules);
	}
}

if (has('host-browser')) {
	Client.prototype.config.reporters.push({ id: 'Html' });
}