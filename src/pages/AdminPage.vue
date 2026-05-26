<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Eye, Loader2, LogOut, Plus, Rocket, Save, Trash2, Upload } from "lucide-vue-next";

import { defaultSiteContent, type SiteContent } from "../content/site-content";

type User = {
  id: string;
  email: string;
};

type CmsJob = {
  id: string;
  type: "deploy";
  status: "queued" | "running" | "success" | "failed";
  deployment_url: string | null;
  message: string | null;
};

const email = ref("");
const password = ref("");
const user = ref<User | null>(null);
const content = ref<SiteContent>(structuredClone(defaultSiteContent));
const loading = ref(true);
const saving = ref(false);
const uploading = ref(false);
const message = ref("");
const error = ref("");
const activeSection = ref("Site");
const draftReady = ref(false);

const sections = ["Site", "Hero", "Navigation", "Practice", "About", "People", "Contact", "Footer"];

const isAuthenticated = computed(() => Boolean(user.value));

const requestJson = async <T>(url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "content-type": "application/json",
      ...options.headers
    }
  });

  const body = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((body as { error?: string } | null)?.error ?? "Request failed.");
  }

  return body as T;
};

const requestForm = async <T>(url: string, body: FormData) => {
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    body
  });

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error ?? "Upload failed.");
  }

  return payload as T;
};

const loadSession = async () => {
  loading.value = true;
  error.value = "";

  try {
    const session = await requestJson<{ user: User }>("/api/auth/me");
    user.value = session.user;
    await loadContent();
  } catch {
    user.value = null;
  } finally {
    loading.value = false;
  }
};

const loadContent = async () => {
    const response = await requestJson<{ content: SiteContent }>("/api/content");
    content.value = structuredClone(response.content);
    draftReady.value = false;
};

const login = async () => {
  loading.value = true;
  error.value = "";
  message.value = "";

  try {
    const response = await requestJson<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    user.value = response.user;
    password.value = "";
    await loadContent();
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to log in.";
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  await requestJson("/api/auth/logout", { method: "POST", body: "{}" });
  user.value = null;
};

const saveDraft = async () => {
  saving.value = true;
  error.value = "";
  message.value = "";

  try {
    const response = await requestJson<{ content: SiteContent }>("/api/content", {
      method: "PUT",
      body: JSON.stringify({ content: content.value })
    });
    content.value = structuredClone(response.content);
    message.value = "Draft saved.";
    draftReady.value = true;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to save draft.";
  } finally {
    saving.value = false;
  }
};

const openPreview = () => {
  window.open("/admin/preview", "_blank", "noopener,noreferrer");
};

const uploadImage = async (event: Event, assignUrl: (url: string) => void) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  uploading.value = true;
  error.value = "";
  message.value = "";

  try {
    const formData = new FormData();
    formData.set("file", file);
    const response = await requestForm<{ url: string }>("/api/assets/upload", formData);
    assignUrl(response.url);
    draftReady.value = false;
    message.value = "Image uploaded. Save draft to preview it.";
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to upload image.";
  } finally {
    uploading.value = false;
    input.value = "";
  }
};

const createJob = async () => {
  saving.value = true;
  error.value = "";
  message.value = "";

  try {
    await requestJson("/api/jobs/deploy", {
      method: "POST",
      body: JSON.stringify({ content: content.value })
    });
    message.value = "Deploy started. Please check back in a few minutes.";
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to start deploy.";
  } finally {
    saving.value = false;
  }
};

const addString = (items: string[]) => items.push("");
const removeString = (items: string[], index: number) => items.splice(index, 1);

const addPractice = () => {
  content.value.practiceAreas.push({
    id: String(content.value.practiceAreas.length + 1).padStart(2, "0"),
    slug: "new-practice-area",
    title: "New Practice Area",
    description: "",
    detailedDescription: "",
    image: ""
  });
};

const addPerson = () => {
  content.value.people.members.push({
    name: "New Lawyer",
    role: "",
    credentials: "",
    bio: "",
    image: ""
  });
};

