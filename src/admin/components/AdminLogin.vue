<script setup lang="ts">
import { onMounted, ref } from "vue";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-vue-next";

import { ApiError, api, errorMessage, type AdminUser } from "../api";

const props = defineProps<{
  defaultEmail?: string;
  notice?: string;
}>();

const emit = defineEmits<{
  signedIn: [user: AdminUser];
}>();

const email = ref(props.defaultEmail ?? "");
const password = ref("");
const showPassword = ref(false);
const submitting = ref(false);
const error = ref("");
const emailInput = ref<HTMLInputElement | null>(null);
const passwordInput = ref<HTMLInputElement | null>(null);

onMounted(() => (email.value ? passwordInput.value : emailInput.value)?.focus());

const submit = async () => {
  if (!email.value.trim() || !password.value) {
    error.value = "Please enter your email and password.";
    return;
  }

  submitting.value = true;
  error.value = "";

  try {
    const { user } = await api.login(email.value.trim(), password.value);
    password.value = "";
    emit("signedIn", user);
  } catch (caught) {
    error.value =
      caught instanceof ApiError && caught.status === 401
        ? "That email and password don't match. Please check them and try again."
        : errorMessage(caught, "We couldn't sign you in. Please try again.");
    passwordInput.value?.select();
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <form class="grid gap-5" novalidate @submit.prevent="submit">
    <p v-if="notice" class="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{{ notice }}</p>

    <label class="grid gap-1.5">
      <span class="text-sm font-medium text-stone-800">Email</span>
      <input
        ref="emailInput"
        v-model="email"
        type="email"
        autocomplete="username"
        class="rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] text-stone-900 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
        :disabled="submitting"
      />
    </label>

    <label class="grid gap-1.5">
      <span class="text-sm font-medium text-stone-800">Password</span>
      <span class="admin-input-wrap flex rounded-lg border border-stone-300 bg-white transition focus-within:border-stone-500 focus-within:ring-2 focus-within:ring-stone-200">
        <input
          ref="passwordInput"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          class="w-full min-w-0 rounded-lg bg-transparent px-3.5 py-2.5 text-[15px] text-stone-900 outline-none"
          :disabled="submitting"
        />
        <button
          type="button"
          class="px-3 text-stone-500 hover:text-stone-800"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <EyeOff v-if="showPassword" :size="18" />
          <Eye v-else :size="18" />
        </button>
      </span>
    </label>

    <p v-if="error" class="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800" role="alert">
      <AlertCircle :size="16" class="mt-0.5 shrink-0" />
      {{ error }}
    </p>

    <button type="submit" class="admin-btn-primary w-full !py-3" :disabled="submitting">
      <Loader2 v-if="submitting" class="animate-spin" :size="16" />
      {{ submitting ? "Signing in…" : "Sign in" }}
    </button>

    <p class="text-center text-xs text-stone-500">Forgot your password? Ask your website developer to reset it.</p>
  </form>
</template>
