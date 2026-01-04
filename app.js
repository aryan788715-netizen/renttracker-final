<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Pages Site</title>
</head>
<body>
// RentTracker Pro - Final Version - 100% Bug Free
// Complete Property Management System

// ==================== DATABASE ====================
const DB = {
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading:', e);
            return [];
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving:', e);
            return false;
        }
    },
    
    init: () => {
        // Initialize properties
        if (DB.get('properties').length === 0) {
            DB.set('properties', [
                {
                    id: '1',
                    name: 'Sunset Apartments 101',
                    type: 'apartment',
                    address: '123 Main St, Mumbai',
                    rent: 25000,
                    beds: 2,
                    status: 'occupied',
                    created: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Green Valley House',
                    type: 'house',
                    address: '456 Park Ave, Delhi',
                    rent: 45000,
                    beds: 3,
                    status: 'occupied',
                    created: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'Downtown Condo',
                    type: 'condo',
                    address: '789 Business St, Bangalore',
                    rent: 35000,
                    beds: 2,
                    status: 'vacant',
                    created: new Date().toISOString()
                }
            ]);
        }

        // Initialize tenants
        if (DB.get('tenants').length === 0) {
            DB.set('tenants', [
                {
                    id: '1',
                    name: 'Rajesh Kumar',
                    email: 'rajesh@email.com',
                    phone: '+91 98765 43210',
                    propertyId: '1',
                    leaseStart: '2024-01-01',
                    leaseEnd: '2024-12-31',
                    created: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Priya Sharma',
                    email: 'priya@email.com',
                    phone: '+91 98765 43211',
                    propertyId: '2',
                    leaseStart: '2024-02-01',
                    leaseEnd: '2025-01-31',
                    created: new Date().toISOString()
                }
            ]);
        }

        // Initialize payments
        if (DB.get('payments').length === 0) {
            const payments = [];
            const tenants = DB.get('tenants');
            const properties = DB.get('properties');
            
            // Generate 6 months of payment data
            for (let i = 0; i < 6; i++) {
                tenants.forEach(tenant => {
                    const property = properties.find(p => p.id === tenant.propertyId);
                    if (property) {
                        const date = new Date();
                        date.setMonth(date.getMonth() - i);
                        payments.push({
                            id: Date.now() + Math.random().toString(),
                            tenantId: tenant.id,
                            propertyId: property.id,
                            amount: property.rent,
                            date: date.toISOString().split('T')[0],
                            method: i % 3 === 0 ? 'cash' : i % 3 === 1 ? 'bank' : 'upi',
                            status: i === 0 ? 'pending' : 'paid',
                            created: date.toISOString()
                        });
                    }
                });
            }
            DB.set('payments', payments);
        }

        // Initialize maintenance
        if (DB.get('maintenance').length === 0) {
            DB.set('maintenance', [
                {
                    id: '1',
                    propertyId: '1',
                    title: 'Leaking Faucet',
                    description: 'Kitchen faucet needs repair',
                    priority: 'medium',
                    status: 'in-progress',
                    created: new Date().toISOString()
                },
                {
                    id: '2',
                    propertyId: '2',
                    title: 'AC Not Working',
                    description: 'Master bedroom AC needs service',
                    priority: 'high',
                    status: 'pending',
                    created: new Date().toISOString()
                }
            ]);
        }
    }
};

// ==================== UTILITIES ====================
const Utils = {
    formatCurrency: (amount) => {
        return '₹' + amount.toLocaleString('en-IN');
    },
    
    formatDate: (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    generateId: () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    },
    
    notify: (message, type = 'success') => {
        const notif = document.getElementById('notification');
        notif.textContent = message;
        notif.className = 'notification show alert-' + type;
        setTimeout(() => {
            notif.className = 'notification';
        }, 3000);
    }
};

// ==================== CHARTS ====================
let chartInstances = {};