const addNavigationItem = () => {
  content.value.navigation.items.push({
    label: "New Link",
    href: "/"
  });
};

onMounted(loadSession);
</script>

<template>
  <div class="min-h-screen bg-[#f6f1ea] text-slate-800 font-sans">
    <div v-if="loading && !isAuthenticated" class="min-h-screen grid place-items-center">
      <Loader2 class="animate-spin" :size="28" />
    </div>

    <div v-else-if="!isAuthenticated" class="min-h-screen grid place-items-center px-6">
      <form class="w-full max-w-sm border border-slate-300 bg-white p-8 space-y-6" @submit.prevent="login">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">CMS Login</p>
          <h1 class="mt-4 font-serif text-3xl">Himahlini & Co</h1>
        </div>
        <label class="block space-y-2">
          <span class="text-xs uppercase tracking-widest">Email</span>
          <input v-model="email" type="email" class="w-full border border-slate-300 px-4 py-3 text-slate-900" required />
        </label>
        <label class="block space-y-2">
          <span class="text-xs uppercase tracking-widest">Password</span>
          <input v-model="password" type="password" class="w-full border border-slate-300 px-4 py-3 text-slate-900" required />
        </label>
        <p v-if="error" class="text-sm text-red-700">{{ error }}</p>
        <button class="w-full bg-[#191614] text-white px-5 py-3 uppercase tracking-widest text-xs" type="submit">
          Sign in
        </button>
      </form>
    </div>

    <div v-else class="min-h-screen">
      <header class="sticky top-0 z-30 border-b border-slate-300 bg-[#f6f1ea]/95 backdrop-blur">
        <div class="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Content Management</p>
            <h1 class="font-serif text-3xl">Site Content</h1>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button class="border border-slate-300 px-4 py-3 text-xs uppercase tracking-widest inline-flex items-center gap-2" @click="saveDraft" :disabled="saving">
              <Save :size="16" /> Save Draft
            </button>
            <button v-if="draftReady" class="border border-slate-300 px-4 py-3 text-xs uppercase tracking-widest inline-flex items-center gap-2" @click="openPreview">
              <Eye :size="16" /> Open Preview
            </button>
            <button class="bg-[#191614] text-white px-4 py-3 text-xs uppercase tracking-widest inline-flex items-center gap-2" @click="createJob" :disabled="saving">
              <Rocket :size="16" /> Deploy
            </button>
            <button class="px-3 py-3" aria-label="Log out" @click="logout">
              <LogOut :size="18" />
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8">
        <aside class="lg:sticky lg:top-28 self-start border border-[#d8c7b9] bg-white">
          <button
            v-for="section in sections"
            :key="section"
            class="w-full text-left px-4 py-3 border-b border-[#eaded4] text-xs uppercase tracking-widest"
            :class="activeSection === section ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'"
            @click="activeSection = section"
          >
            {{ section }}
          </button>
        </aside>

        <section class="space-y-6">
          <div v-if="message || error" class="border border-slate-300 bg-white p-4 text-sm space-y-2">
            <p v-if="message">{{ message }}</p>
            <p v-if="error" class="text-red-700">{{ error }}</p>
          </div>

          <div v-if="activeSection === 'Site'" class="editor-panel">
            <h2>Site Metadata</h2>
            <label><span>Name</span><input v-model="content.siteMetadata.name" /></label>
            <label><span>Established</span><input v-model.number="content.siteMetadata.established" type="number" /></label>
            <label><span>Location</span><input v-model="content.siteMetadata.location" /></label>
            <label><span>Short Location</span><input v-model="content.siteMetadata.shortLocation" /></label>
            <label><span>Tagline</span><input v-model="content.siteMetadata.tagline" /></label>
            <label><span>Description</span><textarea v-model="content.siteMetadata.description" rows="4" /></label>
          </div>

          <div v-if="activeSection === 'Hero'" class="editor-panel">
            <h2>Hero</h2>
            <label><span>Label</span><input v-model="content.hero.label" /></label>
            <label><span>Primary Title</span><input v-model="content.hero.title.primary" /></label>
            <label><span>Secondary Title</span><input v-model="content.hero.title.secondary" /></label>
            <label><span>Description</span><textarea v-model="content.hero.description" rows="4" /></label>
            <label><span>CTA Label</span><input v-model="content.hero.cta.label" /></label>
            <label><span>CTA Link</span><input v-model="content.hero.cta.href" /></label>
            <label><span>Image URL</span><input v-model="content.hero.image.src" /></label>
            <label class="upload-control">
              <span>Upload Image</span>
              <input type="file" accept="image/*" :disabled="uploading" @change="uploadImage($event, (url) => content.hero.image.src = url)" />
              <Upload :size="16" />
            </label>
            <label><span>Image Alt</span><input v-model="content.hero.image.alt" /></label>
          </div>

          <div v-if="activeSection === 'Navigation'" class="editor-panel">
            <div class="section-title">
              <h2>Navigation</h2>
              <button @click="addNavigationItem"><Plus :size="16" /> Add</button>
            </div>
            <div v-for="(item, index) in content.navigation.items" :key="index" class="repeat-row">
              <label><span>Label</span><input v-model="item.label" /></label>
              <label><span>Href</span><input v-model="item.href" /></label>
              <button class="danger" @click="content.navigation.items.splice(index, 1)"><Trash2 :size="16" /></button>
            </div>
          </div>

          <div v-if="activeSection === 'Practice'" class="editor-panel">
            <label><span>Overview Label</span><input v-model="content.practiceOverview.label" /></label>
            <label><span>Overview Description</span><textarea v-model="content.practiceOverview.description" rows="3" /></label>
            <div class="section-title">
              <h2>Practice Areas</h2>
              <button @click="addPractice"><Plus :size="16" /> Add</button>
            </div>
            <div v-for="(practice, index) in content.practiceAreas" :key="practice.slug" class="collection-card">
              <div class="section-title">
                <h3>{{ practice.title }}</h3>
                <button class="danger" @click="content.practiceAreas.splice(index, 1)"><Trash2 :size="16" /></button>
              </div>
              <label><span>ID</span><input v-model="practice.id" /></label>
              <label><span>Slug</span><input v-model="practice.slug" /></label>
              <label><span>Title</span><input v-model="practice.title" /></label>
              <label><span>Description</span><textarea v-model="practice.description" rows="3" /></label>
              <label><span>Detailed Description</span><textarea v-model="practice.detailedDescription" rows="8" /></label>
              <label><span>Image URL</span><input v-model="practice.image" /></label>
              <label class="upload-control">
                <span>Upload Image</span>
                <input type="file" accept="image/*" :disabled="uploading" @change="uploadImage($event, (url) => practice.image = url)" />
                <Upload :size="16" />
              </label>
            </div>
          </div>

          <div v-if="activeSection === 'About'" class="editor-panel">
            <h2>About</h2>
            <label><span>Label</span><input v-model="content.about.label" /></label>
            <label><span>Title</span><input v-model="content.about.title" /></label>
            <div class="section-title">
              <h3>Title Lines</h3>
              <button @click="addString(content.about.titleLines)"><Plus :size="16" /> Add</button>
            </div>
            <div v-for="(_, index) in content.about.titleLines" :key="index" class="repeat-row">
              <input v-model="content.about.titleLines[index]" />
              <button class="danger" @click="removeString(content.about.titleLines, index)"><Trash2 :size="16" /></button>
            </div>
            <div class="section-title">
              <h3>Description Paragraphs</h3>
              <button @click="addString(content.about.description)"><Plus :size="16" /> Add</button>
            </div>
            <div v-for="(_, index) in content.about.description" :key="index" class="repeat-row">
              <textarea v-model="content.about.description[index]" rows="4" />
              <button class="danger" @click="removeString(content.about.description, index)"><Trash2 :size="16" /></button>
            </div>
            <label><span>Image URL</span><input v-model="content.about.image.src" /></label>
            <label class="upload-control">
              <span>Upload Image</span>
              <input type="file" accept="image/*" :disabled="uploading" @change="uploadImage($event, (url) => content.about.image.src = url)" />
              <Upload :size="16" />
            </label>
            <label><span>Image Alt</span><input v-model="content.about.image.alt" /></label>
          </div>

          <div v-if="activeSection === 'People'" class="editor-panel">
            <label><span>Label</span><input v-model="content.people.label" /></label>
            <label><span>Title</span><input v-model="content.people.title" /></label>
            <label><span>Description</span><textarea v-model="content.people.description" rows="3" /></label>
            <div class="section-title">
              <h2>Members</h2>
              <button @click="addPerson"><Plus :size="16" /> Add</button>
            </div>
            <div v-for="(person, index) in content.people.members" :key="`${person.name}-${index}`" class="collection-card">
              <div class="section-title">
                <h3>{{ person.name }}</h3>
                <button class="danger" @click="content.people.members.splice(index, 1)"><Trash2 :size="16" /></button>
              </div>
              <label><span>Name</span><input v-model="person.name" /></label>
              <label><span>Role</span><input v-model="person.role" /></label>
              <label><span>Credentials</span><input v-model="person.credentials" /></label>
              <label><span>Bio</span><textarea v-model="person.bio" rows="6" /></label>
              <label><span>Image URL</span><input v-model="person.image" /></label>
              <label class="upload-control">
                <span>Upload Image</span>
                <input type="file" accept="image/*" :disabled="uploading" @change="uploadImage($event, (url) => person.image = url)" />
                <Upload :size="16" />
              </label>
            </div>
          </div>

          <div v-if="activeSection === 'Contact'" class="editor-panel">
            <h2>Contact</h2>
            <label><span>Heading</span><input v-model="content.contact.label" /></label>
            <label><span>Office Label</span><input v-model="content.contact.office.label" /></label>
            <label><span>Address</span><textarea v-model="content.contact.office.address" rows="4" /></label>
            <label><span>Communication Label</span><input v-model="content.contact.communication.label" /></label>
            <label><span>Phone</span><input v-model="content.contact.communication.phone" /></label>
            <label><span>Email</span><input v-model="content.contact.communication.email" /></label>
          </div>

          <div v-if="activeSection === 'Footer'" class="editor-panel">
            <h2>Footer</h2>
            <label><span>Brand</span><input v-model="content.footer.brand" /></label>
            <label><span>Copyright</span><input v-model="content.footer.copyright" /></label>
            <label><span>Back Label</span><input v-model="content.detailPage.backLabel" /></label>
            <label><span>CTA Label</span><input v-model="content.detailPage.ctaLabel" /></label>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.editor-panel {
  color: #334155;
}

