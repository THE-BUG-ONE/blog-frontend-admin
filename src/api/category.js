import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params: query
  })
}

export function addCategory(categoryName) {
  return request({
    url: '/admin/category/add',
    method: 'post',
    params: { categoryName }
  })
}

export function deleteCategory(query) {
  return request({
    url: '/admin/category/delete',
    method: 'delete',
    data: query
  })
}

export function updateCategory(query) {
  return request({
    url: '/admin/category/update',
    method: 'put',
    data: query
  })
}

export function getCategoryOptionList() {
  return request({
    url: '/category/option',
    method: 'get'
  })
}
