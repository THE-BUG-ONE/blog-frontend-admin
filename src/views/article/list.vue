<template>
  <div class="app-container">
    <sticky :z-index="10" :class-name="'sub-navbar'">
      <el-button v-loading="loading" type="danger" icon="el-icon-delete" plain @click="deleteItem">
        删除
      </el-button>
    </sticky>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" :selectable="checkSelectable" />

      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="标题">
        <template slot-scope="scope">
          <span>{{ scope.row.articleTitle }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="分类">
        <template slot-scope="scope">
          <span>{{ scope.row.categoryName }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="简介">
        <template slot-scope="scope">
          <span>{{ scope.row.articleDesc }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="修改时间">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="100px" label="是否置顶">
        <template slot-scope="scope">
          <span v-if="scope.row.isTop === 1">已置顶</span>
          <span v-else>未置顶</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" align="center" label="操作" width="120">
        <template slot-scope="scope">
          <router-link :to="'/article/edit/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit" plain>
              编辑
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, deleteArticle } from '@/api/article'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import Sticky from '@/components/Sticky'

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
      checkedList: [],
      list: null,
      total: 0,
      loading: false,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      }
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
    deleteItem() {
      const idList = this.checkedList.map(v => v.id)
      console.log(idList)
      if (idList.length > 0) {
        this.$confirm('请确认是否删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: (action) => {
            if (action === 'confirm') {
              this.loading = true
              deleteArticle(idList).then(response => {
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
                title: '取消操作',
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
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}

.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}

.el-table {
  margin-top: 1%;
}
</style>
