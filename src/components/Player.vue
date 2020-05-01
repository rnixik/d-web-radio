<template>
  <div>
<!--    <vue-plyr>-->
<!--      <div class="plyr__video-embed" v-if="videoId">-->
<!--        <iframe-->
<!--          :src="'https://www.youtube.com/embed/' + videoId + '?iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1'"-->
<!--          allowfullscreen-->
<!--          allowtransparency-->
<!--          allow="autoplay"-->
<!--        >-->
<!--        </iframe>-->
<!--      </div>-->
<!--    </vue-plyr>-->
    <vue-plyr ref="plyr">
      <div data-plyr-provider="youtube" :data-plyr-embed-id="videoId"></div>
    </vue-plyr>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue, Prop } from 'vue-property-decorator'
import Plyr from 'plyr'

@Component
export default class Player extends Vue {
  @Prop({ default: null }) videoId!: string
  @Prop({ default: [] }) playlist!: string[]

  $refs!: {
    plyr: any
  }

  get player (): Plyr {
    return this.$refs.plyr.player as Plyr
  }

  @Watch('videoId')
  onVideoIdChange () {
    this.player.source = {
      type: 'video',
      sources: [
        {
          src: this.videoId,
          provider: 'youtube'
        }
      ]
    }
  }

  mounted () {
    this.player.on('ended', () => {
      this.playNextVideoInPlaylist()
    })
    this.player.on('ready', () => {
      this.player.play()
    })
  }

  playNextVideoInPlaylist () {
    if (this.playlist.length === 0) {
      return
    }
    const index = this.playlist.indexOf(this.videoId)
    let nextIndex = index + 1
    if (nextIndex === this.playlist.length) {
      nextIndex = 0
    }

    this.videoId = this.playlist[nextIndex]
  }
}
</script>
