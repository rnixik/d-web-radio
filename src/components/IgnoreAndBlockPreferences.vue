<template>
  <div>
    <h3>Ignore and block preferences</h3>
    <table border="1">
      <tr>
        <td>Block Blacklist <input type="checkbox" @click="toggleBlockBlackList()" :checked="preferencesIgnoreAndBlock.isBlockBlackListEnabled"></td>
        <td>Ignore Blacklist <input type="checkbox" @click="toggleIgnoreBlackList()" :checked="preferencesIgnoreAndBlock.isIgnoreBlackListEnabled"></td>
      </tr>
      <tr>
        <td>
          <ul v-if="preferencesIgnoreAndBlock.blockBlackList">
            <li v-for="user in preferencesIgnoreAndBlock.blockBlackList" :key="user.publicKey">
              <user :user="user"></user> <span @click="removeFromBlockBlackList(user)">[remove]</span>
            </li>
          </ul>
        </td>
        <td>
          <ul v-if="preferencesIgnoreAndBlock.ignoreBlackList">
            <li v-for="user in preferencesIgnoreAndBlock.ignoreBlackList" :key="user.publicKey">
              <user :user="user"></user> <span @click="removeFromIgnoreBlackList(user)">[remove]</span>
            </li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>Block Whitelist <input type="checkbox" @click="toggleBlockWhiteList()" :checked="preferencesIgnoreAndBlock.isBlockWhiteListEnabled"></td>
        <td>Ignore Whitelist <input type="checkbox" @click="toggleIgnoreWhiteList()" :checked="preferencesIgnoreAndBlock.isIgnoreWhiteListEnabled"></td>
      </tr>
      <tr>
        <td>
          <ul v-if="preferencesIgnoreAndBlock.blockWhiteList">
            <li v-for="user in preferencesIgnoreAndBlock.blockWhiteList" :key="user.publicKey">
              <user :user="user"></user> <span @click="removeFromBlockWhiteList(user)">[remove]</span>
            </li>
          </ul>
        </td>
        <td>
          <ul v-if="preferencesIgnoreAndBlock.ignoreWhiteList">
            <li v-for="user in preferencesIgnoreAndBlock.ignoreWhiteList" :key="user.publicKey">
              <user :user="user"></user> <span @click="removeFromIgnoreWhiteList(user)">[remove]</span>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import User from '@/components/User.vue'
import { User as UserModel } from 'd-web-core/lib/models/User'
import { PreferencesIgnoreAndBlock } from 'd-web-core/lib/models/PreferencesIgnoreAndBlock'
import { EventHub } from '@/components/EventHub'

@Component({
  components: { User }
})
export default class IgnoreAndBlockPreferences extends Vue {
  @Prop({ default: null }) preferencesIgnoreAndBlock!: PreferencesIgnoreAndBlock

  removeFromBlockBlackList (user: UserModel) {
    EventHub.$emit('userControl', 'removeFromBlockBlackList', user)
  }

  removeFromIgnoreBlackList (user: UserModel) {
    EventHub.$emit('userControl', 'removeFromIgnoreBlackList', user)
  }

  removeFromBlockWhiteList (user: UserModel) {
    EventHub.$emit('userControl', 'removeFromBlockWhiteList', user)
  }

  removeFromIgnoreWhiteList (user: UserModel) {
    EventHub.$emit('userControl', 'removeFromIgnoreWhiteList', user)
  }

  toggleBlockBlackList () {
    const newValue = !this.preferencesIgnoreAndBlock.isBlockBlackListEnabled
    EventHub.$emit('setIgnoreAndBlockListEnabled', 'blockBlack', newValue)
  }

  toggleIgnoreBlackList () {
    const newValue = !this.preferencesIgnoreAndBlock.isIgnoreBlackListEnabled
    EventHub.$emit('setIgnoreAndBlockListEnabled', 'ignoreBlack', newValue)
  }

  toggleBlockWhiteList () {
    const newValue = !this.preferencesIgnoreAndBlock.isBlockWhiteListEnabled
    EventHub.$emit('setIgnoreAndBlockListEnabled', 'blockWhite', newValue)
  }

  toggleIgnoreWhiteList () {
    const newValue = !this.preferencesIgnoreAndBlock.isIgnoreWhiteListEnabled
    EventHub.$emit('setIgnoreAndBlockListEnabled', 'ignoreWhite', newValue)
  }
}
</script>
