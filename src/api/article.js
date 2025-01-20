import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function addArticle(data) {
  return request({
    url: '/admin/article/add',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/admin/article/update',
    method: 'put',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: '/admin/article/delete',
    method: 'delete',
    data: data
  })
}
