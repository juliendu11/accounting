import { HttpContext } from '@adonisjs/core/http'

export default class ToolsController {
  async index({ inertia }: HttpContext) {
    return inertia.render('tools/index')
  }
}