.editor-panel {
  background: white;
  border: 1px solid #cbd5e1;
  display: grid;
  gap: 1.25rem;
  padding: 1.5rem;
}

.editor-panel h2,
.editor-panel h3 {
  font-family: Georgia, serif;
  font-size: 1.5rem;
  color: #111827;
}

.editor-panel label {
  display: grid;
  gap: 0.5rem;
}

.editor-panel label span {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
}

.editor-panel input,
.editor-panel textarea,
.repeat-row input,
.repeat-row textarea {
  border: 1px solid #cbd5e1;
  color: #111827;
  padding: 0.75rem 0.9rem;
  width: 100%;
}

.section-title,
.repeat-row {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.section-title button,
.repeat-row button {
  align-items: center;
  border: 1px solid #cbd5e1;
  display: inline-flex;
  flex-shrink: 0;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  color: #334155;
}

.collection-card {
  border: 1px solid #e2e8f0;
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.danger {
  color: #9f1d1d;
}

.upload-control {
  align-items: center;
  border: 1px dashed #94a3b8;
  cursor: pointer;
  display: inline-flex;
  gap: 0.75rem;
  justify-content: flex-start;
  max-width: max-content;
  padding: 0.75rem 0.9rem;
}

.upload-control input {
  border: 0;
  cursor: pointer;
  padding: 0;
}
</style>
