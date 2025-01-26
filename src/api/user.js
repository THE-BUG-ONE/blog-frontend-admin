import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/admin/user/getUserInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function fetchList(query) {
  return request({
    url: '/admin/user/list',
    method: 'get',
    params: query
  })
}

export function updateUser(data) {
  return request({
    url: '/admin/user/update',
    method: 'put',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/admin/user/delete',
    method: 'delete',
    data
  })
}

export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data
  })
}

export function getCode(email) {
  return request({
    url: '/code',
    method: 'get',
    params: { email }
  })
}
