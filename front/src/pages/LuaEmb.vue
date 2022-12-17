<template>
  <div class="" @click="run">Lua</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { LuaFactory } from 'wasmoon';

let fn = () => {};
const f = new LuaFactory();
onMounted(async () => {
  const lua = await f.createEngine();
  // Set a JS function to be a global lua function
  lua.global.set('sum', (x: number, y: number) => x + y);
  // Run a lua string
  // await lua.doString(`
  //   print(sum(10, 10))
  //   function multiply(x, y)
  //       return x * y
  //   end
  //   `);
  await lua.doString(`
    function other(a)
    io.write("hello");
      b = {}
      b['hi'] = 10
      for i=1,10 do
        b[i] = i
      end
      return table.concat(b, "")
    end
    `);
  // Get a global lua function as a JS function
  const other = lua.global.get('other');
  fn = async () => {
    console.log(other());
  };
  console.log(other({ hi: 'there' }));
});

async function run() {
  fn();
}
</script>
