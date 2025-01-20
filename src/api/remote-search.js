import request from '@/utils/request'

export function searchUser(username) {
  return request({
    url: '/user/search',
    method: 'get',
    params: { username }
  })
}

export function transactionList(query) {
  return request({
    url: '/vue-element-admin/transaction/list',
    method: 'get',
    params: query
  })
}
