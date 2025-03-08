import React from 'react';
import { Event } from '../../types/calendar';
import { cn } from '../../utils/cn';
import { getEventColorStyles } from '../../utils/eventColors';

interface ProcessedEvent extends Event {
  weekStartDay: number;
  weekEndDay: number;
  isFirstWeek: boolean;
  isLastWeek: boolean;
}

interface MultiDayEventLayerProps {
  eventsByWeek: Record<string, ProcessedEvent[]>;
  getRowOffset: (rowIndex: number) => number;
  rowHeights: number[];
}

export const MultiDayEventLayer: React.FC<MultiDayEventLayerProps> = ({ 
  eventsByWeek, 
  getRowOffset,
  rowHeights
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      {Object.entries(eventsByWeek).map(([weekKey, weekEvents]) => {
        const rowIndex = parseInt(weekKey.split('-')[1]);
        const topOffset = getRowOffset(rowIndex);
        
        return (
          <div 
            key={weekKey} 
            className="absolute w-full grid grid-cols-7" 
            style={{ 
              top: `${topOffset}px`,
              height: `${rowHeights[rowIndex] || 96}px`
            }}
          >
            {weekEvents.map(event => {
              const span = event.weekEndDay - event.weekStartDay + 1;
              const { backgroundColor, textColor } = getEventColorStyles(event);
              
              return (
                <div
                  key={`${event.id}-${weekKey}`}
                  className={cn(
                    "absolute h-5 mt-7 flex items-center justify-center pointer-events-auto",
                    {
                      "rounded-l-full": event.isFirstWeek,
                      "rounded-r-full": event.isLastWeek,
                    }
                  )}
                  style={{
                    left: `${(event.weekStartDay / 7) * 100}%`,
                    width: `${(span / 7) * 100}%`,
                    paddingLeft: event.isFirstWeek ? '0.5rem' : '0.25rem',
                    paddingRight: event.isLastWeek ? '0.5rem' : '0.25rem',
                    backgroundColor,
                    color: textColor
                  }}
                  title={event.title}
                >
                  <span className="truncate text-xs font-medium w-full text-center">
                    {event.title}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}; 