<template>
  <div class="users">
    <h1>Users</h1>
    <div v-if="users.length > 0" class="table-wrap">
      <div>
        <!-- <nuxt-link v-bind:to="{ name: 'NewUser' }" class="">Add User</nuxt-link> -->
      </div>
      <table>
        <tbody>
        <tr>
          <td>Title</td>
          <td width="550">Email</td>
          <td width="100" align="center">Action</td>
        </tr>
        <tr v-for="user in users" :key="user._id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td align="center">
            <!-- <router-link v-bind:to="{ name: 'EditUser', params: { id: user._id } }">Edit</router-link> | -->
            <!-- <a href="#" @click="deleteUser(user._id)">Delete</a> -->
          </td>
        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
<script>
import UsersService from "@/middleware/UsersService";
export default {
  head: {
    title: "Home"
  },
  async asyncData (context) {
    const response = await UsersService.fetchUsers();
      return{ users: response.data.users} 
  },
  data() {
    return {
      users: []
    };
  }
};
</script>
