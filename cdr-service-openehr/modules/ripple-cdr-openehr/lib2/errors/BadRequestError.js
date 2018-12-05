'use strict'

function BadRequestError(message, userMessage, reason, meta, statusCode, code) {
  this.message = message || 'Bad request'
  this.stack = new Error().stack
  this.errorType = this.name
  this.statusCode = statusCode || 400
  this.code = code || 'BadRequest'
  this.userMessage = userMessage || message
  this.meta = meta
  this.reason = reason
}

BadRequestError.prototype = Object.create(Error.prototype)
BadRequestError.prototype.name = 'BadRequestError'

module.exports = BadRequestError;
