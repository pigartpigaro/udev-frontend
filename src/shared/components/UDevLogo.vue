<script setup lang="ts">
import fullLogo from '../../public/icons/udev_192px.png'
import iconLogo from '../../public/icons/udev_Icon_192px.png'
import circleLogo from '../../public/icons/udev_icon_circle_192px.png'

const props = withDefaults(defineProps<{
  variant?: 'full' | 'icon' | 'circle'
  alt?: string
}>(), {
  variant: 'full',
  alt: 'UDev',
})

const sources = { full: fullLogo, icon: iconLogo, circle: circleLogo }
</script>

<template>
  <img class="udev-logo" :class="`udev-logo-${props.variant}`" :src="sources[props.variant]" :alt="props.alt" />
</template>

<style scoped>
.udev-logo{display:block;max-width:70%;height:auto;object-fit:contain}.udev-logo-icon,.udev-logo-circle{aspect-ratio:1;object-fit:contain}
</style>
