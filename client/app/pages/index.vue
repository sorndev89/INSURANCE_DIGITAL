<template>
  <div
    class="min-h-dvh bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary-text relative overflow-x-hidden"
  >
    <!-- Ambient Background Glows (Organic Fluid Depth) -->
    <div
      class="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed top-1/3 -right-40 h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-[130px] dark:bg-emerald-500/10"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[140px] dark:bg-teal-500/10"
      aria-hidden="true"
    />

    <!-- 1. STICKY NAVBAR -->
    <header
      class="sticky top-0 z-40 border-b border-line/50 bg-surface/80 backdrop-blur-xl transition-all duration-200"
    >
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <!-- Brand Logo & Name -->
        <NuxtLink to="/" class="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <img
            v-if="tenant.logoUrl"
            :src="tenant.logoUrl"
            :alt="tenant.brandName"
            class="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-surface-muted object-contain p-1 border border-line/40 shadow-xs group-hover:scale-105 transition-transform"
          />
          <span
            v-else
            class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-white shadow-md shadow-primary/25 group-hover:scale-105 transition-transform"
          >
            <BaseIcon name="shield" size="lg" />
          </span>
          <div class="min-w-0">
            <span
              class="block text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-foreground truncate max-w-[140px] sm:max-w-[200px] md:max-w-none"
            >
              {{ tenant.brandName }}
            </span>
            <span class="block text-[10px] sm:text-[11px] text-muted -mt-0.5 font-medium"
              >ປະກັນໄພດິຈິຕອນ</span
            >
          </div>
        </NuxtLink>

        <!-- Navigation Links (Desktop) -->
        <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-muted">
          <a href="#products" class="hover:text-primary-text transition-colors">ຜະລິດຕະພັນ</a>
          <a href="#calculator" class="hover:text-primary-text transition-colors"
            >ຄິດໄລ່ເບ້ຍປະກັນ</a
          >
          <a href="#how-it-works" class="hover:text-primary-text transition-colors"
            >ຂັ້ນຕອນບໍລິການ</a
          >
          <a
            href="#claims"
            class="hover:text-danger text-danger/90 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span class="flex h-2 w-2 rounded-full bg-danger animate-ping" />
            ແຈ້ງເຄມ 24/7
          </a>
        </nav>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 sm:gap-2.5">
          <BaseButton
            variant="ghost"
            size="sm"
            icon="verified_user"
            class="hidden lg:inline-flex rounded-full text-muted hover:text-foreground"
            @click="verifyModalOpen = true"
          >
            ກວດສອບປະກັນໄພ
          </BaseButton>

          <template v-if="auth.isAuthenticated">
            <BaseButton
              size="sm"
              icon="dashboard"
              class="rounded-full shadow-sm text-xs sm:text-sm px-3 sm:px-4"
              @click="navigateTo(auth.landingPath || '/dashboard')"
            >
              <span class="hidden sm:inline">ໄປທີ່ Dashboard</span>
              <span class="sm:hidden">Dashboard</span>
            </BaseButton>
          </template>
          <template v-else>
            <BaseButton
              size="sm"
              icon="login"
              class="rounded-full shadow-sm shadow-primary/20 text-xs sm:text-sm px-3 sm:px-4"
              @click="navigateTo('/login')"
            >
              ເຂົ້າສູ່ລະບົບ
            </BaseButton>
          </template>

          <!-- Mobile Hamburger Toggle Button -->
          <button
            type="button"
            class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-line/60 bg-surface text-muted md:hidden hover:text-foreground transition-colors cursor-pointer"
            :aria-expanded="mobileMenuOpen"
            aria-label="ເມນູຫຼັກ"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <BaseIcon :name="mobileMenuOpen ? 'close' : 'menu'" size="md" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer / Slide-down -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <div
          v-if="mobileMenuOpen"
          class="border-b border-line/60 bg-surface/95 backdrop-blur-2xl md:hidden px-4 py-4 shadow-xl space-y-3"
        >
          <nav class="flex flex-col space-y-1">
            <a
              href="#products"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors"
              @click="mobileMenuOpen = false"
            >
              <BaseIcon name="verified_user" size="sm" class="text-primary-text" />
              <span>ຜະລິດຕະພັນປະກັນໄພ</span>
            </a>
            <a
              href="#calculator"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors"
              @click="mobileMenuOpen = false"
            >
              <BaseIcon name="calculate" size="sm" class="text-primary-text" />
              <span>ຄິດໄລ່ເບ້ຍປະກັນ</span>
            </a>
            <a
              href="#how-it-works"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors"
              @click="mobileMenuOpen = false"
            >
              <BaseIcon name="info" size="sm" class="text-primary-text" />
              <span>ຂັ້ນຕອນບໍລິການ</span>
            </a>
            <a
              href="#claims"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-danger hover:bg-danger/10 transition-colors"
              @click="mobileMenuOpen = false"
            >
              <span class="flex h-2 w-2 rounded-full bg-danger animate-ping" />
              <span>ແຈ້ງເຄມສຸກເສີນ 24/7</span>
            </a>
          </nav>

          <div class="pt-3 border-t border-line/50 flex flex-col gap-2">
            <BaseButton
              block
              variant="secondary"
              icon="verified"
              class="rounded-xl justify-center font-medium py-2.5"
              @click="
                () => {
                  mobileMenuOpen = false
                  verifyModalOpen = true
                }
              "
            >
              ກວດສອບປະກັນໄພ
            </BaseButton>

            <a
              href="tel:1599"
              class="flex items-center justify-center gap-2 rounded-xl bg-danger/10 text-danger border border-danger/20 py-2.5 px-4 text-xs font-bold hover:bg-danger hover:text-white transition-all text-center"
            >
              <BaseIcon name="call" size="sm" />
              <span>ໂທສຸກເສີນ: 1599 (ໂທຟຣີ 24 ຊົ່ວໂມງ)</span>
            </a>
          </div>
        </div>
      </Transition>
    </header>

    <main class="flex-1">
      <!-- 2. HERO SECTION -->
      <section class="relative pt-8 pb-14 sm:pt-14 sm:pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <div class="grid gap-10 lg:grid-cols-12 lg:items-center">
            <!-- Left Column: Copy & Actions -->
            <div class="lg:col-span-7 space-y-5 sm:space-y-6">
              <!-- Pill Badge -->
              <div
                class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary-text backdrop-blur-sm shadow-xs"
              >
                <span class="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>ປະກັນໄພດິຈິຕອນຮູບແບບໃໝ່ · ວ່ອງໄວ & ໂປ່ງໃສ</span>
              </div>

              <!-- Main Title -->
              <h1
                class="text-2xl sm:text-4xl md:text-5xl lg:text-5xl/tight font-extrabold tracking-tight text-foreground"
              >
                ປົກປ້ອງທຸກສິ່ງສຳຄັນ
                <span
                  class="block bg-gradient-to-r from-primary via-emerald-600 to-teal-500 bg-clip-text text-transparent"
                >
                  ດ້ວຍຄວາມໝັ້ນໃຈ ແລະ ອົບອຸ່ນໃຈ
                </span>
              </h1>

              <!-- Description -->
              <p class="max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-muted">
                ບໍລິການປະກັນໄພທີ່ອອກແບບມາເພື່ອຄົນລາວ ຈາກ
                <strong class="text-foreground font-semibold">{{ tenant.brandName }}</strong
                >. ອອກກົມມະທັນອອນລາຍງ່າຍດາຍໃນ 3 ນາທີ, ຄຸ້ມຄອງທັນທີ ພ້ອມທີມງານດູແລ ແລະ
                ເຄືອຂ່າຍໂຮງໝໍ-ອູ່ສ້ອມຕະຫຼອດ 24 ຊົ່ວໂມງ.
              </p>

              <!-- CTA Group -->
              <div
                class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 sm:pt-2"
              >
                <a href="#calculator" class="w-full sm:w-auto">
                  <BaseButton
                    size="lg"
                    icon="calculate"
                    class="w-full sm:w-auto justify-center rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                  >
                    ຄິດໄລ່ເບ້ຍປະກັນດ່ວນ
                  </BaseButton>
                </a>
                <BaseButton
                  size="lg"
                  variant="secondary"
                  icon="verified"
                  class="w-full sm:w-auto justify-center rounded-full border-line/60 bg-surface hover:bg-surface-muted transition-all active:scale-95"
                  @click="verifyModalOpen = true"
                >
                  ກວດສອບປະກັນໄພ
                </BaseButton>
              </div>

              <!-- Social Proof / Trust Metrics -->
              <div class="pt-5 sm:pt-6 border-t border-line/50 grid grid-cols-3 gap-2 sm:gap-4">
                <div v-for="stat in stats" :key="stat.label" class="space-y-0.5">
                  <dd
                    class="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums"
                  >
                    {{ stat.value }}
                  </dd>
                  <dt class="text-[11px] sm:text-sm text-muted font-medium">{{ stat.label }}</dt>
                </div>
              </div>
            </div>

            <!-- Right Column: Live Protected Virtual E-Card (Interactive Visual Mockup) -->
            <div class="lg:col-span-5 relative mt-4 lg:mt-0">
              <div class="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                <!-- Floating Glass Notification 1: Claim Paid (Top Right) -->
                <div
                  class="absolute -top-4 right-0 sm:-top-6 sm:-right-4 z-20 flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-white/40 bg-surface/90 backdrop-blur-xl p-2.5 sm:p-3 shadow-xl shadow-black/5 animate-fade-in max-w-[210px] sm:max-w-none"
                >
                  <div
                    class="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success"
                  >
                    <BaseIcon name="payments" size="sm" class="sm:hidden" />
                    <BaseIcon name="payments" size="md" class="hidden sm:block" />
                  </div>
                  <div class="text-[11px] sm:text-xs">
                    <p class="font-bold text-foreground">ອະນຸມັດເຄມສຳເລັດ</p>
                    <p class="text-muted tabular-nums">1,250,000 LAK · 15 ນາທີຜ່ານມາ</p>
                  </div>
                </div>

                <!-- Main Virtual Insurance E-Card (Glassmorphism & Depth) -->
                <div
                  class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-800 via-primary to-teal-950 p-5 sm:p-7 text-white shadow-2xl shadow-primary/20 border border-white/20 transition-transform duration-300 hover:scale-[1.01]"
                >
                  <!-- Glossy Overlay -->
                  <div
                    class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none"
                  />
                  <div
                    class="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/20 blur-2xl pointer-events-none"
                  />

                  <!-- Card Header -->
                  <div class="relative flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 sm:gap-2.5">
                      <div
                        class="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md"
                      >
                        <BaseIcon name="shield" size="sm" class="sm:hidden" />
                        <BaseIcon name="shield" size="md" class="hidden sm:block" />
                      </div>
                      <div>
                        <p
                          class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80"
                        >
                          DIGITAL POLICY CARD
                        </p>
                        <p
                          class="text-xs sm:text-sm font-extrabold truncate max-w-[120px] sm:max-w-none"
                        >
                          {{ tenant.brandName }}
                        </p>
                      </div>
                    </div>
                    <!-- Status Badge -->
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-emerald-300 backdrop-blur-md border border-emerald-400/30 shrink-0"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Protected
                    </span>
                  </div>

                  <!-- EMV Chip & Contactless Visual -->
                  <div class="relative mt-6 sm:mt-8 flex items-center justify-between">
                    <div
                      class="h-7 w-10 sm:h-8 sm:w-11 rounded-md bg-amber-300/80 border border-amber-200/50 flex items-center justify-center shadow-inner"
                    >
                      <div
                        class="h-4 w-7 sm:h-5 sm:w-8 rounded-xs border border-amber-500/40 opacity-70"
                      />
                    </div>
                    <BaseIcon name="contactless" size="md" class="text-white/60" />
                  </div>

                  <!-- Policy Details -->
                  <div class="relative mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
                    <div>
                      <p class="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/60">
                        Policy Number
                      </p>
                      <p class="text-base sm:text-xl font-mono font-bold tracking-wider text-white">
                        POL · 2026 · 08912
                      </p>
                    </div>

                    <div
                      class="flex items-end justify-between border-t border-white/15 pt-2.5 sm:pt-3 text-[11px] sm:text-xs"
                    >
                      <div>
                        <p
                          class="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/60"
                        >
                          Insured Member
                        </p>
                        <p class="font-bold text-white mt-0.5">ສົມສັກ ພົມມະຈັນ</p>
                      </div>
                      <div class="text-right">
                        <p
                          class="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/60"
                        >
                          Coverage Plan
                        </p>
                        <p class="font-bold text-white mt-0.5">ປະກັນໄພລົດຍົນ ຊັ້ນ 1</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Floating Glass Notification 2: No Pre-payment Hospital (Bottom Left) -->
                <div
                  class="absolute -bottom-4 left-0 sm:-bottom-6 sm:-left-4 z-20 flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-white/40 bg-surface/90 backdrop-blur-xl p-2.5 sm:p-3 shadow-xl shadow-black/5 animate-fade-in max-w-[210px] sm:max-w-none"
                >
                  <div
                    class="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-text"
                  >
                    <BaseIcon name="health_and_safety" size="sm" class="sm:hidden" />
                    <BaseIcon name="health_and_safety" size="md" class="hidden sm:block" />
                  </div>
                  <div class="text-[11px] sm:text-xs">
                    <p class="font-bold text-foreground">ບໍ່ຕ້ອງສຳຮອງຈ່າຍກ່ອນ</p>
                    <p class="text-muted truncate">ເຄືອຂ່າຍ 100+ ແຫ່ງ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. INTERACTIVE QUICK PREMIUM CALCULATOR -->
      <section id="calculator" class="py-12 sm:py-16 md:py-20 scroll-mt-16">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <BaseBadge tone="primary" class="rounded-full px-3 py-1 text-xs"
              >ເຄື່ອງມືຄິດໄລ່ອັດສະລິຍະ</BaseBadge
            >
            <h2 class="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              ຄິດໄລ່ເບ້ຍປະກັນໄພເບື້ອງຕົ້ນ
            </h2>
            <p class="text-xs sm:text-base text-muted">
              ເລືອກປະເພດປະກັນໄພ ແລະ ແຜນຄວາມຄຸ້ມຄອງ ເພື່ອປະເມີນຄ່າເບ້ຍປະກັນໄດ້ທັນທີ
            </p>
          </div>

          <!-- Glassmorphism Calculator Card (Soft Shadow & Curves) -->
          <div
            class="mt-8 sm:mt-10 max-w-3xl mx-auto rounded-2xl sm:rounded-3xl border border-line/60 bg-surface/90 backdrop-blur-xl p-4 sm:p-8 md:p-9 shadow-xl shadow-primary/5 transition-all"
          >
            <!-- Step 1: Select Type via Pill Segmented Bar -->
            <div>
              <p
                class="text-xs font-bold uppercase tracking-wider text-muted mb-2.5 sm:mb-3 flex items-center gap-1.5"
              >
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary-text text-[11px] font-extrabold"
                  >1</span
                >
                ເລືອກປະເພດປະກັນໄພ
              </p>
              <div
                class="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-surface-muted/60 border border-line/40"
              >
                <button
                  v-for="cat in calculatorCategories"
                  :key="cat.key"
                  type="button"
                  class="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl py-2 px-1.5 sm:py-2.5 sm:px-3 text-center transition-all cursor-pointer font-medium text-[11px] sm:text-sm"
                  :class="
                    selectedCategory === cat.key
                      ? 'bg-surface text-primary-text font-bold shadow-sm shadow-black/5 ring-1 ring-primary/20'
                      : 'text-muted hover:text-foreground'
                  "
                  @click="selectedCategory = cat.key"
                >
                  <BaseIcon :name="cat.icon" size="sm" />
                  <span class="truncate sm:overflow-visible">{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- Step 2: Select Tier Plan via Rounded Cards -->
            <div class="mt-6 sm:mt-8">
              <p
                class="text-xs font-bold uppercase tracking-wider text-muted mb-2.5 sm:mb-3 flex items-center gap-1.5"
              >
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary-text text-[11px] font-extrabold"
                  >2</span
                >
                ເລືອກລະດັບແຜນຄວາມຄຸ້ມຄອງ
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  v-for="tier in activeCategoryPlans"
                  :key="tier.tierKey"
                  type="button"
                  class="relative rounded-xl sm:rounded-2xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer group"
                  :class="
                    selectedTierKey === tier.tierKey
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                      : 'border-line/60 bg-surface hover:border-primary/40'
                  "
                  @click="selectedTierKey = tier.tierKey"
                >
                  <div class="flex items-center justify-between">
                    <p
                      class="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary-text transition-colors"
                    >
                      {{ tier.name }}
                    </p>
                    <span
                      class="flex h-4 w-4 items-center justify-center rounded-full border transition-all shrink-0 ml-2"
                      :class="
                        selectedTierKey === tier.tierKey
                          ? 'border-primary bg-primary text-white'
                          : 'border-line'
                      "
                    >
                      <span
                        v-if="selectedTierKey === tier.tierKey"
                        class="h-1.5 w-1.5 rounded-full bg-white"
                      />
                    </span>
                  </div>
                  <p class="text-[11px] sm:text-xs text-muted mt-1 leading-relaxed">
                    {{ tier.desc }}
                  </p>
                </button>
              </div>
            </div>

            <!-- Step 3: Estimated Price & Action Box -->
            <div
              class="mt-6 sm:mt-8 rounded-2xl bg-gradient-to-r from-primary/10 via-emerald-500/5 to-teal-500/10 border border-primary/20 p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5"
            >
              <div class="space-y-1 text-center sm:text-left">
                <p class="text-xs font-semibold text-muted">ຄ່າເບ້ຍປະກັນໂດຍປະມານ (ລາຍປີ)</p>
                <div class="flex items-baseline justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <span
                    class="text-2xl sm:text-4xl font-extrabold text-foreground tabular-nums tracking-tight"
                  >
                    {{ format.currency(currentEstimate.annualPrice) }}
                  </span>
                  <span class="text-xs text-muted font-medium">/ ປີ</span>
                </div>
                <p class="text-xs text-muted">
                  ✓ ວົງເງິນຄຸ້ມຄອງສູງສຸດເຖິງ:
                  <strong class="text-foreground font-semibold">{{
                    currentEstimate.coverageLimit
                  }}</strong>
                </p>
              </div>

              <div class="flex items-center gap-3 w-full sm:w-auto">
                <BaseButton
                  size="lg"
                  class="w-full sm:w-auto justify-center rounded-full shadow-md shadow-primary/20 font-bold"
                  icon="description"
                  @click="navigateTo(auth.isAuthenticated ? '/policies/create' : '/login')"
                >
                  ຂໍໃບສະເໜີລາຄາ
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. POPULAR PRODUCTS SECTION (Soft Cards with Depth) -->
      <section id="products" class="py-12 sm:py-16 md:py-20 scroll-mt-16">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <BaseBadge tone="primary" class="rounded-full px-3 py-1 text-xs"
                >ຜະລິດຕະພັນທີ່ໂດດເດັ່ນ</BaseBadge
              >
              <h2 class="mt-2 text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                ແຜນປະກັນໄພທີ່ຕອບໂຈດທຸກຄວາມຕ້ອງການ
              </h2>
              <p class="mt-1 text-xs sm:text-base text-muted max-w-xl">
                ຄັດສັນແຜນຄວາມຄຸ້ມຄອງທີ່ດີທີ່ສຸດ ພ້ອມເບ້ຍປະກັນທີ່ຄຸ້ມຄ່າ ໂດຍຜູ້ຊ່ຽວຊານ
              </p>
            </div>
            <BaseButton
              variant="secondary"
              icon="arrow_forward"
              class="rounded-full self-start sm:self-auto"
              @click="navigateTo('/login')"
            >
              ເບິ່ງທຸກແຜນ
            </BaseButton>
          </div>

          <!-- Product Cards Grid with Soft Hover Lift -->
          <div class="mt-8 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="product in products"
              :key="product.id"
              class="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-line/50 bg-surface p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div>
                <div class="flex items-center justify-between gap-2">
                  <span
                    class="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/15 to-emerald-500/15 text-primary-text group-hover:scale-105 transition-transform"
                  >
                    <BaseIcon :name="product.icon" size="md" />
                  </span>
                  <span
                    v-if="product.badge"
                    class="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    {{ product.badge }}
                  </span>
                </div>

                <h3
                  class="mt-4 text-base sm:text-lg font-bold text-foreground group-hover:text-primary-text transition-colors"
                >
                  {{ product.name }}
                </h3>
                <p class="mt-1.5 text-xs text-muted leading-relaxed">{{ product.description }}</p>

                <!-- Features checklist -->
                <ul
                  class="mt-4 sm:mt-5 space-y-2 sm:space-y-2.5 border-t border-line/40 pt-3.5 sm:pt-4 text-xs text-muted"
                >
                  <li
                    v-for="benefit in product.benefits"
                    :key="benefit"
                    class="flex items-center gap-2"
                  >
                    <BaseIcon name="check_circle" size="sm" class="text-success shrink-0" />
                    <span>{{ benefit }}</span>
                  </li>
                </ul>
              </div>

              <div class="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-line/40">
                <p class="text-[11px] text-muted font-medium">ເລີ່ມຕົ້ນພຽງ</p>
                <div class="flex items-baseline justify-between mt-0.5">
                  <span class="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
                    {{ format.currency(product.startPrice) }}
                  </span>
                  <span class="text-xs text-muted font-medium">/ ປີ</span>
                </div>
                <BaseButton
                  block
                  class="mt-3 sm:mt-3.5 rounded-full"
                  variant="secondary"
                  size="sm"
                  @click="navigateTo(auth.isAuthenticated ? '/policies/create' : '/login')"
                >
                  ເລືອກແຜນນີ້
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. HOW IT WORKS (Organic Connected Steps) -->
      <section id="how-it-works" class="py-12 sm:py-16 md:py-20 scroll-mt-16">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <BaseBadge tone="neutral" class="rounded-full px-3 py-1 text-xs"
              >ຂັ້ນຕອນງ່າຍໆ</BaseBadge
            >
            <h2 class="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              ຮັບຄວາມຄຸ້ມຄອງໃນ 3 ຂັ້ນຕອນ
            </h2>
            <p class="text-xs sm:text-base text-muted">
              ສະດວກ, ວ່ອງໄວ, ບໍ່ຕ້ອງເສຍເວລາເດີນທາງ ຜ່ານລະບົບອອນລາຍ 100%
            </p>
          </div>

          <div class="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-3 relative">
            <div
              v-for="(step, idx) in steps"
              :key="step.title"
              class="relative rounded-2xl sm:rounded-3xl border border-line/50 bg-surface/80 backdrop-blur-md p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <span
                  class="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-white font-extrabold text-base sm:text-lg shadow-md shadow-primary/20"
                >
                  {{ idx + 1 }}
                </span>
                <BaseIcon :name="step.icon" size="lg" class="text-muted/40" />
              </div>
              <h3 class="mt-4 sm:mt-5 text-base sm:text-lg font-bold text-foreground">
                {{ step.title }}
              </h3>
              <p class="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. 24/7 EMERGENCY CLAIMS & ASSISTANCE (Warm & Reassuring Tone) -->
      <section id="claims" class="py-10 sm:py-14 md:py-16 scroll-mt-16">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            class="overflow-hidden rounded-2xl sm:rounded-3xl border border-rose-200/60 dark:border-rose-900/40 bg-gradient-to-br from-rose-500/10 via-surface to-amber-500/5 p-5 sm:p-8 md:p-10 shadow-xl shadow-rose-500/5"
          >
            <div class="grid gap-6 sm:gap-8 lg:grid-cols-12 lg:items-center">
              <div class="lg:col-span-8 space-y-3.5 sm:space-y-4">
                <div
                  class="inline-flex items-center gap-2 rounded-full bg-danger/10 px-3.5 py-1 text-xs font-bold text-danger border border-danger/20"
                >
                  <span class="flex h-2 w-2 rounded-full bg-danger animate-ping" />
                  ສູນຊ່ວຍເຫຼືອສຸກເສີນ ແລະ ແຈ້ງເຄມ 24 ຊົ່ວໂມງ
                </div>
                <h2 class="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  ເກີດອຸບັດຕິເຫດ ຫຼື ຕ້ອງການແຈ້ງເຄມດ່ວນ?
                </h2>
                <p class="text-xs sm:text-base text-muted max-w-2xl leading-relaxed">
                  ທີມງານສຳຫຼວດໄພຂອງ
                  <strong class="text-foreground">{{ tenant.brandName }}</strong>
                  ພ້ອມອອກໄປຫາສະຖານທີ່ເກີດເຫດທັນທີ. ພວກເຮົາມີເຄືອຂ່າຍອູ່ສ້ອມມາດຕະຖານ ແລະ
                  ໂຮງໝໍຄູ່ສັນຍາຫຼາຍກວ່າ 100 ແຫ່ງທົ່ວປະເທດ.
                </p>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <a
                    href="tel:1599"
                    class="inline-flex items-center justify-center gap-2 rounded-full bg-danger px-6 py-3 text-sm font-bold text-white hover:bg-danger/90 transition-all shadow-lg shadow-danger/25 active:scale-95 text-center"
                  >
                    <BaseIcon name="call" size="md" />
                    ໂທສຸກເສີນ: 1599 (ໂທຟຣີ)
                  </a>
                  <BaseButton
                    variant="secondary"
                    icon="assignment"
                    class="rounded-full bg-surface hover:bg-surface-muted justify-center"
                    @click="navigateTo(auth.isAuthenticated ? '/claims' : '/login')"
                  >
                    ແຈ້ງເຄມອອນລາຍ
                  </BaseButton>
                </div>
              </div>

              <!-- Quick Claim Checklist Card -->
              <div
                class="lg:col-span-4 rounded-2xl border border-line/60 bg-surface/90 backdrop-blur-md p-4 sm:p-5 shadow-xs"
              >
                <p class="text-xs font-bold text-foreground uppercase tracking-wider">
                  ສິ່ງທີ່ຄວນກຽມເມື່ອເກີດເຫດ
                </p>
                <ul class="mt-3 space-y-2 sm:space-y-2.5 text-xs text-muted">
                  <li class="flex items-start gap-2">
                    <BaseIcon name="check" size="sm" class="text-danger shrink-0 mt-0.5" />
                    <span>ເລກທີກົມມະທັນ ຫຼື ເບີໂທຜູ້ເອົາປະກັນ</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <BaseIcon name="check" size="sm" class="text-danger shrink-0 mt-0.5" />
                    <span>ສະຖານທີ່ເກີດເຫດ ແລະ ວັນເວລາ</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <BaseIcon name="check" size="sm" class="text-danger shrink-0 mt-0.5" />
                    <span>ຖ່າຍຮູບສະພາບຄວາມເສຍຫາຍເບື້ອງຕົ້ນ</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. AGENT & PARTNER PORTAL CTA -->
      <section class="py-10 sm:py-14 md:py-16">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            class="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-emerald-800 to-teal-900 p-6 sm:p-10 md:p-12 text-white shadow-2xl shadow-primary/20 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden"
          >
            <div
              class="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"
            />

            <div class="space-y-2 max-w-xl relative">
              <span
                class="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md"
              >
                ສຳລັບຕົວແທນ ແລະ ທີມງານຂາຍ
              </span>
              <h2 class="text-xl sm:text-3xl font-extrabold tracking-tight">
                ຮ່ວມງານກັບພວກເຮົາໃນຖານະຕົວແທນປະກັນໄພ
              </h2>
              <p class="text-xs sm:text-sm text-on-primary leading-relaxed opacity-90">
                ເຂົ້າເຖິງລະບົບ Agent Portal ທີ່ທັນສະໄໝ, ອອກກົມມະທັນອອນລາຍໄດ້ທັນທີ, ແລະ
                ຮັບຄ່ານາຍໜ້າທີ່ຄຸ້ມຄ່າ.
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0 relative w-full md:w-auto">
              <BaseButton
                size="lg"
                icon="login"
                class="w-full md:w-auto justify-center rounded-full bg-white text-primary hover:bg-neutral-100 font-bold shadow-lg"
                @click="navigateTo('/login')"
              >
                ເຂົ້າສູ່ລະບົບຕົວແທນ
              </BaseButton>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 8. ENTERPRISE CORPORATE FOOTER -->
    <footer class="border-t border-line/50 bg-surface/80 backdrop-blur-md py-10 sm:py-12 text-sm">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="grid gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
          <!-- Company Bio -->
          <div class="col-span-2 lg:col-span-2 space-y-3">
            <div class="flex items-center gap-2.5">
              <img
                v-if="tenant.logoUrl"
                :src="tenant.logoUrl"
                :alt="tenant.brandName"
                class="h-8 w-8 rounded-xl object-contain border border-line/40"
              />
              <span class="text-base font-extrabold text-foreground">{{ tenant.brandName }}</span>
            </div>
            <p class="text-xs text-muted leading-relaxed max-w-sm">
              ຜູ້ໃຫ້ບໍລິການດ້ານປະກັນໄພດິຈິຕອນຊັ້ນນຳ ດ້ວຍເທັກໂນໂລຊີທີ່ປອດໄພ, ໂປ່ງໃສ ແລະ
              ຄຸ້ມຄອງທຸກຄວາມສ່ຽງຂອງທ່ານ.
            </p>
            <p class="text-xs text-muted">
              ລະຫັດອົງກອນ (Tenant):
              <span class="font-mono font-bold text-foreground">{{ tenant.slug }}</span>
            </p>
          </div>

          <!-- Quick Links -->
          <div class="col-span-1">
            <h4 class="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              ຜະລິດຕະພັນ
            </h4>
            <ul class="space-y-2 text-xs text-muted">
              <li>
                <a href="#products" class="hover:text-primary-text transition-colors"
                  >ປະກັນໄພລົດຍົນ</a
                >
              </li>
              <li>
                <a href="#products" class="hover:text-primary-text transition-colors"
                  >ປະກັນໄພສຸຂະພາບ</a
                >
              </li>
              <li>
                <a href="#products" class="hover:text-primary-text transition-colors"
                  >ປະກັນອັກຄີໄພ</a
                >
              </li>
              <li>
                <a href="#products" class="hover:text-primary-text transition-colors"
                  >ປະກັນອຸບັດຕິເຫດ</a
                >
              </li>
            </ul>
          </div>

          <!-- Services -->
          <div class="col-span-1">
            <h4 class="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              ບໍລິການດິຈິຕອນ
            </h4>
            <ul class="space-y-2 text-xs text-muted">
              <li>
                <button
                  type="button"
                  class="hover:text-primary-text text-left transition-colors cursor-pointer"
                  @click="verifyModalOpen = true"
                >
                  ກວດສອບປະກັນໄພ
                </button>
              </li>
              <li>
                <a href="#calculator" class="hover:text-primary-text transition-colors"
                  >ຄິດໄລ່ເບ້ຍປະກັນ</a
                >
              </li>
              <li>
                <a href="#claims" class="hover:text-primary-text transition-colors"
                  >ແຈ້ງເຄມສຸກເສີນ</a
                >
              </li>
              <li>
                <NuxtLink to="/login" class="hover:text-primary-text transition-colors"
                  >Agent Portal</NuxtLink
                >
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="col-span-2 sm:col-span-1">
            <h4 class="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              ຕິດຕໍ່ພວກເຮົາ
            </h4>
            <ul class="space-y-2.5 text-xs text-muted">
              <li class="flex items-center gap-2">
                <BaseIcon name="call" size="sm" class="text-primary-text" />
                <span class="font-medium text-foreground">Hotline: 1599</span>
              </li>
              <li class="flex items-center gap-2">
                <BaseIcon name="mail" size="sm" class="text-primary-text" />
                <span>support@saiyfon.la</span>
              </li>
              <li class="flex items-start gap-2">
                <BaseIcon name="location_on" size="sm" class="text-primary-text shrink-0 mt-0.5" />
                <span>ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="mt-8 sm:mt-10 pt-6 border-t border-line/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted text-center sm:text-left"
        >
          <p>© {{ year }} {{ tenant.brandName }}. ສະຫງວນລິຂະສິດທຸກປະການ.</p>
          <div class="flex items-center gap-4">
            <span class="inline-flex items-center gap-1.5 text-success font-medium">
              <BaseIcon name="lock" size="sm" /> ລະບົບປອດໄພຕາມມາດຕະຖານ SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </footer>

    <!-- 9. POLICY VERIFICATION MODAL (Bootstrap modal modal-top fade) -->
    <BaseModal v-model="verifyModalOpen" title="ກວດສອບປະກັນໄພ" size="md">
      <div class="space-y-4">
        <p class="text-xs text-muted">
          ປ້ອນເລກທີກົມມະທັນ (ຕົວຢ່າງ: POL-2026-001) ຫຼື ເບີໂທລະສັບທີ່ລົງທະບຽນ
          ເພື່ອກວດສອບສະຖານະຄວາມຄຸ້ມຄອງ.
        </p>

        <div class="space-y-3">
          <BaseInput
            v-model="verifyQuery"
            label="ເລກກົມມະທັນ ຫຼື ເບີໂທ"
            placeholder="ເຊັ່ນ: POL-2026-001 ຫຼື 02055551234"
            icon="search"
            @keyup.enter="handleVerifyCheck"
          />

          <BaseButton
            block
            icon="search"
            class="rounded-full shadow-sm"
            :loading="verifying"
            @click="handleVerifyCheck"
          >
            ກວດສອບ
          </BaseButton>
        </div>

        <!-- Verification Result Preview -->
        <div
          v-if="verifyResult"
          class="mt-4 rounded-2xl border border-line/60 bg-surface-muted p-4 space-y-3 animate-fade-in"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-foreground">{{ verifyResult.policyNumber }}</p>
              <p class="text-xs text-muted">{{ verifyResult.productName }}</p>
            </div>
            <BaseBadge
              :tone="verifyResult.status === 'active' ? 'success' : 'warning'"
              class="rounded-full"
            >
              {{ verifyResult.statusText }}
            </BaseBadge>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs border-t border-line/40 pt-2 text-muted">
            <div>
              <span>ຜູ້ເອົາປະກັນ:</span>
              <p class="font-bold text-foreground mt-0.5">{{ verifyResult.customerName }}</p>
            </div>
            <div>
              <span>ວັນໝົດອາຍຸ:</span>
              <p class="font-bold text-foreground mt-0.5">{{ verifyResult.endDate }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" class="rounded-full" @click="verifyModalOpen = false"
            >ປິດ</BaseButton
          >
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { navigateTo } from '#app'
import { useTenantStore } from '~/stores/tenant'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'blank',
  title: 'ໜ້າຫຼັກ',
})

