<template>
  <span :class="['badge', type]">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'BaseBadge',
  props: {
    type: {
      type: String,
      default: 'default', // available: default, success, warning, danger, info
    },
  },
}
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 999px;
  font-weight: 600;
  line-height: 1;
}

/* COLORS (match CozyShare theme) */
.badge.default {
  background: var(--primary-light);
  color: var(--navy);
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.badge.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.badge.info {
  background: #dbeafe;
  color: #1e3a8a;
}
</style>
