<script setup lang="ts">
import AppIcon from '../../../../shared/components/layout/AppIcon.vue'

defineProps<{ completed: number; inProgress: number }>()
</script>

<template>
  <section class="project-overview" aria-labelledby="project-overview-title">
    <div class="project-overview-heading"><div><span class="section-overline"><i></i> PROJECT</span><h2 id="project-overview-title">Status project</h2><p>Ringkasan project selesai dan yang masih berjalan.</p></div><RouterLink to="/projects" class="project-link">Lihat project <AppIcon name="arrow-up-right" :size="14" /></RouterLink></div>
    <div class="project-counts">
      <article class="project-count-card completed"><span class="count-icon"><AppIcon name="invoice" :size="17" /></span><div><small>Project selesai</small><strong>{{ completed }}</strong><span>Berstatus Selesai</span></div></article>
      <article class="project-count-card active"><span class="count-icon"><AppIcon name="briefcase" :size="17" /></span><div><small>Masih proses</small><strong>{{ inProgress }}</strong><span>Berjalan atau ditunda</span></div></article>
    </div>
    <p class="project-count-note">Draft dan project yang dibatalkan tidak termasuk dalam dua hitungan ini.</p>
  </section>
</template>

<style scoped>
.project-overview{margin:23px 0 29px}.project-overview-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:13px}.section-overline{display:flex;align-items:center;gap:7px;color:#a1a99a;font-size:9px;font-weight:700;letter-spacing:1.2px}.section-overline i{width:6px;height:6px;border-radius:50%;background:#ffd64c}.project-overview h2{margin:7px 0 4px;font:700 18px Manrope,sans-serif;letter-spacing:-.35px}.project-overview-heading p{margin:0;color:#949b90;font-size:10px}.project-link{display:inline-flex;align-items:center;gap:6px;flex:none;padding:8px 10px;border:1px solid #ffffff1a;border-radius:7px;color:#d5e7bb;font-size:10px;text-decoration:none}.project-link:hover{border-color:#8bd74f66;background:#8bd74f0b}.project-counts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.project-count-card{display:flex;align-items:center;gap:13px;min-width:0;padding:15px;border:1px solid #ffffff12;border-radius:10px;background:linear-gradient(145deg,#1b1e1a,#171917)}.count-icon{width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:11px;background:#8bd74f15;color:#c9e9a2}.project-count-card.completed .count-icon{background:#ffd64c18;color:#f3d66a}.project-count-card>div{display:grid;gap:4px;min-width:0}.project-count-card small{color:#aeb5a9;font-size:10px;font-weight:600}.project-count-card strong{color:#f1f2ed;font:700 24px Manrope,sans-serif}.project-count-card>div>span{color:#899084;font-size:9px}.project-count-note{margin:9px 2px 0;color:#777f73;font-size:9px}@media(max-width:600px){.project-overview{margin:18px 0 24px}.project-overview h2{font-size:16px}.project-overview-heading p{max-width:230px;line-height:1.5}.project-link{padding:7px 8px;font-size:9px}.project-counts{gap:8px}.project-count-card{gap:9px;padding:11px}.count-icon{width:32px;height:32px;border-radius:9px}.project-count-card strong{font-size:21px}.project-count-card small{font-size:9px}.project-count-card>div>span{font-size:8px}}@media(max-width:360px){.project-counts{grid-template-columns:1fr}}
</style>
