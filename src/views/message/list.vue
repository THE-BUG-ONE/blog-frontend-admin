<template>
  <div class="app-container">
    <!-- <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container"> -->
    <sticky :z-index="10" :class-name="'sub-navbar'">
      <el-button v-loading="loading" type="danger" icon="el-icon-delete" plain @click="deleteItem">
        删除
      </el-button>
    </sticky>

    <el-table ref="table" v-loading="listLoading" :data="list" border fit highlight-current-row stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" :selectable="checkSelectable" />

      <el-table-column align="center" label="ID" width="50">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="50" align="center" label="父评论ID">
        <template slot-scope="{row}">
          <span>{{ row.parentId }}</span>
        </template>
      </el-table-column>

      <el-table-column width="50" align="center" label="根留言ID">
        <template slot-scope="{row}">
          <span>{{ row.rootId }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120" align="center" label="回复评论用户昵称">
        <template slot-scope="{row}">
          <span>{{ row.fromNickname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120" align="center" label="留言用户昵称">
        <template slot-scope="{row}">
          <span>{{ row.user.nickname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120" align="center" label="审核状态">
        <template slot-scope="{row}">
          <span>{{ row.isCheck === 1 ? '已通过' : '审核中' }}</span>
        </template>
      </el-table-column>

      <el-table-column width="240" align="center" label="留言时间">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column width="240" align="center" label="修改时间">
        <template slot-scope="{row}">
          <span>{{ row.updateTime }}</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" align="center" label="编辑" width="200">
        <template slot-scope="{row,$index}">
          <el-button v-if="!showEdit[$index]" type="primary" size="small" icon="el-icon-edit" plain @click="showUpdate($index)">
            编辑
          </el-button>
          <el-button v-if="showEdit[$index]" type="primary" size="small" icon="el-icon-check" plain @click="editItem($index)">
            确定
          </el-button>
          <el-button v-if="showEdit[$index]" type="primary" size="small" icon="el-icon-close" plain @click="cancelUpdate($index)">
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!-- </el-form> -->
  </div>
</template>

<script>
import { fetchList, deleteMessage, updateMessage } from '@/api/message'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import Sticky from '@/components/Sticky'
import store from '@/store'

const userId = store.getters.id
const roles = store.getters.roles
const defaultForm = {
  id: undefined,
  isCheck: undefined
}

export default {
  name: 'MessageList',
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
        console.log(this.list)
      })
    },
    handleSelectionChange(selection) {
      this.checkedList = selection
    },
    checkSelectable(row) {
      if (roles.includes('admin') || userId === row.user.id) {
        return true
      } else {
        return false
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
              deleteMessage(idList).then(response => {
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
    editItem(index) {
      this.$refs.postForm.validate(valid => {
        if (this.postForm.isDisable !== undefined) {
          if (valid) {
            this.postForm.id = this.list[index].id
            updateMessage(this.postForm).then(response => {
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
    }
  }
}
</script>

<style scoped>

.el-table {
  margin-top: 1%;
}

</style>