const year = new Date().getFullYear()
const tenant = useTenantStore()
const auth = useAuthStore()
const format = useFormat()
const mobileMenuOpen = ref(false)

// Trust Stats
const stats = [
  { value: '10K+', label: 'ລູກຄ້າທີ່ໄວ້ວາງໃຈ' },
  { value: '99%', label: 'ອະນຸມັດເຄມວ່ອງໄວ' },
  { value: '100+', label: 'ໂຮງໝໍ ແລະ ອູ່ສ້ອມ' },
]

// Calculator Categories & Plans
const calculatorCategories = [
  { key: 'motor', label: 'ປະກັນໄພລົດຍົນ', icon: 'directions_car' },
  { key: 'health', label: 'ປະກັນສຸຂະພາບ', icon: 'health_and_safety' },
  { key: 'fire', label: 'ປະກັນອັກຄີໄພ', icon: 'home' },
]

const calculatorData = {
  motor: [
    {
      tierKey: 'tier1',
      name: 'ຊັ້ນ 1 (ຄົບວົງຈອນ)',
      desc: 'ຄຸ້ມຄອງທຸກກໍລະນີ ລົດຊົນ, ສູນຫາຍ, ໄຟໄໝ້',
      annualPrice: 2850000,
      coverageLimit: '150,000,000 LAK',
    },
    {
      tierKey: 'tier2',
      name: 'ຊັ້ນ 2+ (ຍອດນິຍົມ)',
      desc: 'ຄຸ້ມຄອງລົດຊົນລົດ, ລົດຫາຍ ແລະ ຄູ່ກໍລະນີ',
      annualPrice: 1650000,
      coverageLimit: '80,000,000 LAK',
    },
    {
      tierKey: 'tier3',
      name: 'ຊັ້ນ 3 (ພາກບັງຄັບ+)',
      desc: 'ຄຸ້ມຄອງຊີວິດ ແລະ ຊັບສິນຂອງບຸກຄົນພາຍນອກ',
      annualPrice: 850000,
      coverageLimit: '40,000,000 LAK',
    },
  ],
  health: [
    {
      tierKey: 'silver',
      name: 'Silver Plan',
      desc: 'ຄ່າຫ້ອງ ແລະ ຄ່າປິ່ນປົວສຸກເສີນ IPD',
      annualPrice: 1200000,
      coverageLimit: '30,000,000 LAK',
    },
    {
      tierKey: 'gold',
      name: 'Gold Plan',
      desc: 'ຄຸ້ມຄອງ IPD + OPD ພ້ອມຄ່າຜ່າຕັດ',
      annualPrice: 2400000,
      coverageLimit: '80,000,000 LAK',
    },
    {
      tierKey: 'platinum',
      name: 'Platinum VIP',
      desc: 'ຄຸ້ມຄອງເຕັມຮູບແບບ ບໍ່ຕ້ອງສຳຮອງຈ່າຍ',
      annualPrice: 4800000,
      coverageLimit: '200,000,000 LAK',
    },
  ],
  fire: [
    {
      tierKey: 'home',
      name: 'ທີ່ຢູ່ອາໄສ (Home)',
      desc: 'ຄຸ້ມຄອງໄຟໄໝ້, ຟ້າຜ່າ, ໄພທຳມະຊາດ',
      annualPrice: 450000,
      coverageLimit: '100,000,000 LAK',
    },
    {
      tierKey: 'shop',
      name: 'ຮ້ານຄ້າ (Commercial)',
      desc: 'ຄຸ້ມຄອງອາຄານ ແລະ ສິນຄ້າພາຍໃນຮ້ານ',
      annualPrice: 950000,
      coverageLimit: '250,000,000 LAK',
    },
    {
      tierKey: 'factory',
      name: 'ສາງສິນຄ້າ (Factory)',
      desc: 'ຄຸ້ມຄອງໂຄງສ້າງ ແລະ ເຄື່ອງຈັກອຸດສາຫະກຳ',
      annualPrice: 2200000,
      coverageLimit: '600,000,000 LAK',
    },
  ],
}

