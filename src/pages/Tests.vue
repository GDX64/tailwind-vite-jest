<template>
    <BackGroundVue>
        <CTableVue :rows="list" :col-config="colConfig">
            <template #row="{ row, cols }">
                <CRow
                    :row="row"
                    :col-config="cols"
                    class="hover:bg-purple-900 even:bg-slate-800"
                    :draggable="true"
                    :ondragstart="() => dragStart(row)"
                    :ondragover="(event: DragEvent) => dragOver(event, row)"
                    :ondrop="(event: DragEvent) => drop(event, row)"
                ></CRow>
            </template>
        </CTableVue>
    </BackGroundVue>
</template>

<script lang="ts" setup>
import BackGroundVue from './BackGround.vue';
import CTableVue from '../components/Table/CTable.vue';
import CRow from '../components/Table/CRow.vue';
import { ref } from 'vue';

const lot = [...Array(10)].map(item => ({ a: 4, b: 5, c: 6 }))
const list = ref([{ a: 1, b: 2, c: 3 }, ...lot]);
const colConfig = [{ prop: 'a', header: 'a' }, { prop: 'b', header: 'b' }, { prop: 'c', header: 'c' }]
const dragged = ref<(typeof lot)[0]>()
function dragStart(row: any) {
    console.log(row)
    dragged.value = row
}
function dragOver(event: DragEvent, row: any) {
    event.preventDefault()
    if (dragged.value) {
        list.value = swap(row, dragged.value, list.value)
    }

}
function drop(event: DragEvent, row: any) {
    event.preventDefault()
    if (dragged.value) {
        list.value = swap(row, dragged.value, list.value)
    }
}
function swap<T>(el1: T, el2: T, arr: T[]) {
    const i1 = list.value.findIndex(el => el === el1)
    const i2 = list.value.findIndex(el => el === el2)
    const arrCopy = [...arr]
    if (i2 === -1 || i1 === -1) {
        return arrCopy
    }
    arrCopy[i2] = el1
    arrCopy[i1] = el2
    return arrCopy

}
</script>

<style>
</style>