<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar'">
        <el-button v-if="!isEdit" v-loading="loading" style="margin-left: 10px;" plain type="success" @click="submitEditForm">
          发表
        </el-button>
        <el-button v-if="isEdit" v-loading="loading" style="margin-left: 10px;" plain type="success" @click="submitModifyForm">
          修改
        </el-button>
        <el-button v-loading="loading" type="warning" plain @click="draftForm">
          草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="articleTitle">
              <MDinput v-model="postForm.articleTitle" :maxlength="100" name="name" required>
                标题
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>

                <el-col :span="8">
                  <el-form-item label-width="60px" label="分类:" class="postInfo-container-item" prop="categoryName">
                    <el-select v-model="postForm.categoryName" placeholder="搜索分类">
                      <el-option v-for="item in categoryNameList" :key="item" :value="item" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label-width="60px" label="标签:" class="postInfo-container-item" prop="tagNameList">
                    <span @keyup.enter="addTag"><el-input v-model="currentTag" :maxlength="20" /></span>
                    <el-button type="primary" icon="el-icon-plus" style="margin-top: 0.3em;" @click="addTag">添加标签</el-button>
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label-width="80px" label="已有标签" class="postInfo-container-item" prop="tagNameList">
                    <el-tag v-for="tag in postForm.tagNameList" :key="tag" size="medium" closable disable-transitions @close="removeTag(tag)">{{ tag }}</el-tag>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>

          <el-col :span="8">
            <el-form-item label-width="60px" label="置顶:" class="postInfo-container-item" prop="isTop">
              <el-radio-group v-model="postForm.isTop">
                <el-radio-button :label="1">是</el-radio-button>
                <el-radio-button :label="0">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="70px" label="简介:" prop="articleDesc">
          <el-input v-model="postForm.articleDesc" :rows="1" type="textarea" class="article-textarea" autosize placeholder="请输入内容" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}个字</span>
        </el-form-item>

        <el-form-item prop="articleContent" style="margin-bottom: 30px;">
          <MdEditor v-if="initSuccess" v-model="postForm.articleContent" :content.sync="postForm.articleContent" />
          <!-- <el-input v-model="postForm.articleContent" type="textarea" placeholder="请输入内容" :autosize="{ minRows: 10 }" /> -->
        </el-form-item>

        <el-form-item prop="articleCover" style="margin-bottom: 30px;">
          <Upload v-model="postForm.articleCover" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Upload from '@/components/Upload/SingleImage3'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { validURL } from '@/utils/validate'
import { fetchArticle, addArticle, updateArticle } from '@/api/article'
import { getCategoryOptionList } from '@/api/category'

const defaultForm = {
  status: 0,
  articelTitle: '', // 文章题目
  articleContent: '', // 文章内容
  articleDesc: '', // 文章摘要
  articleCover: '', // 文章图片
  id: undefined,
  categoryName: '',
  isTop: 0,
  tagNameList: []
}

export default {
  name: 'ArticleDetail',
  components: { MDinput, Upload, Sticky },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: '表单必填项有空',
          type: 'error'
        })
        callback(new Error('表单必填项有空'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: '外链url填写不正确',
            type: 'error'
          })
          callback(new Error('外链url填写不正确'))
        }
      } else {
        callback()
      }
    }
    const validateTags = (rule, value, callback) => {
      if (value) {
        callback()
      } else {
        this.$message({
          message: '表单必填项有空',
          type: 'error'
        })
        callback(new Error('表单必填项有空'))
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      initSuccess: false,
      // userListOptions: [],
      // tempRoute: {},
      categoryNameList: [],
      currentTag: '',
      rules: {
        articelTitle: [{ validator: validateRequire }],
        articleContent: [{ validator: validateRequire }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }],
        isTop: [{ required: true }],
        tagNameList: [{ validator: validateTags }]
      }
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.articleDesc.length
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.initSuccess = true
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    // this.tempRoute = Object.assign({}, this.$route)
    this.getCategoryList()
  },
  methods: {
    fetchData(id) {
      fetchArticle(id).then(response => {
        this.postForm = response.data
        console.log(this.postForm)
        this.setTagNameList()

        // set page title
        this.setPageTitle()
        this.initSuccess = true
      }).catch(err => {
        console.log(err)
      })
    },
    setTagNameList() {
      this.postForm.tagNameList = this.postForm.tagNameList.map(v => v.tagName)
    },
    setPageTitle() {
      const title = '编辑内容'
      document.title = `${title} - ${this.postForm.articleTitle}`
    },
    submitEditForm() {
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.postForm.status = 1
          addArticle(this.postForm).then(response => {
            this.loading = false
            this.$notify({
              title: '成功',
              message: '发布文章成功',
              type: 'success',
              duration: 2000
            })
          })
        } else {
          this.$notify({
            title: '失败',
            message: '表单验证失败',
            type: 'warning',
            duration: 2000
          })
          return false
        }
      })
    },
    submitModifyForm() {
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.postForm.status = 1
          updateArticle(this.postForm).then(() => {
            this.loading = false
            this.$notify({
              title: '成功',
              message: '修改文章成功',
              type: 'success',
              duration: 2000
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.articleContent.length === 0 || this.postForm.articleTitle.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 0
    },
    // getRemoteUserList(query) {
    //   searchUser(query).then(response => {
    //     console.log(response.data)
    //     if (!response.data) return
    //     this.userListOptions = response.data.map(v => v.username)
    //   })
    // },
    getCategoryList() {
      getCategoryOptionList().then(response => {
        console.log(response.data)
        if (!response.data) return
        this.categoryNameList = response.data.map(v => v.categoryName)
      })
    },
    addTag() {
      this.postForm.tagNameList.push(this.currentTag)
      this.currentTag = ''
    },
    removeTag(tag) {
      this.postForm.tagNameList.splice(this.postForm.tagNameList.indexOf(tag), 1)
    },
    addArticle(query) {
      addArticle(query).then(() => {
        this.$message({
          message: '保存成功',
          type: 'success',
          showClose: true,
          duration: 1000
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}

.el-tag {
  font-size: 15px;
  margin: 0.1em;
}

.sticky .el-button {
  position: relative;
  float: right;
  top: 10%
}
</style>