const selectedCategory = ref('motor')
const selectedTierKey = ref('tier1')

const activeCategoryPlans = computed(() => calculatorData[selectedCategory.value] || [])
const currentEstimate = computed(() => {
  const plans = activeCategoryPlans.value
  return (
    plans.find((p) => p.tierKey === selectedTierKey.value) ||
    plans[0] || { annualPrice: 0, coverageLimit: '—' }
  )
})

// Products Matrix
const products = [
  {
    id: 1,
    name: 'ປະກັນໄພລົດຍົນ',
    badge: 'ຍອດນິຍົມ',
    icon: 'directions_car',
    description: 'ຄຸ້ມຄອງຄວາມເສຍຫາຍຕໍ່ຍານພາຫະນະ, ຄູ່ກໍລະນີ ແລະ ລົດລາກສຸກເສີນ 24 ຊມ.',
    benefits: [
      'ລົດລາກຟຣີ 24 ຊມ ທົ່ວປະເທດ',
      'ສ້ອມແປງອູ່ມາດຕະຖານໃນເຄືອຂ່າຍ',
      'ອະນຸມັດເຄມວ່ອງໄວໃນ 24 ຊມ',
    ],
    startPrice: 850000,
  },
  {
    id: 2,
    name: 'ປະກັນໄພສຸຂະພາບ',
    badge: 'ແນະນຳ',
    icon: 'health_and_safety',
    description: 'ເບິ່ງແຍງສຸຂະພາບທ່ານ ແລະ ຄົນທີ່ທ່ານຮັກ ບໍ່ຕ້ອງສຳຮອງຈ່າຍໃນເຄືອຂ່າຍໂຮງໝໍ.',
    benefits: [
      'ເຄືອຂ່າຍໂຮງໝໍຊັ້ນນຳ 50+ ແຫ່ງ',
      'ຄຸ້ມຄອງທັງຄົນເຈັບໃນ (IPD) & ນອກ (OPD)',
      'ບໍ່ຕ້ອງສຳຮອງເງິນຈ່າຍກ່ອນ',
    ],
    startPrice: 1200000,
  },
  {
    id: 3,
    name: 'ປະກັນອັກຄີໄພ & ທີ່ຢູ່ອາໄສ',
    badge: '',
    icon: 'home',
    description: 'ປົກປ້ອງເຮືອນ, ຊັບສິນ ແລະ ສິ່ງປຸກສ້າງ ຈາກອັກຄີໄພ ແລະ ໄພທຳມະຊາດ.',
    benefits: [
      'ຄຸ້ມຄອງໄຟໄໝ້, ຟ້າຜ່າ, ແກ໊ສລະເບີດ',
      'ຄຸ້ມຄອງຊັບສິນ ແລະ ເຟີນີເຈີ',
      'ຄ່າເຊົ່າທີ່ພັກອາໄສຊົ່ວຄາວ',
    ],
    startPrice: 450000,
  },
  {
    id: 4,
    name: 'ປະກັນອຸບັດຕິເຫດສ່ວນບຸກຄົນ',
    badge: 'ຄຸ້ມຄ່າ',
    icon: 'personal_injury',
    description: 'ຄຸ້ມຄອງຕະຫຼອດ 24 ຊົ່ວໂມງ ທົ່ວໂລກ ເບ້ຍປະກັນເລີ່ມຕົ້ນສະບາຍກະເປົາ.',
    benefits: [
      'ຄຸ້ມຄອງ 24 ຊົ່ວໂມງ ທົ່ວໂລກ',
      'ຊົດເຊີຍລາຍໄດ້ລະຫວ່າງນອນໂຮງໝໍ',
      'ສະໝັກງ່າຍ ບໍ່ຕ້ອງກວດສຸຂະພາບ',
    ],
    startPrice: 250000,
  },
]

