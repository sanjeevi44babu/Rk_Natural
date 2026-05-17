import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import api from "@/lib/api";
import { Patient, Appointment, User, HealthRecord, UserRole, Room } from "@/types";

interface DataContextType {
  patients: Patient[];
  appointments: Appointment[];
  users: User[];
  healthRecords: HealthRecord[];
  rooms: Room[];
  blocks: any[];
  beds: any[];
  fetchAllData: () => Promise<void>;
  addPatient: (data: Partial<Patient>) => Promise<Patient>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  approveUser: (id: string) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  addHealthRecord: (data: Partial<HealthRecord>) => Promise<void>;
  dischargePatient: (id: string) => Promise<void>;
  addAppointment: (data: Partial<Appointment>) => Promise<void>;
  addUser: (data: any) => Promise<User>;
  assignRoom: (patientId: string, roomId: string, bedId: string) => Promise<void>;
  addRoom: (data: Partial<Room>) => Promise<void>;
  getAvailableBeds: () => { id: string; name: string }[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [blocks, setBlocks] = useState<any[]>([
    { id: 'b1', name: 'Main Block', description: 'Primary Care' },
    { id: 'b2', name: 'Emergency Block', description: 'Critical Care' }
  ]);
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'r1', roomNumber: '1', blockId: 'b1', blockName: 'Main Block', floor: 1, roomType: 'general', isActive: true, beds: [] },
    { id: 'r2', roomNumber: '2', blockId: 'b1', blockName: 'Main Block', floor: 1, roomType: 'general', isActive: true, beds: [] },
    { id: 'r3', roomNumber: '3', blockId: 'b1', blockName: 'Main Block', floor: 1, roomType: 'private', isActive: true, beds: [] },
    { id: 'r4', roomNumber: '4', blockId: 'b2', blockName: 'Emergency Block', floor: 1, roomType: 'icu', isActive: true, beds: [] },
  ]);
  const [beds, setBeds] = useState<any[]>([
    { id: 'bd1', bedNumber: '1A', roomId: 'r1', isOccupied: false },
    { id: 'bd2', bedNumber: '1B', roomId: 'r1', isOccupied: false },
    { id: 'bd3', bedNumber: '2A', roomId: 'r2', isOccupied: true, patientName: 'John Doe' },
    { id: 'bd4', bedNumber: '3A', roomId: 'r3', isOccupied: false },
    { id: 'bd5', bedNumber: '4A', roomId: 'r4', isOccupied: true, patientName: 'Jane Smith' },
  ]);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const [patientsData, appointmentsData, usersData, healthRecordsData] = await Promise.all([
        api.apiGet<Patient[]>("/patients"),
        api.apiGet<Appointment[]>("/appointments"),
        api.apiGet<User[]>("/auth/users"),
        api.apiGet<HealthRecord[]>("/health-records"),
      ]);

      setPatients((patientsData || []).map(p => ({ ...p, id: p.id || (p as any)._id })));
      setAppointments((appointmentsData || []).map(a => ({ ...a, id: a.id || (a as any)._id })));
      setUsers((usersData || []).map(u => ({ 
        ...u, 
        id: u.id || (u as any)._id,
        role: (u.role || '').toLowerCase() as UserRole
      })));
      setHealthRecords((healthRecordsData || []).map(hr => ({ ...hr, id: hr.id || (hr as any)._id })));
    } catch (err: any) {
      console.error("Failed to fetch data:", err.message || err);
    }
  };

  const addPatient = async (data: Partial<Patient>) => {
    try {
      const newPatient = await api.apiPost<Patient>("/patients", data);
      const normalizedNewPatient = { ...newPatient, id: newPatient.id || (newPatient as any)._id };
      setPatients(prev => [...prev, normalizedNewPatient]);
      return normalizedNewPatient;
    } catch (err: any) {
      console.error("Add patient failed:", err.message || err);
      throw err;
    }
  };

  const addUser = async (data: any) => {
    try {
      const res = await api.registerRequest(data);
      const newUser = { ...res.user, id: res.user.id || res.user._id, role: res.user.role.toLowerCase() };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err: any) {
      console.error("Add user failed:", err.message || err);
      throw err;
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      await api.updateUserRequest(id, data);
      setUsers(prev => prev.map(u => (u.id === id || (u as any)._id === id ? { ...u, ...data } : u)));
    } catch (err: any) {
      console.error("Update user failed:", err.message || err);
      throw err;
    }
  };

  const approveUser = async (id: string) => {
    await updateUser(id, { isApproved: true });
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    try {
      const updated = await api.apiPut<Appointment>(`/appointments/${id}`, data);
      const normalized = { ...updated, id: updated.id || (updated as any)._id };
      setAppointments(prev => prev.map(a => (a.id === id || (a as any)._id === id ? { ...a, ...normalized } : a)));
    } catch (err: any) {
      console.error("Update appointment failed:", err.message || err);
      throw err;
    }
  };

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    try {
      const updated = await api.apiPut<Patient>(`/patients/${id}`, data);
      const normalized = { ...updated, id: updated.id || (updated as any)._id };
      setPatients(prev => prev.map(p => (p.id === id || (p as any)._id === id ? { ...p, ...normalized } : p)));
    } catch (err: any) {
      console.error("Update patient failed:", err.message || err);
      throw err;
    }
  };

  const addHealthRecord = async (data: Partial<HealthRecord>) => {
    try {
      const newRecord = await api.apiPost<HealthRecord>("/health-records", data);
      const normalized = { ...newRecord, id: newRecord.id || (newRecord as any)._id };
      setHealthRecords(prev => [normalized, ...prev]);
    } catch (err: any) {
      console.error("Add health record failed:", err.message || err);
      throw err;
    }
  };

  const dischargePatient = async (id: string) => {
    await updatePatient(id, { status: 'discharged' });
  };

  const addAppointment = async (data: Partial<Appointment>) => {
    try {
      const newApt = await api.apiPost<Appointment>("/appointments", data);
      const normalized = { ...newApt, id: newApt.id || (newApt as any)._id };
      setAppointments(prev => [...prev, normalized]);
    } catch (err: any) {
      console.error("Add appointment failed:", err.message || err);
      throw err;
    }
  };

  const assignRoom = async (patientId: string, roomId: string, bedId: string) => {
    // Update local state for immediate feedback
    setPatients(prev => prev.map(p => p.id === patientId ? { 
      ...p, 
      roomId, 
      bedNumber: beds.find(b => b.id === bedId)?.bedNumber,
      roomNumber: rooms.find(r => r.id === roomId)?.roomNumber,
      blockName: rooms.find(r => r.id === roomId)?.blockName,
      status: 'admitted' 
    } : p));
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, isOccupied: true, patientName: patients.find(p => p.id === patientId)?.fullName } : b));
  };

  const addRoom = async (data: Partial<Room>) => {
    const newRoom: Room = {
      id: `r${rooms.length + 1}`,
      roomNumber: data.roomNumber || '',
      blockId: data.blockId || '',
      blockName: blocks.find(b => b.id === data.blockId)?.name || '',
      floor: data.floor || 1,
      roomType: data.roomType || 'general',
      isActive: true,
      beds: []
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const getAvailableBeds = () => {
    // This is a simplified logic. In a real app, this would check Room models.
    // For now, let's return some dummy available beds that were likely there before.
    return [
      { id: 'b1', name: 'Room 101, Bed A' },
      { id: 'b2', name: 'Room 102, Bed B' },
      { id: 'b3', name: 'Room 201, Bed A' },
    ];
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) fetchAllData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        patients,
        appointments,
        users,
        healthRecords,
        rooms,
        blocks,
        beds,
        fetchAllData,
        addPatient,
        updateUser,
        approveUser,
        updateAppointment,
        updatePatient,
        addHealthRecord,
        dischargePatient,
        addAppointment,
        addUser,
        assignRoom,
        addRoom,
        getAvailableBeds,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}