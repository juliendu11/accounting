import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'
import hrTime from 'pretty-hrtime'

emitter.on('db:query', function (query) {
  if (query.duration) {
    logger.info(`mysql: (${hrTime(query.duration)}) ${query.sql} - [${query.bindings}]`)
  } else {
    logger.info(`mysql: ${query.sql} - [${query.bindings}]`)
  }
})
