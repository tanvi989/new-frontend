import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move, ZoomIn, RotateCw } from 'lucide-react';

interface AdjustmentValues {
  offsetX: number;
  offsetY: number;
  scaleAdjust: number;
  rotationAdjust: number;
}

interface FrameAdjustmentControlsProps {
  values: AdjustmentValues;
  onChange: (values: AdjustmentValues) => void;
  onReset: () => void;
}

export function FrameAdjustmentControls({
  values,
  onChange,
  onReset,
}: FrameAdjustmentControlsProps) {
  const handleChange = (key: keyof AdjustmentValues, value: number) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Fine-tune Adjustment</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Horizontal Position */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Move className="h-3 w-3" />
            Horizontal
          </label>
          <span className="text-xs font-mono text-muted-foreground">
            {values.offsetX > 0 ? '+' : ''}{values.offsetX.toFixed(0)}px
          </span>
        </div>
        <Slider
          value={[values.offsetX]}
          onValueChange={([v]) => handleChange('offsetX', v)}
          min={-50}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Vertical Position */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Move className="h-3 w-3 rotate-90" />
            Vertical
          </label>
          <span className="text-xs font-mono text-muted-foreground">
            {values.offsetY > 0 ? '+' : ''}{values.offsetY.toFixed(0)}px
          </span>
        </div>
        <Slider
          value={[values.offsetY]}
          onValueChange={([v]) => handleChange('offsetY', v)}
          min={-50}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <ZoomIn className="h-3 w-3" />
            Size
          </label>
          <span className="text-xs font-mono text-muted-foreground">
            {(values.scaleAdjust * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          value={[values.scaleAdjust]}
          onValueChange={([v]) => handleChange('scaleAdjust', v)}
          min={0.7}
          max={1.3}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <RotateCw className="h-3 w-3" />
            Rotation
          </label>
          <span className="text-xs font-mono text-muted-foreground">
            {values.rotationAdjust > 0 ? '+' : ''}{values.rotationAdjust.toFixed(1)}°
          </span>
        </div>
        <Slider
          value={[values.rotationAdjust]}
          onValueChange={([v]) => handleChange('rotationAdjust', v)}
          min={-15}
          max={15}
          step={0.5}
          className="w-full"
        />
      </div>
    </div>
  );
}
