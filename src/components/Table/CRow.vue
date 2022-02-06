<template>
    <tr>
        <td v-for="col in colConfig">
            <slot name="cell" :col="col" :row="row">
                <div class="flex justify-center">{{ row[col.prop] }}</div>
            </slot>
        </td>
    </tr>
</template>

<script lang="ts" setup>
export interface ColConfig {
    prop: string;
    header: string;
}
defineProps<{ row: any, colConfig: ColConfig[] }>()

</script>

