import request from '@/utils/request'

export function getBlogInfo() {
  return request({
    url: '/blog-info',
    method: 'get'
  })
}
