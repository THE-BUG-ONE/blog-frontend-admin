<template>
  <div>
    <v-md-editor
      v-model="editorValue"
      :disabled-menus="[]"
      height="calc(100vh - 150px)"
      @upload-image="handleUploadImage"
    />
  </div>
</template>

<script>
export default {
  name: 'MdEditor',
  props: {
    // 接收值父组件传递值
    content: String
  },
  data() {
    return {
      editorValue: this.content != null ? this.content : ''
    }
  },
  watch: {
    editorValue: function(newNum, oldNum) {
      // 修改调用者传入的值
      this.$emit('update:content', newNum)
    }
  },
  methods: {
    // v-md-editor 文件上传
    handleUploadImage(event, insertImage, files) {
      // console.log(files);
      // 上传
      for (let i = 0; i < files.length; i++) {
        this.crud.upload(files[i], 'image/vMdEditor/').then(res => {
          // 获取返回数据
          const data = res.data.data
          // 添加图片到内容
          insertImage({
            url: data.url,
            desc: data.name
          })
        })
      }
    }
  }
}
</script>

  <style>
  </style>
