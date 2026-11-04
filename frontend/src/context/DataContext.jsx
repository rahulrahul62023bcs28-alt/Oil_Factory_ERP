import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  inventoryService,
  productionService,
  salesService,
  supplierService,
  employeeService
} from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const DataContext = createContext();

const INITIAL_INVENTORY = [
  { id: 1, name: 'Groundnut Oil', currentLiters: 0, capacityLiters: 10000, minAlert: 1000 },
  { id: 2, name: 'Sunflower Oil', currentLiters: 0, capacityLiters: 8000, minAlert: 800 },
  { id: 3, name: 'Mustard Oil', currentLiters: 0, capacityLiters: 6000, minAlert: 500 },
  { id: 4, name: 'Sesame Oil', currentLiters: 0, capacityLiters: 5000, minAlert: 400 },
  { id: 5, name: 'Coconut Oil', currentLiters: 0, capacityLiters: 7000, minAlert: 1000 },
];

const INITIAL_PRODUCTION = [];
const INITIAL_SUPPLIERS = [];
const INITIAL_SALES = [];
const INITIAL_EMPLOYEES = [
  {
    id: 'EMP-01',
    name: 'Raghul (Administrator)',
    role: 'Administrator',
    email: 'raghuluma2006@gmail.com'
  }
];

