import { Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidationCheck } from '@/types/face-validation';

interface ValidationChecklistProps {
  checks: ValidationCheck[];
  className?: string;
}

export function ValidationChecklist({ checks, className }: ValidationChecklistProps) {
  return (
    <div className={cn("glass-panel rounded-xl p-4", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-3">Validation Checks</h3>
      
      <div className="space-y-2">
        {checks.map((check) => (
          <div 
            key={check.id}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
              check.severity === 'pass' && "bg-success/10",
              check.severity === 'fail' && "bg-destructive/10",
              check.severity === 'warning' && "bg-warning/10"
            )}
          >
            {/* Icon */}
            <div className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
              check.severity === 'pass' && "bg-success text-success-foreground",
              check.severity === 'fail' && "bg-destructive text-destructive-foreground",
              check.severity === 'warning' && "bg-warning text-warning-foreground"
            )}>
              {check.severity === 'pass' && <Check className="w-3 h-3" />}
              {check.severity === 'fail' && <X className="w-3 h-3" />}
              {check.severity === 'warning' && <AlertTriangle className="w-3 h-3" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{check.label}</span>
              </div>
              <p className={cn(
                "text-xs truncate",
                check.severity === 'pass' && "text-success",
                check.severity === 'fail' && "text-destructive",
                check.severity === 'warning' && "text-warning"
              )}>
                {check.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}