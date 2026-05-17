import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, DoorOpen, Bed } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

export default function AllocateRoom() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients, rooms, blocks, beds, assignRoom } = useData();
  
  const [selectedPatient, setSelectedPatient] = useState(patientId || '');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedBed, setSelectedBed] = useState('');

  const unassignedPatients = patients.filter(p => !p.roomId && p.status !== 'discharged');
  const filteredRooms = selectedBlock ? rooms.filter(r => r.blockId === selectedBlock) : rooms;
  const availableBeds = selectedRoom ? beds.filter(b => b.roomId === selectedRoom && !b.isOccupied) : [];

  const handleAllocate = () => {
    if (!selectedPatient || !selectedRoom || !selectedBed) {
      toast.error('Please select all required fields');
      return;
    }

    assignRoom(selectedPatient, selectedRoom, selectedBed);
    toast.success('Room allocated successfully!');
    navigate('/rooms');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-6">Allocate Room</h1>

        <div className="space-y-6">
          {/* Select Patient */}
          <div className="card-medical">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
              Select Patient
            </h3>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="input-medical"
            >
              <option value="">Choose a patient</option>
              {unassignedPatients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName} - {patient.age} years, {patient.gender}
                </option>
              ))}
            </select>
          </div>

          {/* Select Block */}
          <div className="card-medical">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
              Select Block
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {blocks.map(block => (
                <button
                  key={block.id}
                  onClick={() => {
                    setSelectedBlock(block.id);
                    setSelectedRoom('');
                    setSelectedBed('');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedBlock === block.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-card-border hover:border-primary/50'
                  }`}
                >
                  <Building2 size={24} className={selectedBlock === block.id ? 'text-primary' : 'text-muted-foreground'} />
                  <p className="font-medium mt-2">{block.name}</p>
                  <p className="text-xs text-muted-foreground">{block.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Select Room */}
          {selectedBlock && (
            <div className="card-medical animate-fade-in">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                Select Room
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredRooms.map(room => {
                  const roomBeds = beds.filter(b => b.roomId === room.id);
                  const availableCount = roomBeds.filter(b => !b.isOccupied).length;
                  
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        if (availableCount > 0) {
                          setSelectedRoom(room.id);
                          setSelectedBed('');
                        }
                      }}
                      disabled={availableCount === 0}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedRoom === room.id 
                          ? 'border-primary bg-primary/10' 
                          : availableCount === 0
                          ? 'border-muted bg-muted/20 opacity-50 cursor-not-allowed'
                          : 'border-card-border hover:border-primary/50'
                      }`}
                    >
                      <DoorOpen size={24} className={selectedRoom === room.id ? 'text-primary' : 'text-muted-foreground'} />
                      <p className="font-medium mt-2">Room {room.roomNumber}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {room.roomType} • Floor {room.floor}
                      </p>
                      <p className={`text-xs mt-1 ${availableCount > 0 ? 'text-success' : 'text-destructive'}`}>
                        {availableCount} beds available
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Select Bed */}
          {selectedRoom && availableBeds.length > 0 && (
            <div className="card-medical animate-fade-in">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
                Select Bed
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableBeds.map(bed => (
                  <button
                    key={bed.id}
                    onClick={() => setSelectedBed(bed.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedBed === bed.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-success/30 bg-success/5 hover:border-primary/50'
                    }`}
                  >
                    <Bed size={24} className={selectedBed === bed.id ? 'text-primary' : 'text-success'} />
                    <p className="font-medium mt-2">Bed {bed.bedNumber}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button 
            onClick={handleAllocate}
            className="w-full btn-primary"
            disabled={!selectedPatient || !selectedRoom || !selectedBed}
          >
            Allocate Room
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
