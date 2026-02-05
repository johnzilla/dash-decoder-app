import { Vehicle, VehicleGuess } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VehicleSearch } from './VehicleSearch';
import { useState } from 'react';

interface VehicleCardProps {
  vehicleGuess: VehicleGuess | null;
  storedVehicle: Vehicle | null;
  onConfirm: (vehicle: Vehicle) => void;
}

/**
 * Vehicle confirmation card
 * Shows AI guess or stored vehicle with confirm/correct options
 */
export function VehicleCard({ vehicleGuess, storedVehicle, onConfirm }: VehicleCardProps) {
  const [showSearch, setShowSearch] = useState(false);

  // If we have a stored vehicle, use it
  const displayVehicle = storedVehicle || (
    vehicleGuess?.make && vehicleGuess?.model && vehicleGuess?.year
      ? {
          make: vehicleGuess.make,
          model: vehicleGuess.model,
          year: vehicleGuess.year,
        }
      : null
  );

  // Show search directly if no vehicle to display
  if (!displayVehicle || showSearch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confirm Your Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleSearch
            initialVehicle={displayVehicle || undefined}
            onSelect={(vehicle) => {
              onConfirm(vehicle);
              setShowSearch(false);
            }}
            onCancel={displayVehicle ? () => setShowSearch(false) : undefined}
          />
        </CardContent>
      </Card>
    );
  }

  // Show vehicle with confirm/correct buttons
  return (
    <Card>
      <CardHeader>
        <CardTitle>Is this your vehicle?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium">
          {displayVehicle.year} {displayVehicle.make} {displayVehicle.model}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onConfirm(displayVehicle)}
            className="flex-1"
          >
            Yes, that's right
          </Button>
          <Button
            onClick={() => setShowSearch(true)}
            variant="outline"
            className="flex-1"
          >
            No
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
