<template>
<div v-container>
  <h1>Register</h1>
  <UserAuthForm buttonText="register" :submitForm="registerUser" hasName="true"/>
  </div>
</template>
<script>
import UserAuthForm from '@/components/UserAuthForm'

export default{
  components: {
    UserAuthForm
  },
  methods: {
    registerUser(registerInfo){
        this.$auth.loginWith('local', {
            data: registerInfo
        })
      alert('you tried to login')
    }
  }
}
</script>