// How It Works Steps
const steps = [
  {
    title: '1. ເລືອກແຜນທີ່ຕອບໂຈດ',
    description: 'ປຽບທຽບຄວາມຄຸ້ມຄອງ ແລະ ຄິດໄລ່ເບ້ຍປະກັນທີ່ເໝາະສົມກັບຄວາມຕ້ອງການຂອງທ່ານ.',
    icon: 'tune',
  },
  {
    title: '2. ກອກຂໍ້ມູນ & ຊຳລະເງິນ',
    description: 'ປ້ອນຂໍ້ມູນງ່າຍໆພຽງບໍ່ເທົ່າໃດນາທີ ແລະ ຊຳລະສະດວກຜ່ານ QR Code ທະນາຄານ.',
    icon: 'qr_code_scanner',
  },
  {
    title: '3. ຮັບກົມມະທັນທັນທີ (E-Policy)',
    description: 'ຮັບກົມມະທັນດິຈິຕອນຜ່ານ SMS, WhatsApp ຫຼື Email ພ້ອມມີຜົນຄຸ້ມຄອງທັນທີ.',
    icon: 'verified',
  },
]

// Policy Verification Modal State & Logic
const verifyModalOpen = ref(false)
const verifyQuery = ref('')
const verifying = ref(false)
const verifyResult = ref(null)

const handleVerifyCheck = () => {
  if (!verifyQuery.value.trim()) return
  verifying.value = true
  verifyResult.value = null

  setTimeout(() => {
    verifying.value = false
    verifyResult.value = {
      policyNumber: verifyQuery.value.trim().toUpperCase().startsWith('POL')
        ? verifyQuery.value.trim().toUpperCase()
        : 'POL-2026-08912',
      productName: 'ປະກັນໄພລົດຍົນ ຊັ້ນ 1 (ຄົບວົງຈອນ)',
      customerName: 'ສົມສັກ ພົມມະຈັນ',
      endDate: '31/12/2026',
      status: 'active',
      statusText: 'ກຳລັງຄຸ້ມຄອງ (Active)',
    }
  }, 600)
}
</script>
