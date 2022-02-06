<template>
    <BackGroundVue>
        <CTableVue :rows="list" :col-config="colConfig">
            <template #row="{ row, cols }">
                <CRow
                    :row="row"
                    :col-config="cols"
                    class="hover:bg-purple-900 even:bg-slate-800"
                    @click="onClickRow"
                ></CRow>
            </template>
        </CTableVue>
    </BackGroundVue>
</template>

<script lang="ts" setup>
import BackGroundVue from './BackGround.vue';
import CTableVue from '../components/Table/CTable.vue';
import CRow from '../components/Table/CRow.vue';

const lot = [...Array(10)].map(item => ({ a: 4, b: 5, c: 6 }))
const list = [{ a: 1, b: 2, c: 3 }, ...lot];
const colConfig = [{ prop: 'a', header: 'a' }, { prop: 'b', header: 'b' }, { prop: 'c', header: 'c' }]
function onClickRow(event: MouseEvent) {
    console.log(event)
}
</script>

<style>
</style>