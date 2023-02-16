import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar一个进度条的插件
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
// 权限
// import { asyncRoutes } from '@/router'

NProgress.configure({ showSpinner: false }) // NProgress Configuration是否有转圈效果

const whiteList = ['/login'] // no redirect whitelist没有重定向白名单

router.beforeEach(async (to, from, next) => {
  // start progress bar进度条开始
  NProgress.start()

  // set page title设置页面标题
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in确定用户是否登录
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // 如果已经登录重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {

      // 权限
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          // 注意：角色必须是一个对象数组！ such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // 动态添加可访问路由
          router.addRoutes(accessRoutes)

          // hack方法确保addRoutes完成
          // 将replace:true设置为true，这样导航将不会留下历史记录
          next({ ...to, replace: true })
        } catch (error) {
          // 删除token令牌并转到登录页面重新登录
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }

      // 确定用户是否通过getInfo获得权限角色
      // const hasGetUserInfo = store.getters.name
      // if (hasGetUserInfo) {
      //   next()
      // } else {
      //   try {
      //     // get user info获取用户信息
      //     // 实际是请求用户信息后返回，这里模拟数据直接从store中拿
      //     await store.dispatch('user/getInfo')
      //     next()
      //   } catch (error) {
      //     // 删除token,进入登录页面重新登录
      //     await store.dispatch('user/resetToken')
      //     Message.error(error || 'Has Error')
      //     next(`/login?redirect=${to.path}`)
      //     NProgress.done()
      //   }
      // }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      //没有访问权限的其它页面被重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar完成进度条
  NProgress.done()
})
