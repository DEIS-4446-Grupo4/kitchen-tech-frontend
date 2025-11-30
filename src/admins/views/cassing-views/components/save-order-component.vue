<template>
  <div class="modal" v-if="isVisible">
    <div v-if="loading" class="loader-overlay">
      <div class="loader"></div>
    </div>
    <div class="modal-content">
      <div class="modal-header">
        <p class="title">{{ isUpdate ? 'Update Order' : 'Save Order' }}</p>
        <button class="close" @click="closeModal()">x</button>
      </div>
      <form @submit.prevent="save">
        <div class="form-inputs">
          <div class="form-group account-name">
            <label for="accountName">Account Name</label>
            <input
                type="text"
                id="accountName"
                v-model="accountName"
                @input="handleAccountNameInput"
                placeholder="Ingrese nombre de la cuenta"
            />
          </div>
          <div class="form-group table-number">
            <label for="tableNumber">Mesa (opcional)</label>
            <input
                type="text"
                id="tableNumber"
                v-model="tableNumber"
                placeholder="Dejar vacío si no hay mesa"
            />
          </div>
        </div>
        <button type="submit" class="save-button">{{ isUpdate ? 'Update Order' : 'Save Order' }}</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: { type: Boolean, default: false },
    restaurantId: { type: String, required: true },
    accountToEdit: { type: Object, default: null }
  },
  data() {
    return {
      accountName: "",
      tableNumber: "",
      manualAccountName: "",
      isUpdate: false,
      existingAccountData: null,
      loading: true,
    };
  },
  watch: {
    isVisible(newVal) {
      if (newVal) this.initializeFields();
    },
    accountToEdit: {
      immediate: true,
      handler(newVal) {
        if (newVal && this.isVisible) {
          this.prepareUpdate(newVal);
        } else if (newVal && !this.isVisible) {
          this.existingAccountData = newVal;
        }
      }
    },
    tableNumber(newVal) {
      if (!this.isUpdate) {
        const prefix = newVal ? `Mesa: ${newVal}` : "";
        this.accountName = prefix
            ? `${prefix} ${this.manualAccountName}`.trim()
            : this.manualAccountName;
      }
    }
  },
  methods: {
    initializeFields() {
      // preferir la cuenta existente si llegó por prop
      if (this.existingAccountData) {
        this.prepareUpdate(this.existingAccountData);
        return;
      }
      // resetear campos para creación
      this.tableNumber = "";
      this.accountName = "";
      this.manualAccountName = "";
      this.isUpdate = false;
      this.existingAccountData = null;
    },

    prepareUpdate(account) {
      this.isUpdate = true;
      this.existingAccountData = account;
      // table puede venir en account.table (obj) o tableId (dto)
      const tableNum = account.table?.tableNumber || account.tableNumber || account.tableId || "";
      this.tableNumber = tableNum;

      const accName = account.accountName || "";
      if (tableNum) {
        const prefix = `Mesa: ${tableNum}`;
        if (accName.startsWith(prefix)) {
          this.manualAccountName = accName.slice(prefix.length).trim();
        } else {
          this.manualAccountName = accName;
        }
        this.accountName = `${prefix} ${this.manualAccountName}`.trim();
      } else {
        this.manualAccountName = accName;
        this.accountName = accName;
      }
    },

    handleAccountNameInput(event) {
      if (!this.isUpdate) {
        const value = event.target.value || "";
        if (this.tableNumber) {
          const prefix = `Mesa: ${this.tableNumber}`;
          this.manualAccountName = value.startsWith(prefix)
              ? value.slice(prefix.length).trimStart()
              : value;
          this.accountName = `${prefix} ${this.manualAccountName}`.trim();
        } else {
          this.manualAccountName = value;
          this.accountName = value;
        }
      }
    },

    save() {
      if (!this.accountName || !this.accountName.trim()) {
        alert("Ingrese un nombre de cuenta.");
        return;
      }

      const table = this.tableNumber ? this.tableNumber : null;

      const payload = {
        id: this.existingAccountData?.id || null,
        accountName: this.accountName,
        tableNumber: table
      };
      this.$emit("save-sale", payload);
      this.closeModal();
    },

    closeModal() {
      this.accountName = "";
      this.tableNumber = "";
      this.manualAccountName = "";
      this.isUpdate = false;
      this.existingAccountData = null;
      this.$emit("close-modal");
    }
  }
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background-color: #F6F5FA;
  color: #31304A;
  padding: 30px;
  border-radius: 5px;
  width: 550px;
  max-width: 100%;
}
.modal-header{
  display: flex;
  justify-content: space-between;
}
.close{
  background-color: transparent;
  border: none;
  color: #31304A;
  font-weight: 800;
  padding: 0;
  margin: 0;
  align-self: flex-start;
}

.title{
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 15px 0;
}
.form-inputs{
  display: flex;
}
.form-group {
  margin-bottom: 15px;
}
.account-name{
  width: 410px;
}
.table-number{
  margin-left: 24px;
  max-width: 100px;
}

label{
  font-size: 0.8rem;
  margin-left: 5px;
}
input {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #D3D2E5;
}
.save-button {
  width: 100%;
  padding: 10px;
  background-color: #31304A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.save-button:active{
  background-color: #201E35;
}
</style>