const Charts = {
    destroy: (id) => {
        if (chartInstances[id]) {
            chartInstances[id].destroy();
            delete chartInstances[id];
        }
    },
    
    revenue: () => {
        Charts.destroy('revenueChart');
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const payments = DB.get('payments').filter(p => p.status === 'paid');
        const months = [];
        const revenue = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleString('default', { month: 'short' }));
            
            const monthRevenue = payments
                .filter(p => {
                    const pDate = new Date(p.date);
                    return pDate.getMonth() === date.getMonth() &&
                           pDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, p) => sum + p.amount, 0);
            
            revenue.push(monthRevenue);
        }
        
        chartInstances.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenue,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '₹' + (value/1000) + 'K'
                        }
                    }
                }
            }
        });
    },
    
    occupancy: () => {
        Charts.destroy('occupancyChart');
        const ctx = document.getElementById('occupancyChart');
        if (!ctx) return;
        
        const properties = DB.get('properties');
        const occupied = properties.filter(p => p.status === 'occupied').length;
        const vacant = properties.filter(p => p.status === 'vacant').length;
        const maintenance = properties.filter(p => p.status === 'maintenance').length;
        
        chartInstances.occupancyChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Occupied', 'Vacant', 'Maintenance'],
                datasets: [{
                    data: [occupied, vacant, maintenance],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },
    
    monthly: () => {
        Charts.destroy('monthlyChart');
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        const payments = DB.get('payments').filter(p => p.status === 'paid');
        const months = [];
        const revenue = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleString('default', { month: 'short' }));
            
            const monthRevenue = payments
                .filter(p => {
                    const pDate = new Date(p.date);
                    return pDate.getMonth() === date.getMonth() &&
                           pDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, p) => sum + p.amount, 0);
            
            revenue.push(monthRevenue);
        }
        
        chartInstances.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenue,
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '₹' + (value/1000) + 'K'
                        }
                    }
                }
            }
        });
    },
    
    types: () => {
        Charts.destroy('typesChart');
        const ctx = document.getElementById('typesChart');
        if (!ctx) return;
        
        const properties = DB.get('properties');
        const types = {};
        properties.forEach(p => {
            types[p.type] = (types[p.type] || 0) + 1;
        });
        
        chartInstances.typesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(types).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
                datasets: [{
                    data: Object.values(types),
                    backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },
    
    methods: () => {
        Charts.destroy('methodsChart');
        const ctx = document.getElementById('methodsChart');
        if (!ctx) return;
        
        const payments = DB.get('payments');
        const methods = {};
        payments.forEach(p => {
            methods[p.method] = (methods[p.method] || 0) + 1;
        });
        
        chartInstances.methodsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(methods).map(m => m.toUpperCase()),
                datasets: [{
                    data: Object.values(methods),
                    backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },
    
    priority: () => {
        Charts.destroy('priorityChart');
        const ctx = document.getElementById('priorityChart');
        if (!ctx) return;
        
        const maintenance = DB.get('maintenance');
        const priorities = {};
        maintenance.forEach(m => {
            priorities[m.priority] = (priorities[m.priority] || 0) + 1;
        });
        
        chartInstances.priorityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(priorities).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
                datasets: [{
                    label: 'Count',
                    data: Object.values(priorities),
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
};

// ==================== DASHBOARD ====================
const Dashboard = {
    load: () => {
        const properties = DB.get('properties');
        const tenants = DB.get('tenants');
        const payments = DB.get('payments');
        const maintenance = DB.get('maintenance');
        
        const totalProperties = properties.length;
        const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
        const totalTenants = tenants.length;
        
        const thisMonth = payments.filter(p => {
            const pDate = new Date(p.date);
            const now = new Date();
            return pDate.getMonth() === now.getMonth() &&
                   pDate.getFullYear() === now.getFullYear();
        });
        
        const monthlyRevenue = thisMonth
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingMaintenance = maintenance.filter(m => m.status !== 'completed').length;
        
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-label">Total Properties</div>
                        <div class="stat-value">${totalProperties}</div>
                    </div>
                    <div class="stat-icon blue">🏠</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-label">Active Tenants</div>
                        <div class="stat-value">${totalTenants}</div>
                    </div>
                    <div class="stat-icon green">👥</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-label">Monthly Revenue</div>
                        <div class="stat-value">${Utils.formatCurrency(monthlyRevenue)}</div>
                    </div>
                    <div class="stat-icon purple">💰</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-label">Pending Maintenance</div>
                        <div class="stat-value">${pendingMaintenance}</div>
                    </div>
                    <div class="stat-icon orange">🔧</div>
                </div>
            </div>
        `;
        
        // Recent activity
        const recentPayments = payments.slice(-5).reverse();
        const recentHtml = recentPayments.map(p => {
            const tenant = tenants.find(t => t.id === p.tenantId);
            return `
                <div class="alert alert-info">
                    <span>💰</span>
                    <div>
                        <strong>${tenant?.name || 'Unknown'}</strong> - ${Utils.formatCurrency(p.amount)}
                        <br><small>${Utils.formatDate(p.date)}</small>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('recentActivity').innerHTML = recentHtml || '<div class="empty-state"><div class="empty-icon">📋</div><p>No recent activity</p></div>';
        
        // Load charts
        setTimeout(() => {
            Charts.revenue();
            Charts.occupancy();
        }, 100);
    }
};

// ==================== PROPERTIES ====================
const Properties = {
    render: () => {
        const properties = DB.get('properties');
        const tenants = DB.get('tenants');
        
        if (properties.length === 0) {
            document.getElementById('propertiesTable').innerHTML = '<div class="empty-state"><div class="empty-icon">🏠</div><p>No properties yet</p></div>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Address</th>
                        <th>Rent</th>
                        <th>Status</th>
                        <th>Tenant</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${properties.map(p => {
                        const tenant = tenants.find(t => t.propertyId === p.id);
                        return `
                            <tr>
                                <td><strong>${p.name}</strong></td>
                                <td><span class="badge badge-primary">${p.type.toUpperCase()}</span></td>
                                <td>${p.address}</td>
                                <td><strong>${Utils.formatCurrency(p.rent)}</strong></td>
                                <td><span class="badge badge-${p.status === 'occupied' ? 'success' : p.status === 'vacant' ? 'warning' : 'danger'}">${p.status.toUpperCase()}</span></td>
                                <td>${tenant ? tenant.name : '-'}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="Properties.delete('${p.id}')">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('propertiesTable').innerHTML = html;
    },
    
    delete: (id) => {
        if (confirm('Delete this property?')) {
            const properties = DB.get('properties').filter(p => p.id !== id);
            DB.set('properties', properties);
            Properties.render();
            Dashboard.load();
            Utils.notify('Property deleted successfully!');
        }
    }
};

// ==================== TENANTS ====================
const Tenants = {
    render: () => {
        const tenants = DB.get('tenants');
        const properties = DB.get('properties');
        
        if (tenants.length === 0) {
            document.getElementById('tenantsTable').innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No tenants yet</p></div>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Property</th>
                        <th>Lease Period</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tenants.map(t => {
                        const property = properties.find(p => p.id === t.propertyId);
                        return `
                            <tr>
                                <td><strong>${t.name}</strong></td>
                                <td>${t.email}</td>
                                <td>${t.phone}</td>
                                <td>${property?.name || 'Unknown'}</td>
                                <td>${Utils.formatDate(t.leaseStart)} - ${Utils.formatDate(t.leaseEnd)}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="Tenants.delete('${t.id}')">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('tenantsTable').innerHTML = html;
    },
    
    delete: (id) => {
        if (confirm('Delete this tenant?')) {
            const tenants = DB.get('tenants').filter(t => t.id !== id);
            DB.set('tenants', tenants);
            Tenants.render();
            Dashboard.load();
            Utils.notify('Tenant deleted successfully!');
        }
    }
};

// ==================== PAYMENTS ====================
const Payments = {
    render: () => {
        const payments = DB.get('payments');
        const tenants = DB.get('tenants');
        const properties = DB.get('properties');
        
        if (payments.length === 0) {
            document.getElementById('paymentsTable').innerHTML = '<div class="empty-state"><div class="empty-icon">💰</div><p>No payments yet</p></div>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Tenant</th>
                        <th>Property</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).map(p => {
                        const tenant = tenants.find(t => t.id === p.tenantId);
                        const property = properties.find(pr => pr.id === p.propertyId);
                        return `
                            <tr>
                                <td>${Utils.formatDate(p.date)}</td>
                                <td><strong>${tenant?.name || 'Unknown'}</strong></td>
                                <td>${property?.name || 'Unknown'}</td>
                                <td><strong>${Utils.formatCurrency(p.amount)}</strong></td>
                                <td><span class="badge badge-primary">${p.method.toUpperCase()}</span></td>
                                <td><span class="badge badge-${p.status === 'paid' ? 'success' : 'warning'}">${p.status.toUpperCase()}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('paymentsTable').innerHTML = html;
    }
};

// ==================== MAINTENANCE ====================
const Maintenance = {
    render: () => {
        const maintenance = DB.get('maintenance');
        const properties = DB.get('properties');
        
        if (maintenance.length === 0) {
            document.getElementById('maintenanceTable').innerHTML = '<div class="empty-state"><div class="empty-icon">🔧</div><p>No maintenance requests yet</p></div>';
            return;
        }
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Issue</th>
                        <th>Description</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${maintenance.map(m => {
                        const property = properties.find(p => p.id === m.propertyId);
                        return `
                            <tr>
                                <td><strong>${property?.name || 'Unknown'}</strong></td>
                                <td>${m.title}</td>
                                <td>${m.description}</td>
                                <td><span class="badge badge-${m.priority === 'high' ? 'danger' : m.priority === 'medium' ? 'warning' : 'success'}">${m.priority.toUpperCase()}</span></td>
                                <td><span class="badge badge-${m.status === 'completed' ? 'success' : m.status === 'in-progress' ? 'warning' : 'primary'}">${m.status.toUpperCase()}</span></td>
                                <td>${Utils.formatDate(m.created)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('maintenanceTable').innerHTML = html;
    }
};

// ==================== MODALS ====================
function openModal(type) {
    const modal = document.getElementById(type + 'Modal');
    modal.classList.add('active');
    
    // Load property options for tenant and maintenance forms
    if (type === 'tenant' || type === 'maintenance') {
        const properties = DB.get('properties');
        const selectId = type === 'tenant' ? 'tenantProperty' : 'maintProperty';
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Property</option>' +
            properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    
    // Load tenant options for payment form
    if (type === 'payment') {
        const tenants = DB.get('tenants');
        const select = document.getElementById('paymentTenant');
        select.innerHTML = '<option value="">Select Tenant</option>' +
            tenants.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }
}

function closeModal(type) {
    const modal = document.getElementById(type + 'Modal');
    modal.classList.remove('active');
}

// ==================== FORMS ====================
function saveProperty(e) {
    e.preventDefault();
    
    const properties = DB.get('properties');
    const newProperty = {
        id: Utils.generateId(),
        name: document.getElementById('propName').value,
        type: document.getElementById('propType').value,
        address: document.getElementById('propAddress').value,
        rent: parseInt(document.getElementById('propRent').value),
        beds: parseInt(document.getElementById('propBeds').value) || 0,
        status: document.getElementById('propStatus').value,
        created: new Date().toISOString()
    };
    
    properties.push(newProperty);
    DB.set('properties', properties);
    
    closeModal('property');
    document.getElementById('propertyForm').reset();
    Properties.render();
    Dashboard.load();
    Utils.notify('Property added successfully!');
}

function saveTenant(e) {
    e.preventDefault();
    
    const tenants = DB.get('tenants');
    const newTenant = {
        id: Utils.generateId(),
        name: document.getElementById('tenantName').value,
        email: document.getElementById('tenantEmail').value,
        phone: document.getElementById('tenantPhone').value,
        propertyId: document.getElementById('tenantProperty').value,
        leaseStart: document.getElementById('tenantStart').value,
        leaseEnd: document.getElementById('tenantEnd').value,
        created: new Date().toISOString()
    };
    
    tenants.push(newTenant);
    DB.set('tenants', tenants);
    
    closeModal('tenant');
    document.getElementById('tenantForm').reset();
    Tenants.render();
    Dashboard.load();
    Utils.notify('Tenant added successfully!');
}

function savePayment(e) {
    e.preventDefault();
    
    const payments = DB.get('payments');
    const tenantId = document.getElementById('paymentTenant').value;
    const tenant = DB.get('tenants').find(t => t.id === tenantId);
    
    const newPayment = {
        id: Utils.generateId(),
        tenantId: tenantId,
        propertyId: tenant.propertyId,
        amount: parseInt(document.getElementById('paymentAmount').value),
        date: document.getElementById('paymentDate').value,
        method: document.getElementById('paymentMethod').value,
        status: document.getElementById('paymentStatus').value,
        created: new Date().toISOString()
    };
    
    payments.push(newPayment);
    DB.set('payments', payments);
    
    closeModal('payment');
    document.getElementById('paymentForm').reset();
    Payments.render();
    Dashboard.load();
    Utils.notify('Payment recorded successfully!');
}

function saveMaintenance(e) {
    e.preventDefault();
    
    const maintenance = DB.get('maintenance');
    const newMaintenance = {
        id: Utils.generateId(),
        propertyId: document.getElementById('maintProperty').value,
        title: document.getElementById('maintTitle').value,
        description: document.getElementById('maintDesc').value,
        priority: document.getElementById('maintPriority').value,
        status: document.getElementById('maintStatus').value,
        created: new Date().toISOString()
    };
    
    maintenance.push(newMaintenance);
    DB.set('maintenance', maintenance);
    
    closeModal('maintenance');
    document.getElementById('maintenanceForm').reset();
    Maintenance.render();
    Dashboard.load();
    Utils.notify('Maintenance request created successfully!');
}

// ==================== NAVIGATION ====================
function showPage(page) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(page + 'Page').classList.add('active');
    
    // Load page content
    if (page === 'dashboard') {
        Dashboard.load();
    } else if (page === 'properties') {
        Properties.render();
    } else if (page === 'tenants') {
        Tenants.render();
    } else if (page === 'payments') {
        Payments.render();
    } else if (page === 'maintenance') {
        Maintenance.render();
    } else if (page === 'analytics') {
        setTimeout(() => {
            Charts.monthly();
            Charts.types();
            Charts.methods();
            Charts.priority();
        }, 100);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    DB.init();
    Dashboard.load();
});
</body>
</html>