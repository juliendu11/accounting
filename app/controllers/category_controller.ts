import { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import { createCategoryValidator } from '#validators/category'
import db from '@adonisjs/lucid/services/db'

export default class CategoryController {
  async create({ inertia }: HttpContext) {
    return inertia.render('category/create')
  }

  async index({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const categories = await Category.query().where('user_id', user.id)

    return inertia.render('category/index', { categories })
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createCategoryValidator)
    const user = auth.getUserOrFail()

    await Category.create({
      ...payload,
      userId: user.id,
    })

    return response.redirect().toRoute('category.index')
  }

  async destroy({ params, auth, response, session, i18n }: HttpContext) {
    const user = auth.getUserOrFail()

    const category = await Category.findBy({ id: params.id, userId: user.id })

    if (!category) {
      session.flash('notification', {
        type: 'error',
        message: i18n.t('messages.category_not_found_error'),
      })
      return response.redirect().back()
    }

    await db.transaction(async (trx) => {
      await category.related('transactions').detach([], trx)
      await category.delete()
    })

    return response.redirect().toRoute('category.index')
  }
}
