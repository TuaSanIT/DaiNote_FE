<template>
    <div class="transaction-list">
        <h2>Transaction List</h2>

        <!-- Filter Section -->
        <div class="filter-container">
            <div class="filter-group">
                <div class="filter-item">
                    <label for="created-from">Created From:</label>
                    <input type="date" id="created-from" v-model="filterCreatedFrom" :max="maxCreatedFrom" />
                </div>
                <div class="filter-item">
                    <label for="created-to">Created To:</label>
                    <input type="date" id="created-to" v-model="filterCreatedTo" :min="filterCreatedFrom" />
                </div>
                <div class="filter-item">
                    <label for="paid-from">Paid From:</label>
                    <input type="date" id="paid-from" v-model="filterPaidFrom" :max="maxPaidFrom" />
                </div>
                <div class="filter-item">
                    <label for="paid-to">Paid To:</label>
                    <input type="date" id="paid-to" v-model="filterPaidTo" :min="filterPaidFrom" />
                </div>
                <button class="reset-button" @click="resetFilters">Reset</button>
            </div>

            <div class="search-group">
                <input type="text" v-model="quickFilter" placeholder="Search by OrderCode or Status" />
                <button class="export-button" @click="exportToExcel">Export Excel</button>
            </div>
        </div>

        <!-- AG Grid -->
        <div class="ag-theme-alpine" style="height: 500px; width: 100%;">
            <ag-grid-vue :rowData="filteredTransactions" :columnDefs="columnDefs" :defaultColDef="defaultColDef"
                :pagination="true" :paginationPageSize="itemsPerPage" :quickFilterText="quickFilter"
                :rowSelection="'multiple'" class="ag-theme-alpine"></ag-grid-vue>
        </div>
    </div>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import { ModuleRegistry } from 'ag-grid-community'; 
import { ClientSideRowModelModule} from "ag-grid-community";
import { utils, writeFile } from "xlsx";
import axios from "axios";


ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default {
    name: "TransactionList",
    components: {
        AgGridVue,
    },
    data() {
        return {
            transactions: [],
            filteredTransactions: [],
            columnDefs: [
                { headerName: "User Info", field: "user.userName", sortable: true, filter: true },
                { headerName: "Order Code", field: "orderCode", sortable: true, filter: true },
                { headerName: "Status", field: "status", sortable: true, filter: true },
                { headerName: "Amount", field: "amount", sortable: true, filter: true },
                { headerName: "Created At", field: "createdAt", sortable: true, filter: true },
                { headerName: "Paid At", field: "paidAt", sortable: true, filter: true },
            ],
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
            },
            filterCreatedFrom: "",
            filterCreatedTo: "",
            filterPaidFrom: "",
            filterPaidTo: "",
            quickFilter: "",
            itemsPerPage: 10,
        };
    },
    watch: {
        filterCreatedFrom: "applyFilters",
        filterCreatedTo: "applyFilters",
        filterPaidFrom: "applyFilters",
        filterPaidTo: "applyFilters",
        quickFilter: "applyFilters",
    },
    mounted() {
        this.fetchTransactions();
    },
    methods: {
        async fetchTransactions() {
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/api/Admin/get-filtered-transactions`
                );
                this.transactions = response.data.transactions || [];
                this.filteredTransactions = [...this.transactions];
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        },
        applyFilters() {
            let filtered = [...this.transactions];


            if (this.filterCreatedFrom && this.filterCreatedTo) {
                const createdFrom = new Date(this.filterCreatedFrom);
                const createdTo = new Date(this.filterCreatedTo);
                filtered = filtered.filter((transaction) => {
                    const createdAt = new Date(transaction.createdAt);
                    return createdAt >= createdFrom && createdAt <= createdTo;
                });
            }


            if (this.filterPaidFrom && this.filterPaidTo) {
                const paidFrom = new Date(this.filterPaidFrom);
                const paidTo = new Date(this.filterPaidTo);
                filtered = filtered.filter((transaction) => {
                    const paidAt = transaction.paidAt ? new Date(transaction.paidAt) : null;
                    return paidAt && paidAt >= paidFrom && paidAt <= paidTo;
                });
            }


            if (this.quickFilter) {
                const query = this.quickFilter.toLowerCase();
                filtered = filtered.filter(
                    (transaction) =>
                        transaction.orderCode.toString().toLowerCase().includes(query) ||
                        transaction.status.toLowerCase().includes(query)
                );
            }

            this.filteredTransactions = filtered;
        },
        resetFilters() {
            this.filterCreatedFrom = "";
            this.filterCreatedTo = "";
            this.filterPaidFrom = "";
            this.filterPaidTo = "";
            this.quickFilter = "";
            this.filteredTransactions = [...this.transactions];
        },
        exportToExcel() {

            const formattedData = this.filteredTransactions.map((transaction) => ({
                "Order Code": transaction.orderCode,
                Status: transaction.status,
                Amount: transaction.amount.toLocaleString() + " VNĐ",
                "Created At": transaction.createdAt,
                "Paid At": transaction.paidAt || "N/A",
                "User Name": transaction.user?.userName || "Unknown",
                "User Email": transaction.user?.email || "N/A",
            }));


            const worksheet = utils.json_to_sheet(formattedData);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "Transactions");
            writeFile(workbook, "Transactions.xlsx");
        },
    },
};
</script>

<style scoped>
.transaction-list {
    position: absolute;
    width: calc(100% - 300px);
    left: 300px;
    min-height: 100vh;
    padding: 20px;
    margin: 0 auto;
    font-family: 'Poppins', sans-serif;
    transition: 0.5s;
    background-color: #f8f9fa;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 600;
    color: #343a40;
}

.filter-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background-color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filter-group,
.search-group {
    display: flex;
    gap: 15px;
}

.filter-item label {
    font-weight: 500;
    color: #495057;
}

.filter-item input {
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    background-color: #fff;
    color: #495057;
}

.reset-button {
    padding: 8px 12px;
    background-color: #f03e3e;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.reset-button:hover {
    background-color: #d63333;
}

.search-group input {
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    flex-grow: 1;
}

.export-button {
    padding: 8px 12px;
    background-color: #228be6;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.export-button:hover {
    background-color: #1971c2;
}

.transaction-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.transaction-table th,
.transaction-table td {
    padding: 12px 15px;
    text-align: left;
    font-size: 14px;
    color: #495057;
}

.transaction-table th {
    background-color: #228be6;
    color: #fff;
    text-transform: uppercase;
    font-weight: 600;
}

.transaction-table tbody tr:nth-child(odd) {
    background-color: #f8f9fa;
}

.transaction-table tbody tr:hover {
    background-color: #e9ecef;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #dee2e6;
}

.user-name {
    font-weight: 500;
    color: #343a40;
}

.user-email {
    font-size: 12px;
    color: #868e96;
}

.pagination {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.pagination button {
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    background-color: #228be6;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
}

.pagination button:disabled {
    background-color: #adb5bd;
    cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
    background-color: #1971c2;
}

.pagination span {
    font-size: 14px;
    font-weight: 500;
    color: #495057;
}

.ag-theme-alpine {
    height: 500px;
    width: 100%;
}
</style>