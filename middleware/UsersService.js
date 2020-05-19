import Api from '@/middleware/api'

export default {
  fetchUsers () {
    return Api().get('users')
  },

  addUser (params) {
    return Api().post('users', params)
  },

  updateUser (params) {
    return Api().put(`user/${params.id}`, params)
  },

  getUser (params) {
    return Api().get(`user/${params.id}`)
  },
  deleteUser (id) {
    return Api().delete(`user/${id}`)
  }

}