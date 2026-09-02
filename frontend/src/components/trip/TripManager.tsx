import React, { useState } from 'react';
import { TripList } from './TripList';
import { TripDetail } from './TripDetail';

export const TripManager: React.FC = () => {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  if (selectedTripId) {
    return (
      <TripDetail
        tripId={selectedTripId}
        onBack={() => setSelectedTripId(null)}
      />
    );
  }

  return <TripList onSelectTrip={(id) => setSelectedTripId(id)} />;
};
