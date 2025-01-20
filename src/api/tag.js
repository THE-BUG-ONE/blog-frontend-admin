import request from '@/utils/request'

export function getTagOptionList() {
  return request({
    url: '/tag/option',
    method: 'get'
  })
}
