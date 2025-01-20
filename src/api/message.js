import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/message/list',
    method: 'get',
    params: query
  })
}

export function updateMessage(data) {
  return request({
    url: '/admin/message/update',
    method: 'put',
    data
  })
}

export function deleteMessage(data) {
  return request({
    url: '/admin/message/delete',
    method: 'delete',
    data
  })
}
