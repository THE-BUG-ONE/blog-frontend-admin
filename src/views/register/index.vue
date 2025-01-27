<template>
  <div class="register-container">
    <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">用户注册</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="registerForm.username"
          placeholder="输入用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="nickname">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="nickname"
          v-model="registerForm.nickname"
          placeholder="输入昵称"
          name="nickname"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="registerForm.password"
            :type="passwordType"
            placeholder="输入密码"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" style="fill: #fff;" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="passwordRepeat">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="registerForm.passwordRepeat"
            :type="passwordType"
            placeholder="确认密码"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" style="fill: #fff;" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-form-item prop="email">
        <span class="svg-container">
          <svg-icon icon-class="email" />
        </span>
        <el-input
          ref="email"
          v-model="registerForm.email"
          placeholder="输入邮箱地址"
          name="email"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <div>
        <el-form-item prop="code" style="width: 70%;float: left;">
          <span class="svg-container">
            <svg-icon icon-class="code" />
          </span>
          <el-input
            ref="code"
            v-model="registerForm.code"
            placeholder="输入验证码"
            name="code"
            type="text"
            tabindex="1"
            auto-complete="on"
          />
        </el-form-item>
        <el-button
          type="warning"
          plain
          style="width: 25%;height: 47px;border: none;float: right;background: rgba(0 ,0 ,0 , 0.5);"
          :disabled="!show"
          @click.native.prevent="getCode"
        >
          <span v-if="show">获取验证码</span>
          <span v-else>{{ count }}</span>
        </el-button>
      </div>
      <el-button type="primary" plain style="width:100%;margin-bottom:10px;background: rgba(0, 0, 0, 0.5);" @click.native.prevent="handleRegister">
        注册
      </el-button>
      <router-link to="/login">
        <el-button type="success" plain style="width:100%;margin:0 0 30px 0;background: rgba(0, 0, 0, 0.5);">
          登录
        </el-button>
      </router-link>
    </el-form>
  </div>
</template>

<script>
import { getCode, register } from '@/api/user'

export default {
  name: 'Register',
  data() {
    const validateName = (rule, value, callback) => {
      if (value === '' || value.length > 50) {
        callback(new Error('请输入正确的名称'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6 || value.length > 100) {
        callback(new Error('密码不能少于6个字符,多于100个字符'))
      } else {
        callback()
      }
    }
    const validatePasswordRep = (rule, value, callback) => {
      if (value === '' || value !== this.registerForm.password) {
        callback(new Error('两次输入不一致'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if (value === '' || !regEmail.test(value)) {
        callback(new Error('非法的邮箱地址'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        username: '',
        nickname: '',
        password: '',
        passwordRepeat: '',
        email: '',
        code: ''
      },
      registerRules: {
        username: [{ required: true, trigger: 'blur', validator: validateName }],
        nickname: [{ required: true, trigger: 'blur', validator: validateName }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        passwordRepeat: [{ required: true, trigger: 'blur', validator: validatePasswordRep }],
        email: [{ required: true, trigger: 'blur', validator: validateEmail }],
        code: [{ required: true, trigger: 'blur', pattern: /^\d{6,6}$/, message: '验证码无效' }]
      },
      loading: false,
      capsTooltip: false,
      passwordType: 'password',
      redirect: undefined,
      otherQuery: {},
      show: true,
      count: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.registerForm.username === '') {
      this.$refs.username.focus()
    } else if (this.registerForm.password === '') {
      this.$refs.password.focus()
    } else if (this.registerForm.passwordRepeat === '') {
      this.$refs.password.focus()
    } else if (this.registerForm.email === '') {
      this.$refs.password.focus()
    }
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true
          register(this.registerForm).then(response => {
            if (response.code === 200) {
              this.$message({
                message: '用户注册成功',
                type: 'success'
              })
              this.$router.push({ path: '/login', query: this.otherQuery })
            } else {
              this.$message({
                message: '用户注册失败',
                type: 'error'
              })
            }
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getCode() {
      if (!this.timer) {
        this.count = 60
        this.show = false
        this.timer = setInterval(() => {
          if (this.count > 0 && this.count <= 60) {
            this.count--
          } else {
            this.show = true
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
        this.$refs.registerForm.validateField(['email'], valid => {
          if (!valid) {
            getCode(this.registerForm.email).then(response => {
              if (response.code === 200) {
                this.$message({
                  message: '验证码已发送至邮箱',
                  type: 'success'
                })
              } else {
                this.$message({
                  message: '验证码发送失败',
                  type: 'error'
                })
              }
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

  <style lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

  $bg:#283443;
  $light_gray:#fff;
  $cursor: #fff;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .register-container .el-input input {
      color: $cursor;
    }
  }

  /* reset element-ui css */
  .register-container {

    background: url('https://img-baofun.zhhainiao.com/fs/51312cb9165481c637bcbfd39d359bd6.jpg');
    background-size: cover;

    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;

      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;

        &:-webkit-autofill {
          box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }

    .el-form-item {
      height: 47px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
  }
  </style>

  <style lang="scss" scoped>
  $bg:#1b1f25;
  $dark_gray:#889aa4;
  $light_gray:#eee;

  .register-container {
    min-height: 100%;
    width: 100%;
    background-color: $bg;
    overflow: hidden;

    .register-form {
      position: relative;
      width: 520px;
      max-width: 100%;
      padding: 25px 35px 0;
      margin: 0 auto;
      overflow: hidden;
    }

    .tips {
      align-self: center;
      width: 60%;
      font-size: 14px;
      color: #bfbfbf;
      margin: 0 auto;

      .tips-table {
        border-radius: 20px;
        text-align: center;
        background: rgba(0, 0, 0, 0.5);
        padding: 0.2em 0 0.2em 0;
      }

      .el-row .el-row:first-of-type {
        color: #9f0000;
      }

      .el-col {
        padding: 1% 4% 1% 4%;
      }
    }

    .svg-container {
      padding: 0.5em 0 0 1em;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
    }

    .title-container {
      position: relative;

      .title {
        font-size: 26px;
        color: $light_gray;
        margin: 0px auto 40px auto;
        text-align: center;
        font-weight: bold;
      }
    }

    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
  }
  </style>
