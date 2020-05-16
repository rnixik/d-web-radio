<template>
  <div id="app">
    <router-view kek="pek"></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component
export default class App extends Vue {}
</script>
