import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, DoorOpen, Bed, Users, Plus, 
  Search, Filter, LayoutDashboard, ArrowRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

export default function ManagementDashboard() {
  const navigate = useNavigate();
  const { rooms, blocks, beds, patients, users, addRoom } = useData();
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    roomNumber: '',
    blockId: '',
    floor: 1,
    roomType: 'general' as any
  });

  const filteredRooms = rooms.filter(room => {
    const matchesBlock = selectedBlock === 'all' || room.blockId === selectedBlock;
    const matchesSearch = room.roomNumber.toString().includes(search) || 
                         room.blockName.toLowerCase().includes(search.toLowerCase());
    return matchesBlock && matchesSearch;
  });

  const getAvailableBedsCount = (roomId: string) => {
    return beds.filter(b => b.roomId === roomId && !b.isOccupied).length;
  };

  const getTotalBedsCount = (roomId: string) => {
    return beds.filter(b => b.roomId === roomId).length;
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="text-primary" />
              Management Dashboard
            </h1>
            <p className="text-muted-foreground">Comprehensive facility and resource management</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/users')} variant="outline" size="sm">
              <Users size={16} className="mr-2" />
              Manage All Users
            </Button>
            <Button onClick={() => navigate('/rooms/allocate')} className="btn-primary" size="sm">
              <Plus size={16} className="mr-2" />
              Allocate Room
            </Button>
          </div>
        </div>

        {/* Add Room Section */}
        {isAddingRoom && (
          <div className="card-medical border-2 border-primary/20 bg-primary/5 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="text-primary" />
                Add New Room
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingRoom(false)}>
                Close
              </Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              addRoom(newRoomData);
              setIsAddingRoom(false);
              setNewRoomData({ roomNumber: '', blockId: '', floor: 1, roomType: 'general' });
            }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Room Number</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. 105" 
                  className="input-medical"
                  value={newRoomData.roomNumber}
                  onChange={(e) => setNewRoomData(prev => ({ ...prev, roomNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Block</label>
                <select 
                  required
                  className="input-medical"
                  value={newRoomData.blockId}
                  onChange={(e) => setNewRoomData(prev => ({ ...prev, blockId: e.target.value }))}
                >
                  <option value="">Select Block</option>
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Floor</label>
                <input 
                  required
                  type="number" 
                  className="input-medical"
                  value={newRoomData.floor}
                  onChange={(e) => setNewRoomData(prev => ({ ...prev, floor: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Room Type</label>
                <select 
                  className="input-medical"
                  value={newRoomData.roomType}
                  onChange={(e) => setNewRoomData(prev => ({ ...prev, roomType: e.target.value as any }))}
                >
                  <option value="general">General</option>
                  <option value="private">Private</option>
                  <option value="icu">ICU</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" className="btn-primary px-8">Create Room</Button>
              </div>
            </form>
          </div>
        )}

        {/* Room Selection Section - HIGH VISIBILITY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Building2 size={22} className="text-secondary" />
              Room Selection
            </h2>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              Total Rooms Added: {rooms.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-sm bg-success/20 border border-success/40" /> Available
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" /> Full
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card-medical p-4 space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search rooms..." 
                    className="input-medical pl-10 text-sm h-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Blocks</label>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedBlock('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBlock === 'all' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent'
                      }`}
                    >
                      All Blocks
                    </button>
                    {blocks.map(block => (
                      <button
                        key={block.id}
                        onClick={() => setSelectedBlock(block.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedBlock === block.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent'
                        }`}
                      >
                        {block.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms List (Single Column) */}
            <div className="lg:col-span-3 space-y-3">
                {filteredRooms.map(room => {
                  const availableCount = getAvailableBedsCount(room.id);
                  const totalCount = getTotalBedsCount(room.id);
                  const isFull = availableCount === 0;

                  return (
                    <button
                      key={room.id}
                      onClick={() => navigate('/rooms')}
                      className={`w-full group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        isFull
                          ? 'border-destructive/20 bg-destructive/5 hover:border-destructive'
                          : 'border-success/20 bg-success/5 hover:border-success'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${isFull ? 'bg-destructive/10' : 'bg-success/10'}`}>
                        <DoorOpen size={22} className={isFull ? 'text-destructive' : 'text-success'} />
                      </div>

                      {/* Room info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base leading-tight">Room {room.roomNumber}</h3>
                        <p className="text-xs text-muted-foreground">{room.blockName} &bull; Floor {room.floor} &bull; <span className="capitalize">{room.roomType}</span></p>
                      </div>

                      {/* Bed Summary */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isFull ? 'text-destructive' : 'text-success'}`}>
                            {availableCount}/{totalCount} Free
                          </p>
                          <p className="text-xs text-muted-foreground">Beds</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded-full ${
                          isFull ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                        }`}>
                          {isFull ? 'Full' : 'Available'}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Add Room Button */}
                <button
                  onClick={() => setIsAddingRoom(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-accent hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-accent group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Plus size={16} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Add Room</span>
                </button>

              {filteredRooms.length === 0 && (
                <div className="text-center py-12 bg-accent/30 rounded-3xl border-2 border-dashed border-accent">
                  <Building2 size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">No rooms found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
           <div 
             className="card-medical p-6 cursor-pointer hover:border-primary transition-all group"
             onClick={() => navigate('/users')}
           >
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                 <Users size={24} />
               </div>
               <div>
                  <h3 className="font-bold">Staff Management</h3>
                  <p className="text-sm text-muted-foreground">Manage all user roles and permissions</p>
               </div>
             </div>
           </div>
           
           <div 
             className="card-medical p-6 cursor-pointer hover:border-secondary transition-all group"
             onClick={() => navigate('/rooms')}
           >
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                 <DoorOpen size={24} />
               </div>
               <div>
                  <h3 className="font-bold">Bed Allocation</h3>
                  <p className="text-sm text-muted-foreground">Detailed bed tracking and status</p>
               </div>
             </div>
           </div>

           <div className="card-medical p-6 opacity-60 cursor-not-allowed">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                 <Filter size={24} />
               </div>
               <div>
                  <h3 className="font-bold">Inventory (Coming Soon)</h3>
                  <p className="text-sm text-muted-foreground">Manage facility supplies</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
