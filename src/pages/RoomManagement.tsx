import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, DoorOpen, Bed, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

export default function RoomManagement() {
  const navigate = useNavigate();
  const { rooms, blocks, beds, patients } = useData();
  const [selectedBlock, setSelectedBlock] = useState<string>('all');

  const filteredRooms = selectedBlock === 'all' 
    ? rooms 
    : rooms.filter(r => r.blockId === selectedBlock);

  const getAvailableBedsCount = (roomId: string) => {
    return beds.filter(b => b.roomId === roomId && !b.isOccupied).length;
  };

  const getTotalBedsCount = (roomId: string) => {
    return beds.filter(b => b.roomId === roomId).length;
  };

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.isOccupied).length;
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Room Management</h1>
            <p className="text-muted-foreground">Manage rooms, blocks &amp; beds</p>
          </div>
          <Button onClick={() => navigate('/rooms/allocate')} className="btn-primary">
            <Plus size={18} className="mr-2" />
            Allocate Room
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="card-stat border border-card-border">
            <Building2 size={24} className="text-primary" />
            <span className="text-2xl font-bold">{blocks.length}</span>
            <span className="text-xs text-muted-foreground">Blocks</span>
          </div>
          <div className="card-stat border border-card-border">
            <DoorOpen size={24} className="text-secondary" />
            <span className="text-2xl font-bold">{rooms.length}</span>
            <span className="text-xs text-muted-foreground">Rooms</span>
          </div>
          <div className="card-stat border border-card-border">
            <Bed size={24} className="text-success" />
            <span className="text-2xl font-bold">{availableBeds}/{totalBeds}</span>
            <span className="text-xs text-muted-foreground">Beds Free</span>
          </div>
        </div>

        {/* Block Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedBlock('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              selectedBlock === 'all' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
            }`}
          >
            All Blocks
          </button>
          {blocks.map(block => (
            <button
              key={block.id}
              onClick={() => setSelectedBlock(block.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedBlock === block.id ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
              }`}
            >
              {block.name}
            </button>
          ))}
        </div>

        {/* Rooms List */}
        <div className="space-y-4">
          {filteredRooms.map(room => {
            const roomBeds = beds.filter(b => b.roomId === room.id);
            const availableCount = getAvailableBedsCount(room.id);
            const totalCount = getTotalBedsCount(room.id);
            
            return (
              <div key={room.id} className="card-medical">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Room {room.roomNumber}</h3>
                    <p className="text-sm text-muted-foreground">{room.blockName} • Floor {room.floor}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge-${availableCount > 0 ? 'success' : 'warning'}`}>
                      {availableCount}/{totalCount} Available
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{room.roomType}</p>
                  </div>
                </div>

                {/* Beds */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {roomBeds.map(bed => (
                    <div 
                      key={bed.id}
                      className={`p-3 rounded-xl border-2 ${
                        bed.isOccupied 
                          ? 'border-destructive/30 bg-destructive/5' 
                          : 'border-success/30 bg-success/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Bed size={16} className={bed.isOccupied ? 'text-destructive' : 'text-success'} />
                        <span className="font-medium">Bed {bed.bedNumber}</span>
                      </div>
                      {bed.isOccupied && bed.patientName && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {bed.patientName}
                        </p>
                      )}
                      {!bed.isOccupied && (
                        <p className="text-xs text-success mt-1">Available</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Patients Needing Rooms */}
        <div>
          <h2 className="text-lg font-bold mb-4">Patients Without Rooms</h2>
          <div className="space-y-3">
            {patients.filter(p => p.status !== 'discharged' && !p.roomId).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">All patients have been assigned rooms</p>
            ) : (
              patients.filter(p => p.status !== 'discharged' && !p.roomId).map(patient => (
                <div key={patient.id} className="card-medical flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{patient.fullName}</h4>
                    <p className="text-sm text-muted-foreground">{patient.age} years • {patient.gender}</p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/rooms/allocate/${patient.id}`)}
                  >
                    Assign Room
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
