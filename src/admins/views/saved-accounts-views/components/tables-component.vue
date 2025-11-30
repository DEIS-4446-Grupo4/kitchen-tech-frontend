<template>
  <div class="table-card" @click="selectTable">
    <div class="card-header">
      <p class="table-number">Table {{ table.tableNumber }}</p>

      <div class="status-bullet" :class="statusClass"></div>
      <img
            :src="require('/public/assets/images/delete.png')"
            class="delete-button"
            @click.stop="$emit('delete-table', table.id)"
            alt="delete"
        />
    </div>

    <div class="card-body" v-if="table.tableStatus !== 'ToClean'">
      <p class="table-stats">Capacity: {{ table.tableCapacity }}</p>
      <p class="table-stats">Guests: {{ table.tableGuests ?? 0 }}</p>
    </div>

    <!-- Mostrar botón solo si está ToClean -->
    <button
        v-if="table.tableStatus === 'ToClean'"
        class="free-button"
        @click.stop="markAsFree"
    >
      Set Free
    </button>
  </div>
</template>

<script>
export default {
  props: {
    table: Object,
  },

  computed: {
    statusClass() {
      switch (this.table.tableStatus) {
        case "Free":
          return "status-green";
        case "Occupied":
          return "status-red";
        case "ToClean":
          return "status-yellow";
        default:
          return "";
      }
    },
  },

  methods: {
    selectTable() {
      this.$emit("select-table", this.table);
    },
    markAsFree() {
      // Emitimos el evento al padre con el id de la mesa
      this.$emit("update-table-status", { id: this.table.id, status: "Free" });
    },
  },
};
</script>

<style scoped>
.table-card {
  display: flex;
  flex-direction: column;
  background-color: #d3d2e5;
  color: #31304a;
  padding: 10px 20px;
  margin: 10px 10px;
  border-radius: 8px;
  max-width: 200px;
  max-height: 95px;
}
.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: 800;
}
.table-number {
  margin: 10px 0;
}
.delete-button {
  background: transparent;
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  margin: 10px 0 0 0;
  width: 20px;
  height: 20px;
}
.delete-button:active {
  background: radial-gradient(circle, #a6a6b1 100%, transparent 50%);
}
.card-body {
  margin: 5px 0;
}
.table-stats {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  color: #5b5a71;
}

.status-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 18px;
  margin-right: 15px;
  display: inline-block; /* Asegúrate de que el div se comporta como un bloque */
}
.status-green {
  background-color: #59aa64; /* Cambiado a background-color */
}
.status-red {
  background-color: #d34f4d; /* Cambiado a background-color */
}
.status-yellow {
  background-color: #cfa553; /* Cambiado a background-color */
}

.buttons {
  justify-content: center;
  align-items: center;
}
.free-button {
  padding: 10px 10px;
  font-size: 0.7rem;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  background-color: #2f2e3c;
  color: #c3c3c3;
  cursor: pointer;
}
.free-button:hover {
  background-color: #201e35;
}
</style>
