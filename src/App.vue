<script setup lang="ts">
import type { ElInput, ElTable, TableColumnCtx } from 'element-plus'
import { reactive, computed, ref, nextTick } from 'vue'
import initialData from './initialData.json'

interface CostItem {
  name: string
  price: number
  costBy: string
  payBy: string
}

const state = reactive({
  inputValue: '',
  inputVisible: false,
  members: ['Kellly', 'Jin', 'Dong'],
  costItems: initialData as CostItem[],
  selectedMembers: [] as string[],
  needConfirm: true,
})

const InputRef = ref<InstanceType<typeof ElInput>>()
const CostItemTableRef = ref<InstanceType<typeof ElTable>>()

const sum = (array: any[]) =>
  array.reduce((total, curr) => {
    const value = Number(curr)
    if (!Number.isNaN(value)) {
      return total + value
    } else {
      return total
    }
  }, 0)

const removeCostItem = (item: CostItem) => {
  const index = state.costItems.indexOf(item)
  state.costItems.splice(index, 1)
}
const removeAllCostItem = () => {
  state.costItems.splice(0, state.costItems.length)
}

const calculatedMembers = computed(() => {
  const members = state.members
    .map((member) => ({
      member,
      cost:
        sum(state.costItems.filter((cost) => cost.costBy == member).map((cost) => cost.price)) +
        sum(state.costItems.filter((cost) => cost.costBy == 'All').map((cost) => cost.price)) / state.members.length,
      pay: sum(state.costItems.filter((cost) => cost.payBy == member).map((cost) => cost.price)),
      overPay: 0,
      payTo: [] as { member: string; amount: number }[],
      _paid: 0,
      _receive: 0,
    }))
    .sort((memberA, memberB) => memberA.pay - memberB.pay)

  members.forEach((member) => {
    member.overPay = member.pay - member.cost
  })
  members.forEach((member, index) => {
    if (member.overPay < 0) {
      for (const nextMember of members.slice(index + 1)) {
        if (nextMember._receive < nextMember.overPay && nextMember.overPay > 0) {
          const amount = Math.min(-member.overPay, nextMember.overPay)
          member._paid += amount
          member.payTo.push({ member: nextMember.member, amount })
          nextMember._receive += amount

          if (member._paid == -member.overPay) {
            break
          }
        }
      }
    }
  })

  return members
})

interface SummaryMethodProps<T> {
  columns: TableColumnCtx<T>[]
  data: T[]
}

const getSummaries = (keys: string[]) => {
  return (param: SummaryMethodProps<CostItem>) => {
    const { columns, data } = param
    const sums: string[] = []
    columns.forEach((column, index) => {
      console.log(column)
      if (index === 0) {
        sums[index] = 'Total Cost'
      } else if (keys.includes(column.property)) {
        const values = data.map((item) => Number(item[column.property as keyof CostItem]))
        sums[index] = formatCurrency(sum(values))
      }
    })

    return sums
  }
}

const handleRemoveMember = (member: string) => {
  state.members = state.members.filter((m) => m != member)
  state.selectedMembers = state.selectedMembers.filter((m) => m != member)
}

const showInput = () => {
  state.inputVisible = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleInputConfirm = () => {
  if (state.inputValue == 'All') {
    alert('Can not be `All`')
    return
  }
  if (state.members.includes(state.inputValue)) {
    alert('Duplicated')
    return
  }
  if (state.inputValue) {
    state.members.push(state.inputValue)
  }
  state.inputVisible = false
  state.inputValue = ''
}

const formatCurrency = (value: number) => {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })
  return formatter.format(value)
}

const addCostItem = () => {
  state.costItems.push({
    name: '',
    price: 0,
    costBy: '',
    payBy: '',
  })
  nextTick(() => {
    CostItemTableRef.value?.$el.querySelector('tbody tr:last-child td:first-child input')?.focus()
  })
}
</script>

<template>
  <el-container>
    <el-main>
      <h1 class="text-xl text-center">AA</h1>
      <el-card class="mx-auto mt-8">
        <h2 class="mt-8">Members</h2>
        <!-- <el-row> -->
        <el-tag
          v-for="member in state.members"
          :key="member"
          class="mx-1"
          closable
          :disable-transitions="false"
          @close="handleRemoveMember(member)"
          size="large"
        >
          {{ member }}
        </el-tag>
        <el-input
          v-if="state.inputVisible"
          ref="InputRef"
          v-model="state.inputValue"
          class="ml-1"
          style="width: 160px"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
          clearable
        />
        <el-button v-else class="button-new-tag ml-1" @click="showInput"> + New Member </el-button>
        <!-- </el-row> -->

        <h2 class="mt-8">Cost Items</h2>
        <el-table :data="state.costItems" show-summary :summary-method="getSummaries(['price'])" ref="CostItemTableRef">
          <el-table-column prop="name" label="Name" width="240">
            <template #default="scope">
              <el-input v-model="scope.row.name" />
            </template>
          </el-table-column>
          <el-table-column prop="price" label="Price">
            <template #default="scope">
              <el-input type="number" v-model="scope.row.price" />
            </template>
          </el-table-column>
          <el-table-column prop="costBy" label="Cost By">
            <template #default="scope">
              <el-select v-model="scope.row.costBy" placeholder="Select cost by...">
                <el-option label="All" value="All"></el-option>
                <el-option v-for="member in state.members" :key="member" :label="member" :value="member"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="payBy" label="Pay By">
            <template #default="scope">
              <el-select v-model="scope.row.payBy" placeholder="Select pay by...">
                <el-option v-for="member in state.members" :key="member" :label="member" :value="member"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column>
            <template #header>
              <el-popconfirm
                confirm-button-text="Delete all"
                cancel-button-text="Cancel"
                title="Are you sure to delete all?"
                @confirm="removeAllCostItem"
              >
                <template #reference> <el-button type="danger">Delete All</el-button></template>
              </el-popconfirm>
            </template>
            <template #default="scope">
              <el-icon :size="24" class="cursor-pointer" @click="removeCostItem(scope.row)"><Delete /></el-icon>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex mt-4 justify-center">
          <el-button type="primary" @click="addCostItem"
            ><el-icon class="mr-2"><Plus /></el-icon>Add a cost item</el-button
          >
        </div>

        <h2 class="mt-8">Pay</h2>
        <el-table :data="calculatedMembers" show-summary :summary-method="getSummaries(['cost', 'pay'])">
          <el-table-column prop="member" label="Member"></el-table-column>
          <el-table-column prop="cost" label="Cost">
            <template #default="scope">
              <span>{{ formatCurrency(scope.row.cost) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="pay" label="Pay">
            <template #default="scope">
              <span>{{ formatCurrency(scope.row.pay) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="overPay" label="Over Pay">
            <template #default="scope">
              <span>{{ formatCurrency(Math.max(scope.row.overPay, 0)) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="payTo" label="Pay To">
            <template #default="scope">
              <el-row v-for="payTo in scope.row.payTo" :key="payTo.member">
                {{ payTo.member }}: {{ formatCurrency(payTo.amount) }}
              </el-row>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </el-container>
</template>
