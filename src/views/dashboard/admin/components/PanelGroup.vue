<template>
  <el-row :gutter="40" class="panel-group" type="flex" justify="center">
    <el-col :xs="10" :sm="10" :lg="5" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper">
          <svg-icon icon-class="view-count" class="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            总访问量
          </div>
          <count-to :start-val="0" :end-val="blogInfo.viewCount" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="10" :sm="10" :lg="5" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper">
          <svg-icon icon-class="article-count" class="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            文章数量
          </div>
          <count-to :start-val="0" :end-val="blogInfo.articleCount" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="10" :sm="10" :lg="5" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper">
          <svg-icon icon-class="category-count" class="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            分类数量
          </div>
          <count-to :start-val="0" :end-val="blogInfo.categoryCount" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="10" :sm="10" :lg="5" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper">
          <svg-icon icon-class="tag-count" class="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            标签数量
          </div>
          <count-to :start-val="0" :end-val="blogInfo.tagCount" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="10" :sm="10" :lg="5" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper">
          <svg-icon icon-class="user-count" class="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            用户数量
          </div>
          <count-to :start-val="0" :end-val="blogInfo.userCount" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { getBlogInfo } from '@/api/blog-info'

const defaultForm = {
  viewCount: undefined,
  articleCount: undefined,
  categoryCount: undefined,
  tagCount: undefined
}

export default {
  components: {
    CountTo
  },
  data() {
    return {
      blogInfo: Object.assign({}, defaultForm)
    }
  },
  created() {
    this.getBlogInfo()
  },
  methods: {
    getBlogInfo() {
      getBlogInfo().then(response => {
        console.log(response.data)
        if (!response.data) return
        this.blogInfo = response.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 0;

  .card-panel-col {
    margin-bottom: 0;
  }

  .card-panel {
    height: 90px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 0 0 0 10px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      text-align: center;
      font-size: 28px;
      position: relative;
      transform: translateY(20%);
    }

    .card-panel-description {
      text-align: center;
      font-weight: bold;
      margin: 26px;
      flex-shrink: 0;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
        margin-bottom: 12px;
        flex-shrink: 0;
      }

      .card-panel-num {
        font-size: 16px;
        flex-shrink: 0;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
