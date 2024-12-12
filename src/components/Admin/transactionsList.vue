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
                <input type="text" v-model="searchQuery" placeholder="Search by OrderCode or Status" />
                <button class="export-button" @click="exportToPDF">Export PDF</button>
            </div>
        </div>

        <!-- Transactions Table -->
        <table class="transaction-table">
            <thead>
                <tr>
                    <th>User Info</th>
                    <th>Order Code</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Created At</th>
                    <th>Paid At</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
                    <td>
                        <div class="user-info">
                            <img :src="transaction.user?.avatarImage || defaultAvatar" alt="Avatar" class="avatar" />
                            <div>
                                <p class="user-name">{{ transaction.user?.userName || "Unknown" }}</p>
                                <p class="user-email">{{ transaction.user?.email || "N/A" }}</p>
                            </div>
                        </div>
                    </td>
                    <td>{{ transaction.orderCode }}</td>
                    <td>{{ transaction.status }}</td>
                    <td>{{ transaction.amount.toLocaleString() }} VNĐ</td>
                    <td>{{ transaction.createdAt }}</td>
                    <td>{{ transaction.paidAt || "N/A" }}</td>
                </tr>
            </tbody>

        </table>

        <!-- Pagination -->
        <div class="pagination">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
        </div>
    </div>
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

export default {
    data() {
        return {
            transactions: [],
            filteredTransactions: [],
            currentPage: 1,
            itemsPerPage: 10,
            filterCreatedFrom: "",
            filterCreatedTo: "",
            filterPaidFrom: "",
            filterPaidTo: "",
            searchQuery: "",
            defaultAvatar: require("../../../public/default-avatar.png"),
        };
    },
    watch: {
        filterCreatedFrom: "applyFilters",
        filterCreatedTo: "applyFilters",
        filterPaidFrom: "applyFilters",
        filterPaidTo: "applyFilters",
        searchQuery: "applyFilters",
    },
    mounted() {
        this.fetchTransactions();
    },
    methods: {
        async fetchTransactions() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/Admin/get-filtered-transactions`);
                this.transactions = response.data.transactions || [];
                this.filteredTransactions = this.transactions;
                console.log(response.data.transactions);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        },
        applyFilters() {
            let filtered = this.transactions;

            // Filter by CreatedAt
            if (this.filterCreatedFrom && this.filterCreatedTo) {
                const createdFrom = new Date(this.filterCreatedFrom);
                const createdTo = new Date(this.filterCreatedTo);
                filtered = filtered.filter((transaction) => {
                    const createdAt = new Date(transaction.createdAt);
                    return createdAt >= createdFrom && createdAt <= createdTo;
                });
            }

            // Filter by PaidAt
            if (this.filterPaidFrom && this.filterPaidTo) {
                const paidFrom = new Date(this.filterPaidFrom);
                const paidTo = new Date(this.filterPaidTo);
                filtered = filtered.filter((transaction) => {
                    const paidAt = transaction.paidAt ? new Date(transaction.paidAt) : null;
                    return paidAt && paidAt >= paidFrom && paidAt <= paidTo;
                });
            }

            // Filter by Search Query
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (transaction) =>
                        transaction.orderCode.toString().toLowerCase().includes(query) ||
                        transaction.status.toLowerCase().includes(query)
                );
            }

            this.filteredTransactions = filtered;
            this.currentPage = 1;
        },
        resetFilters() {
            this.filterCreatedFrom = "";
            this.filterCreatedTo = "";
            this.filterPaidFrom = "";
            this.filterPaidTo = "";
            this.searchQuery = "";
            this.filteredTransactions = this.transactions;
            this.currentPage = 1;
        },
        changePage(page) {
            if (page > 0 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        exportToPDF() {
            const doc = new jsPDF({
                orientation: "landscape", // Xuất file nằm ngang
                unit: "mm",
                format: "a4",
            });

            doc.text("Transaction List", 14, 10);

            const tableColumns = ["Order Code", "Status", "Amount", "Created At", "Paid At", "User Name", "User Email"];
            const tableRows = this.filteredTransactions.map((transaction) => [
                transaction.user?.userName || "Unknown",
                transaction.user?.email || "N/A",
                transaction.orderCode,
                transaction.status,
                transaction.amount.toLocaleString() + " VNĐ",
                transaction.createdAt,
                transaction.paidAt || "N/A",
            ]);

            doc.autoTable({
                startY: 20,
                head: [tableColumns],
                body: tableRows,
                styles: {
                    fontSize: 10, // Giảm kích thước chữ để hiển thị đủ dữ liệu
                    cellPadding: 4,
                },
                headStyles: {
                    fillColor: [34, 139, 230],
                    textColor: [255, 255, 255],
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240],
                },
            });

            doc.save("Transactions_DaiNote.pdf");
        }
    },
    computed: {
        maxCreatedFrom() {
            return this.filterCreatedTo || null;
        },
        maxPaidFrom() {
            return this.filterPaidTo || null;
        },
        totalPages() {
            return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        },
        paginatedTransactions() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredTransactions.slice(start, end);
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
</style>
