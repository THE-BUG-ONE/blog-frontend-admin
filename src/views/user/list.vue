<template>
  <div class="app-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar'">
        <el-button v-loading="loading" type="danger" icon="el-icon-delete" plain @click="deleteItem">
          删除
        </el-button>
      </sticky>

      <el-table ref="table" v-loading="listLoading" :data="list" border fit highlight-current-row stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" :selectable="checkSelectable" />

        <el-table-column align="center" label="ID" width="80">
          <template slot-scope="{row}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="用户角色">
          <template slot-scope="{row,$index}">
            <span v-if="!showEdit[$index]">{{ row.roleList[0] }}</span>
            <el-form-item :inline-message="true" style="margin-bottom: 0px" prop="roleId">
              <el-radio-group v-if="showEdit[$index]" v-model="postForm.roleId" size="small">
                <el-radio-button :label="2">普通用户</el-radio-button>
                <el-radio-button :label="3">测试用户</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column width="120px" align="center" label="是否禁用">
          <template slot-scope="{row,$index}">
            <div v-if="!showEdit[$index]">
              <span v-if="row.isDisable === 1">是</span>
              <span v-else>否</span>
            </div>
            <el-form-item :inline-message="true" style="margin-bottom: 0px" prop="isDisable">
              <el-radio-group v-if="showEdit[$index]" v-model="postForm.isDisable" size="small">
                <el-radio-button :label="1">是</el-radio-button>
                <el-radio-button :label="0">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="昵称">
          <template slot-scope="{row}">
            <span>{{ row.nickname }}</span>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="用户名">
          <template slot-scope="{row}">
            <span>{{ row.username }}</span>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="简介">
          <template slot-scope="{row}">
            <span>{{ row.intro }}</span>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="邮箱">
          <template slot-scope="{row}">
            <span>{{ row.email }}</span>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="登录时间">
          <template slot-scope="{row}">
            <span>{{ row.loginTime }}</span>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="注册时间">
          <template slot-scope="{row}">
            <span>{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="修改时间">
          <template slot-scope="{row}">
            <span>{{ row.updateTime }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" align="center" label="编辑" width="200">
          <template slot-scope="{row,$index}">
            <el-button v-if="!showEdit[$index]" type="primary" size="small" icon="el-icon-edit" :disabled="row.roleList.includes('admin')" plain @click="showUpdate($index)">
              编辑
            </el-button>
            <el-button v-if="showEdit[$index]" type="primary" size="small" icon="el-icon-check" plain @click="editUser($index)">
              确定
            </el-button>
            <el-button v-if="showEdit[$index]" type="primary" size="small" icon="el-icon-close" plain @click="cancelUpdate($index)">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </el-form>
  </div>
</template>

<script>
import { fetchList, deleteUser, updateUser } from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import Sticky from '@/components/Sticky'

const defaultForm = {
  id: undefined,
  isDisable: undefined,
  roleId: undefined
}

export default {
  name: 'UserList',
  components: { Pagination, Sticky },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      postForm: Object.assign({}, defaultForm),
      total: 0,
      loading: false,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      showEdit: [],
      checkedList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.recordList
        this.total = response.data.count
        this.listLoading = false
      })
    },
    handleSelectionChange(selection) {
      this.checkedList = selection
    },
    checkSelectable(row) {
      if (row.roleList.includes('admin')) {
        return false
      } else {
        return true
      }
    },
    deleteItem() {
      const idList = this.checkedList.map(v => v.id).filter(v => v !== undefined)
      console.log(idList)
      if (idList.length > 0) {
        this.$confirm('请确认是否删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: (action) => {
            if (action === 'confirm') {
              this.loading = true
              deleteUser(idList).then(response => {
                this.loading = false
                console.log(response.code)
                if (response.code === 200) {
                  this.checkedList.forEach((value, index) => {
                    this.list.forEach((v, i) => {
                      if (value.id === v.id) {
                        this.list.splice(i, 1)
                      }
                    })
                  })
                  this.$notify({
                    title: '删除成功',
                    message: response.msg,
                    type: 'success',
                    duration: 2000
                  })
                }
              })
              return
            } else {
              this.$notify({
                title: '警告',
                message: '已取消删除操作',
                type: 'warning'
              })
              return
            }
          }
        })
      } else {
        console.log('删除失败!!')
        this.$notify({
          title: '警告',
          message: '未选中有效目标',
          type: 'warning',
          duration: 2000
        })
      }
    },
    showUpdate(index) {
      this.showEdit[index] = true
      this.$set(this.showEdit, index, true)
    },
    cancelUpdate(index) {
      this.$set(this.showEdit, index, false)
      this.$refs.postForm.clearValidate()
    },
    editUser(index) {
      this.$refs.postForm.validate(valid => {
        if (this.postForm.isDisable !== undefined) {
          if (valid) {
            this.postForm.id = this.list[index].id
            updateUser(this.postForm).then(response => {
              if (response.code === 200) {
                console.log(response.data)
                this.list[index] = response.data
                this.$set(this.showEdit, index, false)
                this.$notify({
                  title: '成功',
                  message: response.msg,
                  type: 'success',
                  duration: 2000
                })
              } else {
                return false
              }
            })
          } else {
            console.log('修改失败!!')
            this.$notify({
              title: '失败',
              message: '用户操作失败',
              type: 'error',
              duration: 2000
            })
            return false
          }
        } else {
          console.log('修改失败!!')
          this.$notify({
            title: '失败',
            message: '修改项必有一项不为空',
            type: 'error',
            duration: 2000
          })
          return false
        }
      })
    },
    fullId(id) {
      this.postForm.id = id
    }
  }
}
</script>

<style scoped>

.el-table {
  margin-top: 1%;
}

</style>