export const DataProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [productionLogs, setProductionLogs] = useState(INITIAL_PRODUCTION);
  const [supplierLogs, setSupplierLogs] = useState(INITIAL_SUPPLIERS);
  const [salesLogs, setSalesLogs] = useState(INITIAL_SALES);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Low Stock Items Filter
  const lowStockAlerts = inventory.filter(item => item.currentLiters <= item.minAlert);

  // Fetch initial data from backend API
  const refreshAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const isStaffUser = user?.role === 'Factory Staff';

      const calls = [
        inventoryService.getInventory(),
        productionService.getLogs(),
        salesService.getLogs(),
        supplierService.getLogs(),
      ];
      // Only Administrator and Factory Manager can request employee records
      if (!isStaffUser && (user?.role === 'Administrator' || user?.role === 'Factory Manager')) {
        calls.push(employeeService.getEmployees());
      }

      const results = await Promise.allSettled(calls);
      const [invRes, prodRes, salesRes, supRes] = results;
      const empRes = results[4];

      if (invRes.status === 'fulfilled' && invRes.value.data?.inventory?.length > 0) {
        setInventory(invRes.value.data.inventory);
      }
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data?.logs)) {
        setProductionLogs(prodRes.value.data.logs);
      }
      if (salesRes.status === 'fulfilled' && Array.isArray(salesRes.value.data?.logs)) {
        setSalesLogs(salesRes.value.data.logs);
      }
      if (supRes.status === 'fulfilled' && Array.isArray(supRes.value.data?.logs)) {
        setSupplierLogs(supRes.value.data.logs);
      }
      if (empRes && empRes.status === 'fulfilled' && Array.isArray(empRes.value.data?.employees)) {
        setEmployees(empRes.value.data.employees);
      } else if (isStaffUser) {
        setEmployees([]);
      }
    } catch (error) {
      console.warn('API sync fallback to local mode:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Re-fetch all data whenever user logs in so latest DB state is reflected
  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated, refreshAllData]);

  // Real-Time Socket.io Synchronization
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsLiveConnected(true);
      refreshAllData();
    };

    const handleDisconnect = () => {
      setIsLiveConnected(false);
    };

    const handleInventorySync = (data) => {
      if (data?.inventory) {
        setInventory(data.inventory);
      }
    };

    const handleInventoryUpdated = (data) => {
      if (data?.item) {
        setInventory(prev => prev.map(inv => (inv.name === data.item.name || inv.id === data.item.id || inv._id === data.item._id) ? data.item : inv));
      }
    };

    const handleProductionAdded = (data) => {
      if (data?.batch) {
        setProductionLogs(prev => {
          if (prev.some(b => b.id === data.batch.id || (b._id && b._id === data.batch._id))) return prev;
          return [data.batch, ...prev];
        });
      }
    };

    const handleSalesAdded = (data) => {
      if (data?.sale) {
        setSalesLogs(prev => {
          if (prev.some(s => s.id === data.sale.id || (s._id && s._id === data.sale._id))) return prev;
          return [data.sale, ...prev];
        });
      }
    };

    const handleSupplierAdded = (data) => {
      if (data?.intake) {
        setSupplierLogs(prev => {
          if (prev.some(sup => sup.id === data.intake.id || (sup._id && sup._id === data.intake._id))) return prev;
          return [data.intake, ...prev];
        });
      }
    };

    const handleEmployeeAdded = (data) => {
      if (user?.role === 'Factory Staff') return;
      if (data?.employee) {
        setEmployees(prev => {
          if (prev.some(e => e.id === data.employee.id || e.email === data.employee.email || (e._id && e._id === data.employee._id))) return prev;
          return [...prev, data.employee];
        });
      }
    };

    const handleEmployeeRemoved = (data) => {
      if (data?.id || data?._id || data?.email) {
        setEmployees(prev => prev.filter(e =>
          e.id !== data.id &&
          e.rawId !== data.id &&
          e._id !== data.id &&
          e._id !== data._id &&
          (!data.email || e.email?.toLowerCase() !== data.email?.toLowerCase())
        ));
      }
    };

    const handleEmployeeUpdated = (data) => {
      if (user?.role === 'Factory Staff') return;
      if (data?.employee) {
        setEmployees(prev =>
          prev.map(emp =>
            (emp.id === data.employee.id || emp.rawId === data.employee.id || emp._id === data.employee._id || (emp.email && emp.email === data.employee.email))
              ? { ...emp, ...data.employee }
              : emp
          )
        );
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('inventory:sync', handleInventorySync);
    socket.on('inventory:updated', handleInventoryUpdated);
    socket.on('production:added', handleProductionAdded);
    socket.on('sales:added', handleSalesAdded);
    socket.on('supplier:added', handleSupplierAdded);
    socket.on('employee:added', handleEmployeeAdded);
    socket.on('employee:removed', handleEmployeeRemoved);
    socket.on('employee:updated', handleEmployeeUpdated);

    if (socket.connected) {
      setIsLiveConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('inventory:sync', handleInventorySync);
      socket.off('inventory:updated', handleInventoryUpdated);
      socket.off('production:added', handleProductionAdded);
      socket.off('sales:added', handleSalesAdded);
      socket.off('supplier:added', handleSupplierAdded);
      socket.off('employee:added', handleEmployeeAdded);
      socket.off('employee:removed', handleEmployeeRemoved);
      socket.off('employee:updated', handleEmployeeUpdated);
    };
  }, [refreshAllData, user?.role]);

  // Action: Add Production Entry & Automatically Increase Inventory Stock
  const addProduction = async ({ oilType, quantityLiters, rawSeedWeightKg, details }) => {
    const qty = Number(quantityLiters);
    const seedKg = Number(rawSeedWeightKg) > 0 ? Number(rawSeedWeightKg) : Math.round(qty * 2.35);

    try {
      const res = await productionService.addBatch({ oilType, quantityLiters: qty, rawSeedWeightKg: seedKg, details });
      if (res.data?.batch) {
        setProductionLogs(prev => {
          if (prev.some(b => b.id === res.data.batch.id || (b._id && b._id === res.data.batch._id))) return prev;
          return [res.data.batch, ...prev];
        });
      }
      if (res.data?.updatedInventory) {
        setInventory(prev => prev.map(item => (item.name === oilType || item.id === res.data.updatedInventory.id) ? res.data.updatedInventory : item));
      }
      return res.data;
    } catch (err) {
      console.warn('Backend production batch sync error (re-syncing):', err.message);
      refreshAllData();
      throw err;
    }
  };

  // Action: Add Sales Entry & Automatically Deduct Inventory Stock
  const addSale = async ({ orderType, buyerName, oilType, quantityLiters, totalAmount }) => {
    const qty = Number(quantityLiters);
    const amt = Number(totalAmount);

    const currentTank = inventory.find(i => i.name === oilType);
    const availableLiters = currentTank ? (currentTank.currentLiters ?? currentTank.current ?? 0) : 0;
    if (availableLiters < qty) {
      throw new Error(`Insufficient inventory for ${oilType}. Current stock is ${availableLiters}L, but ${qty}L was requested.`);
    }

    try {
      const res = await salesService.addSale({ orderType, buyerName, oilType, quantityLiters: qty, totalAmount: amt });
      if (res.data?.sale) {
        setSalesLogs(prev => {
          if (prev.some(s => s.id === res.data.sale.id || (s._id && s._id === res.data.sale._id))) return prev;
          return [res.data.sale, ...prev];
        });
      }
      if (res.data?.updatedInventory) {
        setInventory(prev => prev.map(item => item.name === oilType ? res.data.updatedInventory : item));
      }
      return res.data;
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // Offline fallback only if stock validation passed
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const offlineSale = {
        id: orderId,
        orderType,
        buyerName,
        oilType,
        quantityLiters: qty,
        totalAmount: amt,
        date: new Date().toISOString().split('T')[0]
      };
      setSalesLogs(prev => [offlineSale, ...prev]);
      setInventory(prev => prev.map(item => {
        if (item.name === oilType) {
          return {
            ...item,
            currentLiters: Math.max(0, (item.currentLiters ?? item.current ?? 0) - qty)
          };
        }
        return item;
      }));
    }
  };

  // Action: Add Supplier Purchase Intake
  const addSupplier = async ({ supplierName, materialItem, quantity, totalCost }) => {
    try {
      const res = await supplierService.addIntake({ supplierName, materialItem, quantity, totalCost });
      if (res.data?.intake) {
        setSupplierLogs(prev => {
          if (prev.some(s => s.id === res.data.intake.id || (s._id && s._id === res.data.intake._id))) return prev;
          return [res.data.intake, ...prev];
        });
      }
      return res.data;
    } catch (err) {
      console.warn('Backend supplier sync error:', err.message);
      refreshAllData();
      throw err;
    }
  };

  // Action: Add Employee (Admin only)
  const addEmployee = async (member) => {
    const cleanEmail = (member.email || '').toLowerCase().trim();
    if (employees.some(e => (e.email || '').toLowerCase().trim() === cleanEmail)) {
      throw new Error(`An employee with email "${member.email}" already exists.`);
    }

    try {
      const res = await employeeService.addEmployee(member);
      if (res.data?.employee) {
        setEmployees(prev => {
          if (prev.some(e => e.id === res.data.employee.id || e.email === cleanEmail || (e._id && e._id === res.data.employee._id))) return prev;
          return [...prev, res.data.employee];
        });
      }
      return res.data?.employee;
    } catch (err) {
      console.error('Backend add employee sync error:', err.response?.data?.message || err.message);
      refreshAllData();
      throw new Error(err.response?.data?.message || err.message || 'Failed to add employee');
    }
  };

  // Action: Remove Employee
  const removeEmployee = async (id) => {
    // 1. Optimistic Local State Update
    setEmployees(prev => prev.filter(e =>
      e.id !== id &&
      e.rawId !== id &&
      e._id !== id &&
      (!e.email || e.email.toLowerCase() !== String(id).toLowerCase())
    ));

    // 2. Call Backend API
    try {
      await employeeService.removeEmployee(id);
    } catch (err) {
      console.error('Backend remove employee sync error:', err.response?.data?.message || err.message);
      refreshAllData();
    }
  };

  // Action: Update Employee Attendance
  const updateAttendance = async (id, attendance) => {
    setEmployees(prev =>
      prev.map(emp => (emp.id === id || emp.rawId === id || emp._id === id) ? { ...emp, attendance } : emp)
    );

    try {
      await employeeService.updateAttendance(id, attendance);
    } catch (err) {
      console.warn('Backend attendance update error:', err.response?.data?.message || err.message);
    }
  };

  return (
    <DataContext.Provider value={{
      inventory,
      lowStockAlerts,
      productionLogs,
      supplierLogs,
      salesLogs,
      employees,
      isLiveConnected,
      isLoading,
      refreshAllData,
      addProduction,
      addSale,
      addSupplier,
      addEmployee,
      removeEmployee,
      updateAttendance
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
