import { Ruler, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PDMeasurement } from '@/types/face-validation';

interface PDDisplayProps {
  measurement: PDMeasurement | null;
  isReady: boolean;
  className?: string;
}

export function PDDisplay({ measurement, isReady, className }: PDDisplayProps) {
  return (
    <div className={cn("glass-panel rounded-xl p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Pupillary Distance</h3>
      </div>

      {isReady && measurement ? (
        <div className="space-y-3">
          {/* Main PD value */}
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-primary">{measurement.pdMillimeters}</span>
            <span className="text-lg text-muted-foreground">mm</span>
          </div>

          {/* Visual representation */}
          <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="flex items-center justify-between px-2"
                style={{ width: `${Math.min(measurement.pdMillimeters * 1.5, 100)}%` }}
              >
                <Eye className="w-4 h-4 text-primary" />
                <div className="flex-1 mx-2 border-t-2 border-dashed border-primary" />
                <Eye className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground">
            Average adult PD: 54-74mm
          </p>
        </div>
      ) : (
        <div className="py-4 text-center">
          <Eye className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {isReady ? 'Calculating...' : 'Complete all checks to measure PD'}
          </p>
        </div>
      )}
    </div>
  );
}