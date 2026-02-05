import { Vehicle, VehicleSchema } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 26 most popular vehicle makes in North America
const COMMON_MAKES = [
  'Acura',
  'Audi',
  'BMW',
  'Buick',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Dodge',
  'Ford',
  'GMC',
  'Honda',
  'Hyundai',
  'Jeep',
  'Kia',
  'Lexus',
  'Mazda',
  'Mercedes-Benz',
  'Nissan',
  'Ram',
  'Subaru',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
  'Other',
] as const;

interface VehicleSearchProps {
  initialVehicle?: Vehicle;
  onSelect: (vehicle: Vehicle) => void;
  onCancel?: () => void;
}

/**
 * Vehicle search form with make suggestions
 * Uses react-hook-form with Zod validation
 */
export function VehicleSearch({ initialVehicle, onSelect, onCancel }: VehicleSearchProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Vehicle>({
    resolver: zodResolver(VehicleSchema),
    defaultValues: initialVehicle,
  });

  const onSubmit = (data: Vehicle) => {
    onSelect(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="make">Make</Label>
        <Input
          id="make"
          list="make-suggestions"
          placeholder="e.g. Toyota"
          {...register('make')}
          aria-invalid={errors.make ? 'true' : 'false'}
        />
        <datalist id="make-suggestions">
          {COMMON_MAKES.map((make) => (
            <option key={make} value={make} />
          ))}
        </datalist>
        {errors.make && (
          <p className="text-sm text-red-500">{errors.make.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          placeholder="e.g. Camry"
          {...register('model')}
          aria-invalid={errors.model ? 'true' : 'false'}
        />
        {errors.model && (
          <p className="text-sm text-red-500">{errors.model.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Year</Label>
        <Input
          id="year"
          type="number"
          placeholder="e.g. 2020"
          {...register('year', { valueAsNumber: true })}
          aria-invalid={errors.year ? 'true' : 'false'}
        />
        {errors.year && (
          <p className="text-sm text-red-500">{errors.year.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Confirm Vehicle
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
