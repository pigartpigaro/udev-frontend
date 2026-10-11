<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormInput from '../../shared/components/form/FormInput.vue'
import UDevLogo from '../../shared/components/UDevLogo.vue'
import { useToast } from '../../shared/composables/useToast'
import { login } from './api/auth'

const router = useRouter()
const { showToast } = useToast()
const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)
const showPassword = ref(false)

async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await login(username.value.trim(), password.value)
    await router.replace('/')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Tidak dapat masuk. Coba lagi.'
    showToast(error.value, 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-story" aria-label="Tentang Udumbara">
      <div class="story-orbit orbit-one"></div><div class="story-orbit orbit-two"></div>
      <a class="brand-lockup" href="#" aria-label="UDev — Udumbara Development"><UDevLogo class="login-full-logo" alt="UDev" /></a>
      <div class="story-copy">
        <span class="eyebrow"><span class="eyebrow-dot"></span> UDUMBARA INFORMATIKA</span>
        <h1>Semua hal baik<br />dimulai <em>bersama.</em></h1>
        <p>Ruang kerja yang lebih terhubung untuk mengelola pelanggan, proyek, dan setiap langkah pertumbuhan.</p>
        <div class="story-note"><span class="note-icon">✳</span><span>Kerja cerdas. Tumbuh bersama.<br /><strong>Itulah cara Udumbara.</strong></span></div>
      </div>
      <div class="story-footer"><span>© 2026 Udumbara Informatika</span><span>BUILT WITH PURPOSE <span class="footer-spark">✳</span></span></div>
    </section>

    <section class="login-panel">
      <div class="mobile-brand"><UDevLogo class="login-full-logo" alt="UDev" /></div>
      <div class="login-card">
        <div class="login-heading"><h2>Masuk ke akunmu</h2><p>Senang melihatmu lagi. Lanjutkan pekerjaanmu.</p></div>
        <form class="login-form" @submit.prevent="submit">
          <label for="username">Username</label>
          <div class="input-wrap"><span class="input-icon" aria-hidden="true">♙</span><FormInput id="username" v-model="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Masukkan username" required /></div>
          <div class="password-label"><label for="password">Kata sandi</label><a href="#" @click.prevent>Butuh bantuan?</a></div>
          <div class="input-wrap"><span class="input-icon lock-icon" aria-hidden="true">⌑</span><FormInput id="password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Masukkan kata sandi" required /><button class="password-toggle" type="button" :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showPassword = !showPassword">{{ showPassword ? 'Sembunyi' : 'Lihat' }}</button></div>
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
          <button class="submit-button" type="submit" :disabled="busy"><span>{{ busy ? 'Memeriksa...' : 'Masuk ke akun' }}</span><span aria-hidden="true">→</span></button>
          <p class="secure-note"><span aria-hidden="true">♧</span> Koneksi aman dan terenkripsi</p>
        </form>
        <div class="login-bottom"><span>Belum punya akses?</span> <a href="mailto:admin@udumbara.com">Hubungi administrator <span>↗</span></a></div>
      </div>
      <div class="panel-footer"><span>PRIVASI</span><span>BANTUAN</span><span>INDONESIA (ID)</span></div>
    </section>
  </main>
</template>
