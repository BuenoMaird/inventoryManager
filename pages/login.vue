<template>
<v-container>
  <h1>Login</h1>
  <UserAuthForm buttonText="login" :submitForm="loginUser"/>
  </v-container>
</template>
<script>
import UsersService from '@/middleware/UsersService'
import UserAuthForm from '@/components/UserAuthForm'

export default{
  components: {
    UserAuthForm
  },
  methods: {
    async loginUser(loginInfo){
       const response = await UsersService.sessionUser(loginInfo);
      return{ users: response.data.users} 
    }

  },
  
  
}
</script>
