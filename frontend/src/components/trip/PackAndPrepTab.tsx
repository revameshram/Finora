import React, { useState, useEffect } from 'react';
import { 
  Luggage, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Sun, 
  Briefcase, 
  Snowflake, 
  ShieldCheck
} from 'lucide-react';
import { TripDto, TripPackingItemDto, PackingCategory, PackingTemplate } from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';

interface PackAndPrepTabProps {
  trip: TripDto;
  onRefresh: () => void;
}

export const PackAndPrepTab: React.FC<PackAndPrepTabProps> = ({ trip, onRefresh }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<TripPackingItemDto[]>([]);
  const [_loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Manual Add Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<PackingCategory>('ESSENTIALS');
  const [isAdding, setIsAdding] = useState(false);

  const fetchPackingItems = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getPackingItems(
        trip.id, 
        selectedCategory !== 'ALL' ? (selectedCategory as PackingCategory) : undefined
      );
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load packing items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackingItems();
  }, [trip.id, selectedCategory]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsAdding(true);
    try {
      await tripApi.createPackingItem(trip.id, {
        name: newItemName.trim(),
        category: newItemCat,
      });
      setNewItemName('');
      toast.success('Item added to packing list!');
      fetchPackingItems();
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not add item');
    } finally {
      setIsAdding(false);
    }
  };

  const handleTogglePacked = async (itemId: string, currentPacked: boolean) => {
    try {
      await tripApi.togglePackingItem(trip.id, itemId, !currentPacked);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, packed: !currentPacked } : i));
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not update status');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await tripApi.deletePackingItem(trip.id, itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete item');
    }
  };

  const handleSeedTemplate = async (template: PackingTemplate) => {
    try {
      await tripApi.seedPackingTemplate(trip.id, template);
      toast.success(`Seeded template: ${template.replace('_', ' ')}!`);
      fetchPackingItems();
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not seed template');
    }
  };

  const totalPacked = items.filter(i => i.packed).length;
  const packedPct = items.length > 0 ? Math.round((totalPacked / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Quick Add Templates Row (§16.3) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Quick Add Packing Templates
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleSeedTemplate('BASIC_ESSENTIALS')}
            className="p-3 bg-stone-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all group flex items-center gap-2.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">Basic Essentials</h4>
              <p className="text-[10px] text-stone-500">Passports, IDs, power bank</p>
            </div>
          </button>

          <button
            onClick={() => handleSeedTemplate('BEACH_TRIP')}
            className="p-3 bg-stone-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all group flex items-center gap-2.5"
          >
            <Sun className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">Beach & Resort</h4>
              <p className="text-[10px] text-stone-500">Swimwear, sunscreen SPF50</p>
            </div>
          </button>

          <button
            onClick={() => handleSeedTemplate('BUSINESS')}
            className="p-3 bg-stone-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all group flex items-center gap-2.5"
          >
            <Briefcase className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">Business Travel</h4>
              <p className="text-[10px] text-stone-500">Formal wear, laptop adapter</p>
            </div>
          </button>

          <button
            onClick={() => handleSeedTemplate('COLD_WEATHER')}
            className="p-3 bg-stone-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all group flex items-center gap-2.5"
          >
            <Snowflake className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">Cold Weather</h4>
              <p className="text-[10px] text-stone-500">Thermals, parka, boots</p>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Add Item Strip (§16.3) */}
      <form onSubmit={handleAddItem} className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add new item (e.g. Noise-cancelling headphones, travel pillow)..."
          className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-full"
        />

        <select
          value={newItemCat}
          onChange={(e) => setNewItemCat(e.target.value as PackingCategory)}
          className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none w-full sm:w-44"
        >
          <option value="ESSENTIALS">Essentials</option>
          <option value="CLOTHING">Clothing & Wear</option>
          <option value="ELECTRONICS">Electronics</option>
          <option value="DOCUMENTS">Documents</option>
          <option value="MEDICINE">First Aid / Medicine</option>
          <option value="TOILETRIES">Toiletries</option>
          <option value="OTHER">Other</option>
        </select>

        <button
          type="submit"
          disabled={isAdding || !newItemName.trim()}
          className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </form>

      {/* Packing Progress & Category Filter Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'ESSENTIALS', 'CLOTHING', 'ELECTRONICS', 'DOCUMENTS', 'MEDICINE', 'TOILETRIES', 'OTHER'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'ALL' ? 'All Items' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="text-right text-xs self-end sm:self-auto flex items-center gap-2">
          <span className="text-stone-500 font-medium">Packed:</span>
          <span className="font-bold text-stone-900">{totalPacked} of {items.length} ({packedPct}%)</span>
        </div>
      </div>

      {/* Packing Items Grid / List */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        {items.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <Luggage className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <h4 className="text-sm font-bold text-stone-800">Ready to pack?</h4>
            <p className="text-xs text-stone-500 mt-1">
              Select one of the Quick-Add templates above or type your essentials into the input.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleTogglePacked(item.id, item.packed)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  item.packed
                    ? 'bg-stone-50/70 border-stone-200 opacity-60'
                    : 'bg-white border-stone-200 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      item.packed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {item.packed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className={`text-xs font-semibold block ${item.packed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="p-1 text-stone-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
