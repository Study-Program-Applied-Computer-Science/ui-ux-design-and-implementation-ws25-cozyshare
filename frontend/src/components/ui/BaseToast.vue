<template>
  <transition name="toast-fade">
    <div v-if="show" class="toast">
      <span class="toast-text">{{ message }}</span>

      <button v-if="actionText" class="toast-action" @click="$emit('action')">
        {{ actionText }}
      </button>

      <button class="toast-close" @click="$emit('close')" title="Close">✕</button>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BaseToast',
  props: {
    show: { type: Boolean, default: false },
    message: { type: String, default: '' },
    actionText: { type: String, default: '' },
  },
  emits: ['action', 'close'],
}
</script>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 9999;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;
  border-radius: 999px;

  background: rgba(15, 23, 42, 0.92);
  color: #fff;

  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.toast-text {
  font-size: 0.9rem;
  white-space: nowrap;
}

.toast-action {
  border: none;
  border-radius: 999px;
  padding: 6px 10px;
  cursor: pointer;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.toast-close {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 0.95rem;
}

/* transition */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.18s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
