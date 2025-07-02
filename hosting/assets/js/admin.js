/**
 * OtoKiwi Admin JavaScript
 * cPanel Compatible Version
 */

// Admin Authentication Helper
class AdminAuth {
    static async checkAuth() {
        try {
            const result = await Utils.request('/admin/me');
            return result.success;
        } catch (error) {
            return false;
        }
    }

    static async requireAuth() {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    static async logout() {
        try {
            await Utils.request('/admin/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = 'index.html';
    }
}

// Admin Table Helper
class AdminTable {
    constructor(tableId, options = {}) {
        this.tableId = tableId;
        this.options = {
            pageSize: 10,
            searchable: true,
            sortable: true,
            ...options
        };
        this.currentPage = 1;
        this.totalPages = 1;
        this.sortField = null;
        this.sortOrder = 'asc';
        this.searchTerm = '';
        this.data = [];
        this.filteredData = [];
    }

    setData(data) {
        this.data = data;
        this.filterData();
        this.render();
    }

    filterData() {
        let filtered = [...this.data];

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(item => {
                return Object.values(item).some(value => 
                    String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
                );
            });
        }

        // Apply sorting
        if (this.sortField) {
            filtered.sort((a, b) => {
                let aVal = a[this.sortField];
                let bVal = b[this.sortField];
                
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (this.sortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        this.filteredData = filtered;
        this.totalPages = Math.ceil(filtered.length / this.options.pageSize);
        this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    }

    render() {
        const table = document.getElementById(this.tableId);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.options.pageSize;
        const endIndex = startIndex + this.options.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        // Render rows
        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="100%" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                        Veri bulunamadı
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageData.map(item => this.options.rowRenderer(item)).join('');
        }

        // Update pagination
        this.updatePagination();
    }

    updatePagination() {
        const paginationContainer = document.querySelector(`#${this.tableId}-pagination`);
        if (!paginationContainer) return;

        if (this.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHtml = '<nav><ul class="pagination justify-content-center">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHtml += `<li class="page-item">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">Önceki</a>
            </li>`;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? ' active' : '';
            paginationHtml += `<li class="page-item${activeClass}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        }

        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHtml += `<li class="page-item">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">Sonraki</a>
            </li>`;
        }

        paginationHtml += '</ul></nav>';
        paginationContainer.innerHTML = paginationHtml;

        // Add click events
        paginationContainer.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.render();
                }
            });
        });
    }

    search(term) {
        this.searchTerm = term;
        this.currentPage = 1;
        this.filterData();
        this.render();
    }

    sort(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'asc';
        }
        this.filterData();
        this.render();
    }
}

// Admin Modal Helper
class AdminModal {
    static show(title, content, options = {}) {
        return Swal.fire({
            title: title,
            html: content,
            showCancelButton: true,
            confirmButtonText: options.confirmText || 'Tamam',
            cancelButtonText: options.cancelText || 'İptal',
            customClass: {
                popup: 'swal-wide'
            },
            ...options
        });
    }

    static confirm(title, text, options = {}) {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: options.confirmText || 'Evet',
            cancelButtonText: options.cancelText || 'Hayır',
            confirmButtonColor: options.confirmColor || '#dc3545',
            ...options
        });
    }

    static success(title, text) {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    }

    static error(title, text) {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'error'
        });
    }

    static loading(title, text) {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
}

// Admin Stats Helper
class AdminStats {
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    static updateCard(cardId, value, change = null) {
        const card = document.getElementById(cardId);
        if (!card) return;

        const valueEl = card.querySelector('.card-value');
        const changeEl = card.querySelector('.card-change');

        if (valueEl) {
            valueEl.textContent = this.formatNumber(value);
        }

        if (changeEl && change !== null) {
            const isPositive = change >= 0;
            changeEl.className = `card-change ${isPositive ? 'text-success' : 'text-danger'}`;
            changeEl.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} me-1"></i>
                ${Math.abs(change)}%
            `;
        }
    }

    static animateCard(cardId) {
        const card = document.getElementById(cardId);
        if (!card) return;

        card.style.transform = 'scale(1.05)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 200);
    }
}

// Admin Export Helper
class AdminExport {
    static downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename + '.json');
    }

    static downloadCSV(data, filename, headers = null) {
        if (!data.length) return;

        const csvHeaders = headers || Object.keys(data[0]);
        const csvContent = [
            csvHeaders.join(','),
            ...data.map(row => csvHeaders.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, filename + '.csv');
    }

    static downloadText(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        this.downloadBlob(blob, filename + '.txt');
    }

    static downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Admin Chart Helper
class AdminChart {
    static createLineChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                ...options
            }
        });
    }

    static createBarChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                ...options
            }
        });
    }

    static createPieChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                ...options
            }
        });
    }
}

// Global admin utilities
window.AdminAuth = AdminAuth;
window.AdminTable = AdminTable;
window.AdminModal = AdminModal;
window.AdminStats = AdminStats;
window.AdminExport = AdminExport;
window.AdminChart = AdminChart;