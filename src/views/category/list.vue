<template>
  <div class="app-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar'">
        <el-button v-loading="loading" type="success" icon="el-icon-plus" plain @click="addItem">
          添加
        </el-button>
        <el-button v-loading="loading" type="danger" icon="el-icon-delete" plain @click="deleteItem">
          删除
        </el-button>
      </sticky>

      <el-table ref="table" v-loading="listLoading" :data="list" border fit highlight-current-row stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" :selectable="checkSelectable" />

        <el-table-column align="center" label="ID" width="80">
          <template slot-scope="{row}">
            <span>{{ inputId(row.id) }}</span>
          </template>
        </el-table-column>

        <el-table-column width="300px" align="center" label="标题">
          <template slot-scope="{row,$index}">
            <span v-if="!showEdit[$index]">{{ row.categoryName }}</span>
            <el-form-item :inline-message="true" style="margin-bottom: 0px" prop="categoryName">
              <el-input v-if="showEdit[$index]" v-model="postForm.categoryName" :placeholder="row.categoryName" size="small" />
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column width="80px" align="center" label="文章数">
          <template slot-scope="{row}">
            <span>{{ row.articleCount }}</span>
          </template>
        </el-table-column>

        <el-table-column width="240px" align="center" label="创建时间">
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
            <el-button v-if="!showEdit[$index]" type="primary" size="small" icon="el-icon-edit" plain @click="showUpdate($index)">
              编辑
            </el-button>
            <el-button v-if="showEdit[$index]" type="primary" size="small" icon="el-icon-check" plain @click="editCategory($index)">
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
import { fetchList, addCategory, deleteCategory, updateCategory } from '@/api/category'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import Sticky from '@/components/Sticky'

const defaultForm = {
  id: undefined,
  categoryName: ''
}

export default {
  name: 'CategoryList',
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
      checkedList: [],
      rules: { categoryName: { required: true, message: '字数必须小于20', max: 20, trigger: 'blur' }}
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
      if (row.articleCount > 0) {
        return false
      } else {
        return true
      }
    },
    addItem() {
      this.list.push({
        id: undefined,
        categoryName: ''
      })
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
              deleteCategory(idList).then(response => {
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
    editCategory(index) {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          if (this.list[index].id === undefined) {
            addCategory(this.postForm.categoryName).then(response => {
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
            updateCategory(this.postForm).then(response => {
              if (response.code === 200) {
                console.log(response.data)
                this.list[index].categoryName = this.postForm.categoryName
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
          }
        } else {
          console.log('添加失败!!')
          this.$notify({
            title: '失败',
            message: '分类操作失败',
            type: 'error',
            duration: 2000
          })
          return false
        }
      })
    },
    inputId(id) {
      this.postForm.id = id
      return id
    }
  }
}
</script>

<style scoped>
.sticky .el-button {
  position: relative;
  top: 10%;
  padding-left: 1em;
  margin-left: 0.5em;
  float: right;
}

.el-table {
  margin-top: 1%;
}
</style>
