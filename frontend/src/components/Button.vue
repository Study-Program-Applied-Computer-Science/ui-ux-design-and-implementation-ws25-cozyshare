<template>
  <button
    :style="{ background: color }"
    class="btn"
    @click="$emit(eventName)"
  >
    {{ text }}
  </button>
</template>

<script>
export default {
  name: "Button",

  props: {
    text: String,
    color: String,
    eventName: String,
  },
};
</script>

<style scoped>
.btn {
  display: inline-block;
  width: 100%;
  padding: 10px 15px;
  margin: 8px 0;
  color: white;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
}

.btn:hover {
  opacity: 0.9;
}
</style>
