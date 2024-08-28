import request from '@/utils/request'

// datax插件api

export function list(params) {
  return request({
    url: '/api/jobJdbcDatasource',
    method: 'get',
    params
  })
}

export function fetched(params) {
  return request({
    url: '/api/jobJdbcDatasource/' + params,
    method: 'get'
  })
}

export function updated(data) {
  return request({
    url: '/api/jobJdbcDatasource',
    method: 'put',
    data
  })
}

export function created(data) {
  return request({
    url: '/api/jobJdbcDatasource',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/api/jobJdbcDatasource',
    method: 'delete',
    params: data
  })
}

export function test(data) {
  return request({
    url: '/api/jobJdbcDatasource/test',
    method: 'post',
    data
  })
}

export function getDataSourceList(params) {
  return request({
    url: '/api/jobJdbcDatasource/all',
    method: 'get',
    params
  })
}

export function uploadFile(data) {
  console.log(data)
  return request({
    url: '/api/jobJdbcDatasource/uploadFile',
    headers: {'Content-Type': 'multipart/form-data'},
    method: 'post',
    data
  })
}

export function uploadDir(data) {
  return request({
    url: '/api/uploadDir',
    headers: {'Content-Type': 'multipart/form-data'},
    method: 'post',
    data
  })
}

export function getCsvHeader(params) {
  return request({
    url: '/api/getCsvHeader',
    methods: 'get',
    params
  })
}

export function getFileList(params) {
  return request({
    url: 'api/getFileList',
    methods: 'get',
    params
  })
}
