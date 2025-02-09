/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AccountController = () => import('#controllers/account_controller')
const StatsWidgetController = () => import('#controllers/stats_widget_controller')
const StatsController = () => import('#controllers/stats_controller')
const ReportController = () => import('#controllers/report_controller')
const ProfileController = () => import('#controllers/profile_controller')
const ReferentController = () => import('#controllers/referent_controller')
const HomeController = () => import('#controllers/home_controller')
const CategoryController = () => import('#controllers/category_controller')
const TransactionController = () => import('#controllers/transaction_controller')
const LoginController = () => import('#controllers/login_controller')
const ToolsController = () => import('#controllers/tools_controller')

router.where('id', router.matchers.number())
router.where('fileid', router.matchers.number())

router
  .group(() => {
    router.get('/', [HomeController, 'index']).as('home.index')

    router.get('/transaction/create', [TransactionController, 'create']).as('transaction.create')
    router.put('/transaction/:id', [TransactionController, 'update']).as('transaction.update')
    router.delete('/transaction/:id', [TransactionController, 'destroy']).as('transaction.destroy')
    router.get('/transaction/:id', [TransactionController, 'show']).as('transaction.show')
    router.post('/transaction', [TransactionController, 'store']).as('transaction.store')
    router
      .get('/transaction/:id/file/:fileId', [TransactionController, 'file'])
      .as('transaction.file')

    router.get('/category/create', [CategoryController, 'create']).as('category.create')
    router.post('/category', [CategoryController, 'store']).as('category.store')
    router.get('/category', [CategoryController, 'index']).as('category.index')
    router.delete('/category/:id', [CategoryController, 'destroy']).as('category.delete')

    router.get('/referent/create', [ReferentController, 'create']).as('referent.create')
    router.post('/referent', [ReferentController, 'store']).as('referent.store')
    router.get('/referent', [ReferentController, 'index']).as('referent.index')
    router.delete('/referent/:id', [ReferentController, 'destroy']).as('referent.delete')

    router.patch('/user/:id/profile', [ProfileController, 'update']).as('profile.update')

    router.delete('/login', [LoginController, 'destroy']).as('auth.destroy')

    router.get('/tools', [ToolsController, 'index']).as('tools.index')

    router.get('/report', [ReportController, 'index']).as('report.index')

    router.get('/stats', [StatsController, 'index']).as('stats.index')

    router
      .get('/stats/widget/overview', [StatsWidgetController, 'overview'])
      .as('stats.widget.overview')
    router
      .get('/stats/widget/treasury', [StatsWidgetController, 'treasury'])
      .as('stats.widget.treasury')
    router
      .get('/stats/widget/turnover', [StatsWidgetController, 'turnover'])
      .as('stats.widget.turnover')
    router
      .get('/stats/widget/expensesByCategory', [StatsWidgetController, 'expensesByCategory'])
      .as('stats.widget.expensesByCategory')
    router
      .get('/stats/widget/recipesByCategory', [StatsWidgetController, 'recipesByCategory'])
      .as('stats.widget.recipesByCategory')
    router
      .get('/stats/widget/recipesExpensesRatio', [StatsWidgetController, 'recipesExpensesRatio'])
      .as('stats.widget.recipesExpensesRatio')
    router
      .get('/stats/widget/expensesByReferent', [StatsWidgetController, 'expensesByReferent'])
      .as('stats.widget.expensesByReferent')
    router
      .get('/stats/widget/recipesByReferent', [StatsWidgetController, 'recipesByReferent'])
      .as('stats.widget.recipesByReferent')

    router.get('/account', [AccountController, 'index']).as('account.index')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/login', [LoginController, 'index']).as('auth.index')
    router.post('/login', [LoginController, 'store']).as('auth.store')
  })
  .use(middleware.guest())
