'use strict';

const { lazyLoadAdapter } = require('../shared/utils');
const EhrRestService = require('./ehrRestService');

class OpenEhrRegistry {
  constructor(ctx) {
    this.ctx = ctx;
  }

  initialise(host) {
    const hostConfig = this.ctx.userDefined.openehr[host];

    if (!hostConfig) {
      throw new Error(`Config for ${host} host is not defined.`)
    }

    return new EhrRestService(this.ctx, host, hostConfig);
  }

  static create(ctx) {
    return lazyLoadAdapter(new OpenEhrRegistry(ctx));
  }
}

module.exports = OpenEhrRegistry;
