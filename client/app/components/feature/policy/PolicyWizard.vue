<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <Stepper v-if="currentStep < 5" :steps="steps" :current="currentStep" />

    <BaseCard>
      <!-- STEP 0: ຂໍ້ມູນຜູ້ເອົາປະກັນ & ຕົວແທນ (KYC) -->
      <div v-if="currentStep === 0" class="space-y-5">
        <div class="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 class="text-lg font-bold">1. ຂໍ້ມູນຜູ້ເອົາປະກັນ ແລະ ຕົວແທນ</h2>
            <p class="mt-0.5 text-xs text-muted">
              ປ້ອນຂໍ້ມູນລູກຄ້າ ແລະ ກຳນົດຕົວແທນຂາຍຜູ້ຮັບຜິດຊອບ.
            </p>
          </div>
          <BaseSelect v-model="form.customerType" label="" :options="CUSTOMER_TYPES" class="w-56" />
        </div>

        <!-- ຂໍ້ມູນບຸກຄົນທົ່ວໄປ -->
        <div v-if="form.customerType === 'individual'" class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.customer.firstName"
            label="ຊື່ແທ້"
            placeholder="ສົມສັກ"
            required
            :error="errors.firstName"
          />
          <BaseInput
            v-model="form.customer.lastName"
            label="ນາມສະກຸນ"
            placeholder="ບຸນທະວີ"
            required
            :error="errors.lastName"
          />
          <BaseInput
            v-model="form.customer.phone"
            label="ເບີໂທລະສັບ"
            placeholder="020 5555 1234"
            prefix-icon="phone"
            required
            :error="errors.phone"
          />
          <BaseInput v-model="form.customer.dob" type="date" label="ວັນເດືອນປີເກີດ" />
          <BaseSelect v-model="form.customer.gender" label="ເພດ" :options="GENDERS" />
          <BaseInput
            v-model="form.customer.occupation"
            label="ອາຊີບ"
            placeholder="ພະນັກງານບໍລິສັດ"
          />
          <BaseInput
            v-model="form.customer.idCardNumber"
            label="ເລກບັດປະຈຳຕົວ / ພາສປອດ"
            placeholder="01-..."
          />
          <BaseSelect
            v-model="form.agentId"
            label="ຕົວແທນຂາຍຜູ້ຮັບຜິດຊອບ"
            :options="agentOptions"
          />
        </div>

        <!-- ຂໍ້ມູນນິຕິບຸກຄົນ / ບໍລິສັດ -->
        <div v-else class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.customer.companyName"
            label="ຊື່ບໍລິສັດ / ອົງກອນ"
            placeholder="ບໍລິສັດ ພັດທະນາ ຈຳກັດ"
            required
            :error="errors.companyName"
          />
          <BaseInput
            v-model="form.customer.taxId"
            label="ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ (Tax ID)"
            placeholder="0101234567"
            required
            :error="errors.taxId"
          />
          <BaseInput
            v-model="form.customer.contactPerson"
            label="ຊື່ຜູ້ຕິດຕໍ່ປະສານງານ"
            placeholder="ທ່ານ ວິໄລ"
            required
            :error="errors.contactPerson"
          />
          <BaseInput
            v-model="form.customer.phone"
            label="ເບີໂທລະສັບຕິດຕໍ່"
            placeholder="021 123456"
            prefix-icon="phone"
            required
            :error="errors.phone"
          />
          <BaseSelect
            v-model="form.agentId"
            label="ຕົວແທນຂາຍຜູ້ຮັບຜິດຊອບ"
            :options="agentOptions"
          />
        </div>

        <BaseTextarea
          v-model="form.customer.address"
          label="ທີ່ຢູ່ປະຈຸບັນ"
          placeholder="ບ້ານ, ເມືອງ, ແຂວງ"
          required
          :error="errors.address"
        />

        <!-- ຂໍ້ມູນຜູ້ຮັບຜົນປະໂຫຍດ -->
        <div class="rounded-xl border border-line bg-surface-muted p-4 space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
            ຜູ້ຮັບຜົນປະໂຫຍດ (Beneficiary)
          </h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.beneficiary.name"
              label="ຊື່ຜູ້ຮັບຜົນປະໂຫຍດ"
              placeholder="ຊື່ ແລະ ນາມສະກຸນ ຫຼື ທະນາຄານ (ກໍລະນີຕິດສິນເຊື່ອ)"
            />
            <BaseInput
              v-model="form.beneficiary.relation"
              label="ສາຍພົວພັນ"
              placeholder="ເຊັ່ນ: ຄູ່ສົມລົດ, ບິດາ-ມານດາ, ທະນາຄານຜູ້ໃຫ້ກູ້"
            />
          </div>
        </div>

        <FileUpload
          v-model="form.customer.idCard"
          label="ເອກະສານຢືນຢັນຕົວຕົນ (ບັດປະຊາຊົນ / ທະບຽນວິສາຫະກິດ)"
          hint="ຮູບພາບ ຫຼື PDF, ສູງສຸດ 5 MB"
          auto-upload
          @uploaded="form.customer.idCardUrl = $event?.url || ''"
        />
      </div>

      <!-- STEP 1: ຂໍ້ມູນລົດ / ຊັບສິນທີ່ເອົາປະກັນ -->
      <div v-else-if="currentStep === 1" class="space-y-4">
        <div>
          <h2 class="text-lg font-bold">2. ຂໍ້ມູນລົດ ຫຼື ຊັບສິນທີ່ຈະຄຸ້ມຄອງ</h2>
          <p class="mt-0.5 text-xs text-muted">ລາຍລະອຽດພາຫະນະຕາມປຶ້ມຄູ່ມືລົດ (Green Book).</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.vehicle.make"
            label="ຍີ່ຫໍ້ລົດ"
            placeholder="Toyota"
            required
            :error="errors.make"
          />
          <BaseInput
            v-model="form.vehicle.model"
            label="ຮຸ່ນລົດ"
            placeholder="Hilux Revo"
            required
            :error="errors.model"
          />
          <BaseNumberInput
            v-model="form.vehicle.year"
            label="ປີຜະລິດ"
            placeholder="2024"
            :error="errors.year"
          />
          <BaseInput
            v-model="form.vehicle.plateNumber"
            label="ທະບຽນລົດ"
            placeholder="ກກ 1234"
            required
            :error="errors.plateNumber"
          />
          <BaseSelect
            v-model="form.vehicle.plateProvince"
            label="ແຂວງທະບຽນ"
            :options="LAO_PROVINCES"
          />
          <BaseInput
            v-model="form.vehicle.engineNumber"
            label="ເລກຈັກ (Engine No.)"
            placeholder="1GD-..."
          />
          <BaseInput
            v-model="form.vehicle.chassisNumber"
            label="ເລກຖັງ (Chassis No.)"
            placeholder="MRO..."
          />
          <BaseNumberInput
            v-model="form.vehicle.engineCapacity"
            label="ຄວາມຈຸກະບອກສູບ (cc)"
            placeholder="2800"
            :error="errors.engineCapacity"
          />
          <BaseInput v-model="form.vehicle.color" label="ສີລົດ" placeholder="ຂາວ" />
          <BaseSelect
            v-model="form.vehicle.usageType"
            label="ລັກສະນະການນຳໃຊ້"
            :options="USAGE_TYPES"
          />
        </div>
      </div>

      <!-- STEP 2: ເລືອກບໍລິສັດປະກັນ ແລະ ແຜນ (Insurer & Product) -->
      <div v-else-if="currentStep === 2" class="space-y-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-bold">3. ເລືອກບໍລິສັດປະກັນໄພ ແລະ ແຜນ</h2>
            <p class="mt-0.5 text-xs text-muted">
              ເລືອກບໍລິສັດຄູ່ຄ້າ ແລະ ແຜນປະກັນໄພທີ່ລູກຄ້າເລືອກ.
            </p>
          </div>
          <!-- ຕົວກອງບໍລິສັດປະກັນ -->
          <BaseSelect
            v-model="companyFilter"
            label=""
            :options="companyFilterOptions"
            class="w-64"
          />
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            type="button"
            class="relative rounded-xl border p-4 text-left transition-all"
            :class="
              form.productId === product.id
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                : 'border-line bg-surface hover:border-primary'
            "
            :aria-pressed="form.productId === product.id"
            @click="selectProduct(product)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <span
                  class="inline-block rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary-text"
                >
                  {{ product.companyCode }}
                </span>
                <p class="mt-1 text-sm font-bold">{{ product.name }}</p>
                <p class="mt-0.5 text-xs text-muted">{{ product.description }}</p>
                <div v-if="product.sumInsured" class="mt-2 text-xs text-muted">
                  ທຶນປະກັນ:
                  <span class="font-semibold text-primary-text">{{
                    format.currency(product.sumInsured)
                  }}</span>
                </div>
              </div>
              <BaseIcon
                :name="form.productId === product.id ? 'check_circle' : 'radio_button_unchecked'"
                :class="form.productId === product.id ? 'text-primary-text' : 'text-muted'"
              />
            </div>
            <p class="mt-3 text-lg font-bold tabular-nums text-primary-text">
              {{ format.currency(product.basePremium) }}
            </p>
          </button>
        </div>
        <p v-if="errors.productId" class="text-xs font-bold text-danger" role="alert">
          {{ errors.productId }}
        </p>

        <!-- ຂໍ້ມູນເລກກົມມະທັນຕົວຈິງ ແລະ ວັນທີຄຸ້ມຄອງ -->
        <div class="mt-4 rounded-xl border border-line bg-surface-muted p-4 space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
            ຂໍ້ມູນສັນຍາ ແລະ ວັນທີຄຸ້ມຄອງ
          </h3>
          <div class="grid gap-4 sm:grid-cols-3">
            <BaseInput
              v-model="form.insurerPolicyNumber"
              label="ເລກກົມມະທັນຕົວຈິງຈາກບໍລິສັດ (Insurer Policy No.)"
              placeholder="ເຊັ່ນ: DHP-2026-POL-00123"
            />
            <BaseInput v-model="form.startDate" type="date" label="ວັນທີເລີ່ມຄຸ້ມຄອງ" required />
            <BaseInput v-model="form.endDate" type="date" label="ວັນທີໝົດອາຍຸ" required />
          </div>
        </div>
      </div>

      <!-- STEP 3: ສະຫຼຸບ ແລະ ຄຳນວນຄ່ານາຍໜ້າ Broker & Agent -->
      <div v-else-if="currentStep === 3" class="space-y-5">
        <div>
          <h2 class="text-lg font-bold">4. ສະຫຼຸບ ແລະ ຄຳນວນເບ້ຍ-ຄ່ານາຍໜ້າ (Financials)</h2>
          <p class="mt-0.5 text-xs text-muted">
            ກວດສອບການຄຳນວນເບ້ຍປະກັນ, ສ່ວນຫຼຸດ, ຄ່ານາຍໜ້າ Broker ແລະ ຄ່ານາຍໜ້າຕົວແທນ.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-line p-4">
            <p class="text-xs text-muted">ຜູ້ເອົາປະກັນ</p>
            <p class="mt-1 text-sm font-bold">{{ customerDisplayName }}</p>
            <p class="text-xs text-muted">{{ format.phone(form.customer.phone) }}</p>
          </div>
          <div class="rounded-xl border border-line p-4">
            <p class="text-xs text-muted">ລົດທີ່ຄຸ້ມຄອງ</p>
            <p class="mt-1 text-sm font-bold">{{ form.vehicle.make }} {{ form.vehicle.model }}</p>
            <p class="text-xs text-muted">
              {{ form.vehicle.plateNumber }} ({{ form.vehicle.plateProvince || 'ລາວ' }})
            </p>
          </div>
        </div>

        <!-- ປັບອັດຕາຄອມມິດຊັ່ນ ແລະ ສ່ວນຫຼຸດ -->
        <div class="grid gap-4 sm:grid-cols-3 rounded-xl border border-line bg-surface-muted p-4">
          <BaseNumberInput
            v-model.number="form.discountPercent"
            label="ສ່ວນຫຼຸດໃຫ້ລູກຄ້າ (%)"
            min="0"
            max="100"
            suffix="%"
            allow-decimal
            :error="errors.discountPercent"
          />
          <BaseNumberInput
            v-model.number="form.brokerCommissionRate"
            label="ຄອມມິດຊັ່ນ Broker ຈາກບໍລິສັດ (%)"
            min="0"
            max="100"
            suffix="%"
            allow-decimal
          />
          <BaseNumberInput
            v-model.number="form.agentCommissionRate"
            label="ຄອມມິດຊັ່ນຈ່າຍຕົວແທນ (%)"
            min="0"
            max="100"
            suffix="%"
            allow-decimal
          />
        </div>

        <!-- ຕາຕະລາງແຍກການເງິນລະອຽດ -->
        <div class="grid gap-4 md:grid-cols-2">
          <!-- ຝັ່ງລູກຄ້າ -->
          <div class="space-y-3 rounded-xl border border-line p-4 text-sm">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              ຍອດເບ້ຍສຳລັບລູກຄ້າ (Client Billing)
            </h3>
            <div class="flex justify-between">
              <span class="text-muted">ເບ້ຍພື້ນຖານ:</span>
              <span class="font-bold tabular-nums">{{ format.currency(premium.basePremium) }}</span>
            </div>
            <div class="flex justify-between text-danger">
              <span>ສ່ວນຫຼຸດ ({{ form.discountPercent }}%):</span>
              <span class="font-bold tabular-nums"
                >-{{ format.currency(premium.discountAmount) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-muted">ອາກອນ (VAT 7%):</span>
              <span class="font-bold tabular-nums">{{ format.currency(premium.vatAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">ຄ່າທະບຽນ:</span>
              <span class="font-bold tabular-nums">{{
                format.currency(premium.registrationFee)
              }}</span>
            </div>
            <div class="flex justify-between border-t border-line pt-2 text-base font-bold">
              <span>ຍອດລູກຄ້າຕ້ອງຊຳລະ:</span>
              <span class="text-primary-text tabular-nums">{{
                format.currency(premium.totalPremium)
              }}</span>
            </div>
          </div>

          <!-- ຝັ່ງ Broker & Agent -->
          <div class="space-y-3 rounded-xl border border-primary/30 bg-primary/[0.02] p-4 text-sm">
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary-text">
              ລາຍຮັບ Broker & ຕົວແທນ (Broker Splits)
            </h3>
            <div class="flex justify-between">
              <span class="text-muted"
                >Broker Commission ({{ premium.brokerCommissionRate }}%):</span
              >
              <span class="font-bold text-success tabular-nums"
                >+{{ format.currency(premium.brokerCommissionAmount) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-muted">ນຳສົ່ງບໍລິສັດປະກັນ (Net to Insurer):</span>
              <span class="font-bold tabular-nums">{{
                format.currency(premium.netRemittanceToInsurer)
              }}</span>
            </div>
            <div class="flex justify-between border-t border-line pt-2">
              <span class="text-muted">Agent Commission ({{ premium.agentCommissionRate }}%):</span>
              <span class="font-bold text-warning tabular-nums">{{
                format.currency(premium.agentCommissionAmount)
              }}</span>
            </div>
            <div class="flex justify-between text-xs text-muted">
              <span>ຫັກພາສີ ນະ ທີ່ຈ່າຍຕົວແທນ (5% WHT):</span>
              <span class="tabular-nums">-{{ format.currency(premium.agentWhtAmount) }}</span>
            </div>
            <div class="flex justify-between text-xs font-bold">
              <span>ຈ່າຍຕົວແທນສຸດທິ:</span>
              <span class="tabular-nums text-warning">{{
                format.currency(premium.agentNetPayout)
              }}</span>
            </div>
            <div
              class="flex justify-between border-t border-primary/20 pt-2 font-bold text-primary-text"
            >
              <span>ກຳໄລສ່ວນຕ່າງ Broker (Net Margin):</span>
              <span class="tabular-nums">+{{ format.currency(premium.brokerNetMargin) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: ຊຳລະເງິນ ແລະ ອັບໂຫຼດເອກະສານ -->
      <div v-else-if="currentStep === 4" class="space-y-4">
        <div>
          <h2 class="text-lg font-bold">5. ວິທີການຊຳລະເງິນ ແລະ ເອກະສານ</h2>
          <p class="mt-0.5 text-xs text-muted">
            ເລືອກຊ່ອງທາງການຊຳລະ ແລະ ອັບໂຫຼດເອກະສານກົມມະທັນຕົວຈິງ.
          </p>
        </div>

        <div class="rounded-xl border border-line bg-surface-muted p-4">
          <p class="text-xs text-muted">ຍອດທີ່ລູກຄ້າຕ້ອງຊຳລະ</p>
          <p class="mt-1 text-3xl font-bold tabular-nums text-primary-text">
            {{ format.currency(premium.totalPremium) }}
          </p>
        </div>

        <div class="space-y-2">
          <BaseRadio
            v-for="method in PAYMENT_METHODS"
            :key="method.value"
            v-model="form.paymentMethod"
            :value="method.value"
            name="payment-method"
            :label="method.label"
          />
        </div>

        <FileUpload
          v-model="policyDocFile"
          label="ອັບໂຫຼດໄຟລ໌ກົມມະທັນຕົ້ນສະບັບ ຫຼື ໃບຮັບເງິນ (PDF/Image)"
          hint="ເອກະສານທີ່ໄດ້ຮັບຈາກບໍລິສັດປະກັນໄພ"
          auto-upload
          @uploaded="form.policyDocumentUrl = $event?.url || ''"
        />
      </div>

      <!-- STEP 5: ສຳເລັດການອອກປະກັນໄພ -->
      <div v-else class="space-y-4 text-center py-6">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
        >
          <BaseIcon name="check_circle" size="2xl" />
        </div>
        <div>
          <h2 class="text-2xl font-bold">ອອກປະກັນໄພສຳເລັດ</h2>
          <p class="mt-1 text-sm text-muted">
            ບັນທຶກກົມມະທັນ ແລະ ຄຳນວນຄ່ານາຍໜ້າເຂົ້າລະບົບຮຽບຮ້ອຍແລ້ວ.
          </p>
        </div>
        <div
          class="mx-auto max-w-md rounded-xl border border-line bg-surface-muted p-4 text-left space-y-2 text-sm"
        >
          <div class="flex justify-between">
            <span class="text-muted">ເລກອ້າງອີງ Broker:</span>
            <span class="font-bold">{{ createdPolicy?.policyNumber }}</span>
          </div>
          <div v-if="createdPolicy?.insurerPolicyNumber" class="flex justify-between">
            <span class="text-muted">ເລກກົມມະທັນບໍລິສັດ:</span>
            <span class="font-bold text-primary-text">{{ createdPolicy.insurerPolicyNumber }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">ບໍລິສັດປະກັນ:</span>
            <span class="font-bold">{{ createdPolicy?.companyName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">ເບ້ຍປະກັນລວມ:</span>
            <span class="font-bold tabular-nums">{{
              format.currency(createdPolicy?.totalPremium)
            }}</span>
          </div>
          <div class="flex justify-between border-t border-line pt-2">
            <span class="text-muted">ສະຖານະ:</span>
            <StatusBadge :status="createdPolicy?.status || 'pending'" />
          </div>
        </div>
        <div class="flex flex-col justify-center gap-2 sm:flex-row pt-4">
          <BaseButton variant="secondary" icon="download" @click="toast.info('ກຳລັງກະກຽມດາວໂຫຼດ')">
            ດາວໂຫຼດເອກະສານ
          </BaseButton>
          <BaseButton icon="visibility" @click="navigateTo(`/policies/${createdPolicy?.id}`)">
            ເບິ່ງລາຍລະອຽດກົມມະທັນ
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <div
      v-if="currentStep < 5"
      class="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] -mx-4 z-30 flex items-center justify-between gap-3 border-t border-line bg-surface/95 p-4 backdrop-blur md:static md:bottom-auto md:mx-0 md:rounded-xl md:border md:p-4"
    >
      <BaseButton v-if="currentStep > 0" variant="secondary" icon="arrow_back" @click="prevStep">
        ກັບຄືນ
      </BaseButton>
      <span v-else class="text-sm text-muted">ຂັ້ນຕອນ {{ currentStep + 1 }} / 5</span>

      <BaseButton v-if="currentStep < 4" icon="arrow_forward" @click="nextStep"> ຕໍ່ໄປ </BaseButton>
      <BaseButton v-else icon="check" :loading="submitting" @click="submit">
        ຢືນຢັນ ແລະ ບັນທຶກກົມມະທັນ
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { navigateTo, useRoute } from '#app'
import { onBeforeRouteLeave } from 'vue-router'
import {
  CUSTOMER_TYPES,
  GENDERS,
  LAO_PROVINCES,
  PAYMENT_METHODS,
  USAGE_TYPES,
} from '~/utils/constants'
import { calculatePremium } from '~/utils/premium'
import { usePolicies } from '~/composables/api/usePolicies'
import { useQuotations } from '~/composables/api/useQuotations'
import { useCustomers } from '~/composables/api/useCustomers'
import { buildPolicyPayload, customerNameParts } from '~/utils/policy'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/utils/format'
import { useCompanies } from '~/composables/api/useCompanies'
import { useProducts } from '~/composables/api/useProducts'
import { useAgentOptions } from '~/composables/api/useAgentOptions'
import {
  maxValue,
  minValue,
  numeric,
  phone as phoneValidator,
  required,
  validate,
} from '~/utils/validators'

const DRAFT_KEY = 'saiyfon-broker-policy-draft'

const route = useRoute()
const format = useFormat()
const toast = useToast()
const auth = useAuthStore()
const { confirm } = useConfirm()
const { create } = usePolicies({ immediate: false })
const { getById: getQuotation } = useQuotations({ immediate: false })
const { getById: getCustomer } = useCustomers({ immediate: false })
const { list: fetchCompanies } = useCompanies()
const { list: fetchProducts } = useProducts()
const { items: agentsList, refresh: fetchAgents } = useAgentOptions({ immediate: false })

const steps = [
  { label: 'ຜູ້ເອົາປະກັນ', description: 'ຂໍ້ມູນລູກຄ້າ & KYC' },
  { label: 'ຂໍ້ມູນລົດ/ຊັບສິນ', description: 'ລາຍລະອຽດພາຫະນະ' },
  { label: 'ເລືອກແຜນ & ບໍລິສັດ', description: 'ບໍລິສັດຄູ່ຄ້າ' },
  { label: 'ຄອມມິດຊັ່ນ & ເບ້ຍ', description: 'Broker & Agent' },
  { label: 'ຊຳລະ & ເອກະສານ', description: 'ອອກກົມມະທັນ' },
]

const currentStep = ref(0)
const submitting = ref(false)
const completed = ref(false)
const createdPolicy = ref(null)
const policyDocFile = ref(null)
const companyFilter = ref('ALL')
const companiesList = ref([])
const productsList = ref([])

const companyFilterOptions = computed(() => [
  { value: 'ALL', label: 'ທຸກບໍລິສັດປະກັນໄພ' },
  ...companiesList.value.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` })),
])

const agentOptions = computed(() =>
  agentsList.value.map((a) => {
    const code = a.agentCode || a.code || ''
    const name = a.name || a.agentName || 'ຕົວແທນ'
    return {
      value: a.id,
      label: code ? `${code} - ${name}` : name,
    }
  }),
)

const form = reactive({
  customerType: 'individual',
  customer: {
    firstName: '',
    lastName: '',
    companyName: '',
    taxId: '',
    contactPerson: '',
    phone: '',
    dob: '',
    gender: 'male',
    occupation: '',
    idCardNumber: '',
    address: '',
    idCard: null,
    idCardUrl: '',
  },
  beneficiary: {
    name: '',
    relation: '',
  },
  customerId: null,
  vehicle: {
    make: '',
    model: '',
    year: '',
    plateNumber: '',
    plateProvince: 'Vientiane Capital',
    engineNumber: '',
    chassisNumber: '',
    engineCapacity: '',
    seats: '',
    color: '',
    usageType: 'private',
  },
  productId: null,
  insurerPolicyNumber: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  agentId: null,
  quotationId: null,
  discountPercent: 0,
  brokerCommissionRate: 15,
  agentCommissionRate: 5,
  paymentMethod: 'bcel',
  policyDocumentUrl: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  companyName: '',
  taxId: '',
  contactPerson: '',
  phone: '',
  address: '',
  make: '',
  model: '',
  plateNumber: '',
  year: '',
  engineCapacity: '',
  productId: '',
  discountPercent: '',
  paymentMethod: '',
})

const customerDisplayName = computed(() => {
  if (form.customerType === 'corporate') {
    return form.customer.companyName || 'ບໍລິສັດ'
  }
  return `${form.customer.firstName} ${form.customer.lastName}`.trim() || 'ລູກຄ້າ'
})

const filteredProducts = computed(() => {
  if (companyFilter.value === 'ALL') return productsList.value
  return productsList.value.filter((p) => p.companyId === Number(companyFilter.value))
})

const selectedProduct = computed(() =>
  productsList.value.find((product) => product.id === Number(form.productId)),
)

const premium = computed(() =>
  calculatePremium({
    basePremium: selectedProduct.value?.basePremium || 0,
    discountPercent: form.discountPercent,
    brokerCommissionRate: form.brokerCommissionRate,
    agentCommissionRate: form.agentCommissionRate,
  }),
)

const selectProduct = (product) => {
  form.productId = product.id
  if (product.brokerCommissionRate) {
    form.brokerCommissionRate = product.brokerCommissionRate
  }
  errors.productId = ''
}

const clearErrors = (keys) => {
  keys.forEach((key) => {
    errors[key] = ''
  })
}

const validateStep = () => {
  if (currentStep.value === 0) {
    if (form.customerType === 'corporate') {
      clearErrors(['companyName', 'taxId', 'contactPerson', 'phone', 'address'])
      errors.companyName = required(form.customer.companyName)
      errors.taxId = required(form.customer.taxId)
      errors.contactPerson = required(form.customer.contactPerson)
      errors.phone = validate(form.customer.phone, [required, phoneValidator])
      errors.address = required(form.customer.address)
      return (
        !errors.companyName &&
        !errors.taxId &&
        !errors.contactPerson &&
        !errors.phone &&
        !errors.address
      )
    } else {
      clearErrors(['firstName', 'lastName', 'phone', 'address'])
      errors.firstName = required(form.customer.firstName)
      errors.lastName = required(form.customer.lastName)
      errors.phone = validate(form.customer.phone, [required, phoneValidator])
      errors.address = required(form.customer.address)
      return !errors.firstName && !errors.lastName && !errors.phone && !errors.address
    }
  }

  if (currentStep.value === 1) {
    clearErrors(['make', 'model', 'plateNumber', 'year', 'engineCapacity'])
    errors.make = required(form.vehicle.make)
    errors.model = required(form.vehicle.model)
    errors.plateNumber = required(form.vehicle.plateNumber)
    errors.year = form.vehicle.year
      ? validate(form.vehicle.year, [numeric, minValue(1900), maxValue(2100)])
      : ''
    errors.engineCapacity = form.vehicle.engineCapacity ? numeric(form.vehicle.engineCapacity) : ''
    return (
      !errors.make && !errors.model && !errors.plateNumber && !errors.year && !errors.engineCapacity
    )
  }

  if (currentStep.value === 2) {
    errors.productId = form.productId ? '' : 'ກະລຸນາເລືອກແຜນປະກັນໄພ'
    return !errors.productId
  }

  if (currentStep.value === 3) {
    errors.discountPercent = validate(form.discountPercent, [numeric, minValue(0), maxValue(100)])
    return !errors.discountPercent
  }

  if (currentStep.value === 4) {
    errors.paymentMethod = form.paymentMethod ? '' : 'ກະລຸນາເລືອກວິທີຊຳລະ'
    return !errors.paymentMethod
  }

  return true
}

const nextStep = () => {
  if (!validateStep()) return
  if (currentStep.value < 4) currentStep.value += 1
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}

const submit = async () => {
  if (!validateStep() || submitting.value) return
  submitting.value = true
  try {
    const company = companies.find((item) => item.id === selectedProduct.value?.companyId)
    const chosenAgent = agents.find((item) => item.id === Number(form.agentId))
    const payload = buildPolicyPayload({
      form: {
        ...form,
        premium: premium.value,
        agentName: chosenAgent?.name || null,
      },
      auth,
      product: selectedProduct.value,
      company,
      startDate: form.startDate,
    })
    createdPolicy.value = await create(payload)
    completed.value = true
    currentStep.value = 5
    clearDraft()
    toast.success('ອອກກົມມະທັນສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດສ້າງປະກັນໄພໄດ້')
  } finally {
    submitting.value = false
  }
}

const saveDraft = () => {
  if (!import.meta.client || completed.value) return
  try {
    const draft = {
      ...form,
      customer: { ...form.customer, idCard: null, idCardUrl: '' },
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Draft is best effort.
  }
}

const restoreDraft = () => {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const draft = JSON.parse(raw)
    Object.assign(form, draft)
    form.customer.idCard = null
    form.customer.idCardUrl = ''
  } catch {
    // Ignore malformed drafts.
  }
}

const applyQuotation = async (id) => {
  const quotation = await getQuotation(id)
  if (!quotation) return

  form.customerType = quotation.customerType || 'individual'
  if (form.customerType === 'corporate') {
    form.customer.companyName = quotation.customerName || ''
    form.customer.taxId = quotation.taxId || ''
  } else {
    const parts = customerNameParts(quotation.customerName)
    if (parts.firstName) form.customer.firstName = parts.firstName
    if (parts.lastName) form.customer.lastName = parts.lastName
  }

  if (quotation.customerPhone) form.customer.phone = quotation.customerPhone
  form.quotationId = quotation.id

  if (quotation.vehicle) {
    Object.assign(form.vehicle, quotation.vehicle)
  }

  // ຊອກຫາ product ທີ່ກົງກັບ quotation
  const match =
    productsList.value.find((p) => p.name === quotation.productName) ||
    productsList.value.find((p) => p.companyId === quotation.companyId) ||
    productsList.value.find((p) => p.type === quotation.productType)

  if (match) {
    selectProduct(match)
  }
  toast.success('ດຶງຂໍ້ມູນຈາກໃບສະເໜີລາຄາແລ້ວ')
}

const applyCustomer = async (id) => {
  const customer = await getCustomer(id)
  if (!customer) return
  form.customerId = customer.id ?? null
  form.customer.firstName = customer.firstName || ''
  form.customer.lastName = customer.lastName || ''
  form.customer.phone = customer.phone || ''
  form.customer.dob = customer.dob || ''
  form.customer.gender = customer.gender || 'male'
  form.customer.occupation = customer.occupation || ''
  form.customer.address = customer.address || ''
  toast.success('ດຶງຂໍ້ມູນລູກຄ້າແລ້ວ')
}

const prefillFromRoute = async () => {
  const quotationId = Number(route.query.quotationId)
  if (Number.isInteger(quotationId) && quotationId > 0) {
    try {
      await applyQuotation(quotationId)
    } catch {
      toast.warning('ບໍ່ສາມາດດຶງຂໍ້ມູນໃບສະເໜີລາຄາໄດ້')
    }
  }

  const customerId = Number(route.query.customerId)
  if (Number.isInteger(customerId) && customerId > 0) {
    try {
      await applyCustomer(customerId)
    } catch {
      toast.warning('ບໍ່ສາມາດດຶງຂໍ້ມູນລູກຄ້າໄດ້')
    }
  }
}

const clearDraft = () => {
  if (!import.meta.client) return
  localStorage.removeItem(DRAFT_KEY)
}

onMounted(async () => {
  restoreDraft()
  try {
    const [cData, pData] = await Promise.all([fetchCompanies(), fetchProducts()])
    companiesList.value = cData || []
    productsList.value = pData || []
    await fetchAgents()
    if (!form.agentId && agentsList.value.length > 0) {
      form.agentId = agentsList.value[0].id
    }
  } catch (err) {
    console.error('Error fetching master data:', err)
  }
  await prefillFromRoute()
})
onBeforeUnmount(saveDraft)

onBeforeRouteLeave(async () => {
  if (completed.value) return true
  return confirm({
    title: 'ອອກຈາກການເຮັດປະກັນໄພ?',
    message: 'ຂໍ້ມູນທີ່ປ້ອນໄວ້ຈະຖືກບັນທຶກເປັນຮ່າງ. ຕ້ອງການອອກບໍ່?',
    confirmLabel: 'ອອກ',
  })
})
</script>
